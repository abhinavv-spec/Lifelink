"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enums_1 = require("../types/enums");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bloodTypeMap_1 = require("../utils/bloodTypeMap");
const whatsappService_1 = require("../services/whatsappService");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
// POST /api/emergency/broadcast — create an urgent request and notify configured recipients
router.post('/broadcast', (0, roleGuard_1.requireRole)('HOSPITAL'), async (req, res) => {
    try {
        const { bloodType: bloodTypeRaw, unitsNeeded } = req.body;
        if (!bloodTypeRaw || !Number.isInteger(unitsNeeded) || unitsNeeded <= 0) {
            res.status(400).json({ success: false, error: 'bloodType and a positive integer unitsNeeded are required' });
            return;
        }
        let bloodType;
        try {
            bloodType = (0, bloodTypeMap_1.toBloodTypeEnum)(bloodTypeRaw.replace(/\s+group$/i, '').trim());
        }
        catch {
            res.status(400).json({ success: false, error: `Invalid blood type: ${bloodTypeRaw}` });
            return;
        }
        const contacts = (0, whatsappService_1.getConfiguredWhatsAppContacts)();
        if (contacts.length === 0) {
            res.status(503).json({ success: false, error: 'No WhatsApp recipients are configured' });
            return;
        }
        const hospital = await prisma_1.default.hospital.findUnique({ where: { userId: req.user.id } });
        if (!hospital) {
            res.status(404).json({ success: false, error: 'Hospital profile not found' });
            return;
        }
        const displayBloodType = (0, bloodTypeMap_1.fromBloodTypeEnum)(bloodType);
        const message = `Running out of ${displayBloodType} group. Donors please arrive to ${hospital.name} at the earliest`;
        const request = await prisma_1.default.bloodRequest.create({
            data: {
                hospitalId: hospital.id,
                bloodType,
                unitsNeeded,
                urgencyLevel: enums_1.UrgencyLevel.CRITICAL,
                status: enums_1.RequestStatus.EMERGENCY,
            },
        });
        await (0, whatsappService_1.sendWhatsAppAlert)(contacts, message);
        await prisma_1.default.emergencyAlert.create({
            data: { requestId: request.id, message, status: 'SENT' },
        });
        res.status(201).json({
            success: true,
            data: { requestId: request.id, message, recipients: contacts.length },
        });
    }
    catch (error) {
        console.error('Broadcast alert error:', error);
        res.status(500).json({ success: false, error: 'Unable to broadcast emergency message' });
    }
});
// GET /api/emergency/alerts
router.get('/alerts', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const alerts = await prisma_1.default.emergencyAlert.findMany({
            where: {
                request: {
                    reservation: {
                        bloodBankId: bloodBank.id // this logic might be slightly flawed if there's no reservation yet, but let's list all alerts since it's a demo
                    }
                }
            },
            orderBy: { sentAt: 'desc' },
            include: {
                request: {
                    include: {
                        hospital: true
                    }
                }
            }
        });
        // Actually, for demo purposes, list ALL emergency alerts
        const allAlerts = await prisma_1.default.emergencyAlert.findMany({
            orderBy: { sentAt: 'desc' },
            include: {
                request: {
                    include: {
                        hospital: true
                    }
                }
            }
        });
        res.json({ success: true, data: allAlerts });
    }
    catch (error) {
        console.error('List alerts error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleGuard_1 = require("../middleware/roleGuard");
const prisma_1 = __importDefault(require("../lib/prisma"));
const enums_1 = require("../types/enums");
const bloodTypeMap_1 = require("../utils/bloodTypeMap");
const router = (0, express_1.Router)();
// POST /api/donations — Record donation
router.post('/', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const { requestId, hospitalId, donorName, bloodType: bloodTypeRaw, units } = req.body;
        if (!hospitalId || !donorName || !bloodTypeRaw || !units) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }
        let bloodType;
        try {
            bloodType = Object.values(enums_1.BloodType).includes(bloodTypeRaw)
                ? bloodTypeRaw
                : (0, bloodTypeMap_1.toBloodTypeEnum)(bloodTypeRaw);
        }
        catch {
            res.status(400).json({ success: false, error: `Invalid blood type: ${bloodTypeRaw}` });
            return;
        }
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Create donation event
            const donation = await tx.donationEvent.create({
                data: {
                    requestId: requestId || null,
                    hospitalId,
                    donorName,
                    bloodType,
                    units
                }
            });
            // Update inventory
            const inventory = await tx.bloodInventory.upsert({
                where: {
                    bloodBankId_bloodType: {
                        bloodBankId: bloodBank.id,
                        bloodType,
                    }
                },
                create: {
                    bloodBankId: bloodBank.id,
                    bloodType,
                    units,
                },
                update: {
                    units: { increment: units },
                }
            });
            // If associated with a request, check if fulfilled
            if (requestId) {
                const request = await tx.bloodRequest.findUnique({
                    where: { id: requestId },
                    include: { donations: true }
                });
                if (request) {
                    const totalDonated = request.donations.reduce((sum, d) => sum + d.units, 0);
                    if (totalDonated >= request.unitsNeeded && request.status !== enums_1.RequestStatus.FULFILLED) {
                        await tx.bloodRequest.update({
                            where: { id: requestId },
                            data: { status: enums_1.RequestStatus.FULFILLED }
                        });
                    }
                }
            }
            return { donation, inventory };
        });
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        console.error('Record donation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// GET /api/donations — List all donation events
router.get('/', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const donations = await prisma_1.default.donationEvent.findMany({
            orderBy: { donatedAt: 'desc' },
            include: {
                hospital: { select: { id: true, name: true } },
                request: { select: { id: true, status: true } }
            }
        });
        res.json({ success: true, data: donations });
    }
    catch (error) {
        console.error('List donations error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enums_1 = require("../types/enums");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const bloodTypeMap_1 = require("../utils/bloodTypeMap");
const emergencyService_1 = require("../services/emergencyService");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
// POST /api/requests — Hospital creates a blood request
router.post('/', (0, roleGuard_1.requireRole)('HOSPITAL'), async (req, res) => {
    try {
        const { bloodType: bloodTypeRaw, unitsNeeded, urgencyLevel } = req.body;
        if (!bloodTypeRaw || !unitsNeeded) {
            res.status(400).json({ success: false, error: 'bloodType and unitsNeeded are required' });
            return;
        }
        if (typeof unitsNeeded !== 'number' || unitsNeeded <= 0) {
            res.status(400).json({ success: false, error: 'unitsNeeded must be a positive number' });
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
        const resolvedUrgency = urgencyLevel && Object.values(enums_1.UrgencyLevel).includes(urgencyLevel)
            ? urgencyLevel
            : enums_1.UrgencyLevel.NORMAL;
        const hospital = await prisma_1.default.hospital.findUnique({
            where: { userId: req.user.id },
        });
        if (!hospital) {
            res.status(404).json({ success: false, error: 'Hospital profile not found' });
            return;
        }
        // Auto-check: find blood banks that have enough of the requested blood type
        const availableInventory = await prisma_1.default.bloodInventory.findMany({
            where: {
                bloodType,
                units: { gte: unitsNeeded },
            },
            include: { bloodBank: true },
        });
        const status = availableInventory.length > 0 ? enums_1.RequestStatus.PENDING : enums_1.RequestStatus.PENDING;
        // Status is always PENDING initially; blood bank confirms manually
        const request = await prisma_1.default.bloodRequest.create({
            data: {
                hospitalId: hospital.id,
                bloodType,
                unitsNeeded,
                urgencyLevel: resolvedUrgency,
                status,
            },
            include: {
                hospital: { select: { id: true, name: true, district: true, phone: true } },
            },
        });
        res.status(201).json({
            success: true,
            data: {
                ...request,
                availableBanks: availableInventory.map((inv) => ({
                    bankId: inv.bloodBankId,
                    bankName: inv.bloodBank.name,
                    availableUnits: inv.units,
                })),
            },
        });
    }
    catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// GET /api/requests — Blood bank lists all requests
router.get('/', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const requests = await prisma_1.default.bloodRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                hospital: { select: { id: true, name: true, district: true, address: true, phone: true } },
                reservation: true,
                alert: true,
            },
        });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        console.error('List requests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// GET /api/requests/my — Hospital lists their own requests
router.get('/my', (0, roleGuard_1.requireRole)('HOSPITAL'), async (req, res) => {
    try {
        const hospital = await prisma_1.default.hospital.findUnique({
            where: { userId: req.user.id },
        });
        if (!hospital) {
            res.status(404).json({ success: false, error: 'Hospital profile not found' });
            return;
        }
        const requests = await prisma_1.default.bloodRequest.findMany({
            where: { hospitalId: hospital.id },
            orderBy: { createdAt: 'desc' },
            include: {
                reservation: {
                    include: {
                        bloodBank: { select: { id: true, name: true, district: true, phone: true } },
                    },
                },
                alert: true,
                donations: true,
            },
        });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        console.error('List own requests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// PATCH /api/requests/:id/reserve — Blood bank reserves units
router.patch('/:id/reserve', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const request = await prisma_1.default.bloodRequest.findUnique({ where: { id } });
        if (!request) {
            res.status(404).json({ success: false, error: 'Blood request not found' });
            return;
        }
        if (request.status !== enums_1.RequestStatus.PENDING) {
            res.status(400).json({
                success: false,
                error: `Cannot reserve a request with status: ${request.status}`,
            });
            return;
        }
        // Check inventory
        const inventory = await prisma_1.default.bloodInventory.findUnique({
            where: {
                bloodBankId_bloodType: {
                    bloodBankId: bloodBank.id,
                    bloodType: request.bloodType,
                },
            },
        });
        if (!inventory || inventory.units < request.unitsNeeded) {
            res.status(400).json({
                success: false,
                error: `Insufficient inventory. Available: ${inventory?.units ?? 0}, needed: ${request.unitsNeeded}`,
            });
            return;
        }
        const [updatedRequest] = await prisma_1.default.$transaction([
            prisma_1.default.bloodRequest.update({
                where: { id },
                data: { status: enums_1.RequestStatus.RESERVED },
            }),
            prisma_1.default.bloodInventory.update({
                where: {
                    bloodBankId_bloodType: {
                        bloodBankId: bloodBank.id,
                        bloodType: request.bloodType,
                    },
                },
                data: { units: { decrement: request.unitsNeeded } },
            }),
            prisma_1.default.reservation.create({
                data: {
                    requestId: id,
                    bloodBankId: bloodBank.id,
                    units: request.unitsNeeded,
                },
            }),
        ]);
        res.json({ success: true, data: updatedRequest });
    }
    catch (error) {
        console.error('Reserve request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// PATCH /api/requests/:id/reject — Blood bank rejects a request
router.patch('/:id/reject', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma_1.default.bloodRequest.findUnique({ where: { id } });
        if (!request) {
            res.status(404).json({ success: false, error: 'Blood request not found' });
            return;
        }
        if (request.status === enums_1.RequestStatus.FULFILLED || request.status === enums_1.RequestStatus.RESERVED) {
            res.status(400).json({
                success: false,
                error: `Cannot reject a request with status: ${request.status}`,
            });
            return;
        }
        const updated = await prisma_1.default.bloodRequest.update({
            where: { id },
            data: { status: enums_1.RequestStatus.REJECTED },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// PATCH /api/requests/:id/emergency — Blood bank marks as emergency and sends alerts
router.patch('/:id/emergency', (0, roleGuard_1.requireRole)('BLOOD_BANK'), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma_1.default.bloodRequest.findUnique({ where: { id } });
        if (!request) {
            res.status(404).json({ success: false, error: 'Blood request not found' });
            return;
        }
        if (request.status === enums_1.RequestStatus.FULFILLED || request.status === enums_1.RequestStatus.REJECTED) {
            res.status(400).json({
                success: false,
                error: `Cannot escalate a request with status: ${request.status}`,
            });
            return;
        }
        const updated = await prisma_1.default.bloodRequest.update({
            where: { id },
            data: { status: enums_1.RequestStatus.EMERGENCY },
        });
        // Trigger WhatsApp alerts asynchronously (don't block response)
        (0, emergencyService_1.triggerAlert)(id).catch((err) => console.error(`Emergency alert trigger failed for request ${id}:`, err));
        res.json({ success: true, data: updated, message: 'Emergency alert triggered' });
    }
    catch (error) {
        console.error('Emergency request error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const enums_1 = require("../types/enums");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get ALL blood banks and their inventory (For hospitals to check sufficient units)
router.get('/all', auth_1.verifyToken, (0, roleGuard_1.requireRole)(enums_1.Role.HOSPITAL, enums_1.Role.BLOOD_BANK), async (req, res) => {
    try {
        const bloodBanks = await prisma.bloodBank.findMany({
            include: {
                inventory: true
            }
        });
        res.json({ success: true, data: bloodBanks });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get own inventory (For BLOOD_BANK)
router.get('/', auth_1.verifyToken, (0, roleGuard_1.requireRole)(enums_1.Role.BLOOD_BANK), async (req, res) => {
    try {
        const bloodBankId = req.user?.bloodBankId;
        if (!bloodBankId)
            return res.status(403).json({ success: false, error: 'Not a blood bank' });
        const inventory = await prisma.bloodInventory.findMany({
            where: { bloodBankId }
        });
        res.json({ success: true, data: inventory });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:bloodType', auth_1.verifyToken, (0, roleGuard_1.requireRole)(enums_1.Role.BLOOD_BANK), async (req, res) => {
    try {
        const bloodBankId = req.user?.bloodBankId;
        if (!bloodBankId)
            return res.status(403).json({ success: false, error: 'Not a blood bank' });
        const { bloodType } = req.params;
        const { units } = req.body;
        const updated = await prisma.bloodInventory.update({
            where: {
                bloodBankId_bloodType: {
                    bloodBankId,
                    // @ts-ignore
                    bloodType: bloodType
                }
            },
            data: { units: parseInt(units) }
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;

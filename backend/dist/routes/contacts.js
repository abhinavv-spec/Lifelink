"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
router.use((0, roleGuard_1.requireRole)('BLOOD_BANK'));
// GET /api/contacts — list emergency contacts for this blood bank
router.get('/', async (req, res) => {
    try {
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const contacts = await prisma_1.default.emergencyContact.findMany({
            where: { bloodBankId: bloodBank.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: contacts });
    }
    catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// POST /api/contacts — add emergency contact
router.post('/', async (req, res) => {
    try {
        const { name, type, phone, district } = req.body;
        if (!name || !type || !phone || !district) {
            res.status(400).json({ success: false, error: 'name, type, phone, and district are required' });
            return;
        }
        if (!Object.values(client_1.ContactType).includes(type)) {
            res.status(400).json({
                success: false,
                error: `Invalid contact type. Must be one of: ${Object.values(client_1.ContactType).join(', ')}`,
            });
            return;
        }
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const contact = await prisma_1.default.emergencyContact.create({
            data: {
                bloodBankId: bloodBank.id,
                name,
                type,
                phone,
                district,
            },
        });
        res.status(201).json({ success: true, data: contact });
    }
    catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// DELETE /api/contacts/:id — delete emergency contact
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bloodBank = await prisma_1.default.bloodBank.findUnique({
            where: { userId: req.user.id },
        });
        if (!bloodBank) {
            res.status(404).json({ success: false, error: 'Blood bank profile not found' });
            return;
        }
        const contact = await prisma_1.default.emergencyContact.findUnique({ where: { id } });
        if (!contact) {
            res.status(404).json({ success: false, error: 'Contact not found' });
            return;
        }
        if (contact.bloodBankId !== bloodBank.id) {
            res.status(403).json({ success: false, error: 'You do not own this contact' });
            return;
        }
        await prisma_1.default.emergencyContact.delete({ where: { id } });
        res.json({ success: true, data: { message: 'Contact deleted successfully' } });
    }
    catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;

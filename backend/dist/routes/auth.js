"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enums_1 = require("../types/enums");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bloodTypeMap_1 = require("../utils/bloodTypeMap");
const router = (0, express_1.Router)();
function generateToken(id, role) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not configured');
    return jsonwebtoken_1.default.sign({ id, role }, secret, { expiresIn: '7d' });
}
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, hospitalOrBankDetails } = req.body;
        if (!name || !email || !password || !role || !hospitalOrBankDetails) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }
        if (!Object.values(enums_1.Role).includes(role)) {
            res.status(400).json({ success: false, error: 'Invalid role. Must be HOSPITAL or BLOOD_BANK' });
            return;
        }
        const { name: detailName, district, address, phone } = hospitalOrBankDetails;
        if (!detailName || !district || !address || !phone) {
            res.status(400).json({ success: false, error: 'Missing hospital/blood bank details' });
            return;
        }
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ success: false, error: 'Email already registered' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const result = await prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { name, email, passwordHash, role },
            });
            if (role === enums_1.Role.HOSPITAL) {
                const hospital = await tx.hospital.create({
                    data: {
                        userId: user.id,
                        name: detailName,
                        district,
                        address,
                        phone,
                    },
                });
                return { user, profileId: hospital.id };
            }
            else {
                const bloodBank = await tx.bloodBank.create({
                    data: {
                        userId: user.id,
                        name: detailName,
                        district,
                        address,
                        phone,
                    },
                });
                // Seed 8 BloodInventory records (all blood types, units: 0)
                await tx.bloodInventory.createMany({
                    data: bloodTypeMap_1.ALL_BLOOD_TYPES.map((bt) => ({
                        bloodBankId: bloodBank.id,
                        bloodType: bt,
                        units: 0,
                    })),
                });
                return { user, profileId: bloodBank.id };
            }
        });
        const token = generateToken(result.user.id, result.user.role);
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    profileId: result.profileId,
                },
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, error: 'Email and password are required' });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: {
                hospital: { select: { id: true } },
                bloodBank: { select: { id: true } },
            },
        });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id, user.role);
        const profileId = user.hospital?.id ?? user.bloodBank?.id ?? null;
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileId,
                },
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;

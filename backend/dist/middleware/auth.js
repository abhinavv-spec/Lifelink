"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ success: false, error: 'JWT secret not configured' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

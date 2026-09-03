"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerAlert = triggerAlert;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bloodTypeMap_1 = require("../utils/bloodTypeMap");
const whatsappService_1 = require("./whatsappService");
async function triggerAlert(requestId) {
    const request = await prisma_1.default.bloodRequest.findUnique({
        where: { id: requestId },
        include: {
            hospital: true,
        },
    });
    if (!request) {
        throw new Error(`Blood request ${requestId} not found`);
    }
    // Fetch all emergency contacts from all blood banks in the system
    const contacts = await prisma_1.default.emergencyContact.findMany({
        include: {
            bloodBank: true,
        },
    });
    const bloodTypeDisplay = (0, bloodTypeMap_1.fromBloodTypeEnum)(request.bloodType);
    const message = `🚨 EMERGENCY BLOOD ALERT 🚨\n` +
        `Hospital: ${request.hospital.name}\n` +
        `Blood Type Needed: ${bloodTypeDisplay}\n` +
        `Units Required: ${request.unitsNeeded}\n` +
        `Urgency: CRITICAL\n` +
        `Please contact the blood bank or report to ${request.hospital.name} to donate.\n` +
        `Thank you for saving a life! 🩸`;
    // Send WhatsApp alerts (non-blocking — errors are logged internally)
    await (0, whatsappService_1.sendWhatsAppAlert)(contacts, message);
    // Upsert EmergencyAlert record
    await prisma_1.default.emergencyAlert.upsert({
        where: { requestId },
        update: {
            message,
            sentAt: new Date(),
            status: 'SENT',
        },
        create: {
            requestId,
            message,
            status: 'SENT',
        },
    });
}

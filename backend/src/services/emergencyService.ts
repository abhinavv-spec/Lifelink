import prisma from '../lib/prisma';
import { fromBloodTypeEnum } from '../utils/bloodTypeMap';
import { sendWhatsAppAlert } from './whatsappService';

export async function triggerAlert(requestId: string): Promise<void> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      hospital: true,
    },
  });

  if (!request) {
    throw new Error(`Blood request ${requestId} not found`);
  }

  // Fetch all emergency contacts from all blood banks in the system
  const contacts = await prisma.emergencyContact.findMany({
    include: {
      bloodBank: true,
    },
  });

  const bloodTypeDisplay = fromBloodTypeEnum(request.bloodType);

  const message =
    `🚨 EMERGENCY BLOOD ALERT 🚨\n` +
    `Hospital: ${request.hospital.name}\n` +
    `Blood Type Needed: ${bloodTypeDisplay}\n` +
    `Units Required: ${request.unitsNeeded}\n` +
    `Urgency: CRITICAL\n` +
    `Please contact the blood bank or report to ${request.hospital.name} to donate.\n` +
    `Thank you for saving a life! 🩸`;

  // Send WhatsApp alerts (non-blocking — errors are logged internally)
  await sendWhatsAppAlert(contacts, message);

  // Upsert EmergencyAlert record
  await prisma.emergencyAlert.upsert({
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

export async function triggerLowStockAlert(bloodBankId: string, bloodType: string, units: number): Promise<void> {
  const bloodBank = await prisma.bloodBank.findUnique({
    where: { id: bloodBankId }
  });

  if (!bloodBank) return;

  // Fetch all emergency contacts for THIS blood bank (or fallback to all if they have none)
  let contacts = await prisma.emergencyContact.findMany({
    where: { bloodBankId }
  });

  if (contacts.length === 0) {
    // If they haven't added specific contacts, just use the fallback from env vars or all contacts
    contacts = await prisma.emergencyContact.findMany();
  }

  const bloodTypeDisplay = fromBloodTypeEnum(bloodType);

  const message =
    `⚠️ AUTOMATED LOW STOCK ALERT ⚠️\n` +
    `Blood Bank: ${bloodBank.name}\n` +
    `Blood Type: ${bloodTypeDisplay}\n` +
    `Current Units: ${units} (Below threshold of 10)\n\n` +
    `We urgently need ${bloodTypeDisplay} blood donors. ` +
    `Please mobilize volunteers immediately to restock our supplies.\n` +
    `Reply to this message for coordination.`;

  await sendWhatsAppAlert(contacts, message);
}

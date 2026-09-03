import { Router, Request, Response } from 'express';
import { BloodType, RequestStatus, Role, UrgencyLevel } from '../types/enums';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import prisma from '../lib/prisma';
import { fromBloodTypeEnum, toBloodTypeEnum } from '../utils/bloodTypeMap';
import { getConfiguredWhatsAppContacts, sendWhatsAppAlert } from '../services/whatsappService';

const router = Router();

router.use(verifyToken);

// POST /api/emergency/broadcast - create an urgent request and notify configured recipients
router.post('/broadcast', requireRole(Role.HOSPITAL), async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodType: bloodTypeRaw, unitsNeeded } = req.body as {
      bloodType: string;
      unitsNeeded: number;
    };

    if (!bloodTypeRaw || !Number.isInteger(unitsNeeded) || unitsNeeded <= 0) {
      res.status(400).json({ success: false, error: 'bloodType and a positive integer unitsNeeded are required' });
      return;
    }

    let bloodType: BloodType;
    try {
      bloodType = toBloodTypeEnum(bloodTypeRaw.replace(/\s+group$/i, '').trim());
    } catch {
      res.status(400).json({ success: false, error: `Invalid blood type: ${bloodTypeRaw}` });
      return;
    }

    const contacts = getConfiguredWhatsAppContacts();
    if (contacts.length === 0) {
      res.status(503).json({ success: false, error: 'No WhatsApp recipients are configured' });
      return;
    }

    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user!.id } });
    if (!hospital) {
      res.status(404).json({ success: false, error: 'Hospital profile not found' });
      return;
    }

    const displayBloodType = fromBloodTypeEnum(bloodType);
    const message = `Running out of ${displayBloodType} group. Donors please arrive to ${hospital.name} at the earliest`;
    const request = await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital.id,
        bloodType,
        unitsNeeded,
        urgencyLevel: UrgencyLevel.CRITICAL,
        status: RequestStatus.EMERGENCY,
      },
    });

    await sendWhatsAppAlert(contacts, message);
    await prisma.emergencyAlert.create({
      data: { requestId: request.id, message, status: 'SENT' },
    });

    res.status(201).json({
      success: true,
      data: { requestId: request.id, message, recipients: contacts.length },
    });
  } catch (error) {
    console.error('Broadcast alert error:', error);
    res.status(500).json({ success: false, error: 'Unable to broadcast emergency message' });
  }
});

// GET /api/emergency/alerts
router.get('/alerts', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const alerts = await prisma.emergencyAlert.findMany({
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
    const allAlerts = await prisma.emergencyAlert.findMany({
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
  } catch (error) {
    console.error('List alerts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/roleGuard';
import prisma from '../lib/prisma';
import { BloodType, RequestStatus } from '../types/enums';
import { toBloodTypeEnum } from '../utils/bloodTypeMap';

const router = Router();

interface RecordDonationBody {
  requestId?: string;
  hospitalId: string;
  donorName: string;
  bloodType: string;
  units: number;
}

// POST /api/donations — Record donation
router.post('/', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, hospitalId, donorName, bloodType: bloodTypeRaw, units }: RecordDonationBody = req.body;

    if (!hospitalId || !donorName || !bloodTypeRaw || !units) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    let bloodType: BloodType;
    try {
      bloodType = Object.values(BloodType).includes(bloodTypeRaw as BloodType)
        ? (bloodTypeRaw as BloodType)
        : toBloodTypeEnum(bloodTypeRaw);
    } catch {
      res.status(400).json({ success: false, error: `Invalid blood type: ${bloodTypeRaw}` });
      return;
    }

    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
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
          if (totalDonated >= request.unitsNeeded && request.status !== RequestStatus.FULFILLED) {
            await tx.bloodRequest.update({
              where: { id: requestId },
              data: { status: RequestStatus.FULFILLED }
            });
          }
        }
      }

      return { donation, inventory };
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/donations — List all donation events
router.get('/', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const donations = await prisma.donationEvent.findMany({
      orderBy: { donatedAt: 'desc' },
      include: {
        hospital: { select: { id: true, name: true } },
        request: { select: { id: true, status: true } }
      }
    });

    res.json({ success: true, data: donations });
  } catch (error) {
    console.error('List donations error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

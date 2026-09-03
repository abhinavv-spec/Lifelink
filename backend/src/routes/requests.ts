import { Router, Request, Response } from 'express';
import { BloodType, UrgencyLevel, RequestStatus } from '../types/enums';
import prisma from '../lib/prisma';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { toBloodTypeEnum } from '../utils/bloodTypeMap';
import { triggerAlert } from '../services/emergencyService';

const router = Router();

router.use(verifyToken);

// POST /api/requests — Hospital creates a blood request
router.post('/', requireRole('HOSPITAL'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodType: bloodTypeRaw, unitsNeeded, urgencyLevel } = req.body as {
      bloodType: string;
      unitsNeeded: number;
      urgencyLevel?: UrgencyLevel;
    };

    if (!bloodTypeRaw || !unitsNeeded) {
      res.status(400).json({ success: false, error: 'bloodType and unitsNeeded are required' });
      return;
    }

    if (typeof unitsNeeded !== 'number' || unitsNeeded <= 0) {
      res.status(400).json({ success: false, error: 'unitsNeeded must be a positive number' });
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

    const resolvedUrgency =
      urgencyLevel && Object.values(UrgencyLevel).includes(urgencyLevel)
        ? urgencyLevel
        : UrgencyLevel.NORMAL;

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.id },
    });

    if (!hospital) {
      res.status(404).json({ success: false, error: 'Hospital profile not found' });
      return;
    }

    // Auto-check: find blood banks that have enough of the requested blood type
    const availableInventory = await prisma.bloodInventory.findMany({
      where: {
        bloodType,
        units: { gte: unitsNeeded },
      },
      include: { bloodBank: true },
    });

    const status: RequestStatus =
      availableInventory.length > 0 ? RequestStatus.PENDING : RequestStatus.PENDING;
    // Status is always PENDING initially; blood bank confirms manually

    const request = await prisma.bloodRequest.create({
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
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/requests — Blood bank lists all requests
router.get('/', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.bloodRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        hospital: { select: { id: true, name: true, district: true, address: true, phone: true } },
        reservation: true,
        alert: true,
      },
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('List requests error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/requests/my — Hospital lists their own requests
router.get('/my', requireRole('HOSPITAL'), async (req: Request, res: Response): Promise<void> => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user!.id },
    });

    if (!hospital) {
      res.status(404).json({ success: false, error: 'Hospital profile not found' });
      return;
    }

    const requests = await prisma.bloodRequest.findMany({
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
  } catch (error) {
    console.error('List own requests error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/requests/:id/reserve — Blood bank reserves units
router.patch('/:id/reserve', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, error: 'Blood request not found' });
      return;
    }

    if (request.status !== RequestStatus.PENDING) {
      res.status(400).json({
        success: false,
        error: `Cannot reserve a request with status: ${request.status}`,
      });
      return;
    }

    // Check inventory
    const inventory = await prisma.bloodInventory.findUnique({
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

    const [updatedRequest] = await prisma.$transaction([
      prisma.bloodRequest.update({
        where: { id },
        data: { status: RequestStatus.RESERVED },
      }),
      prisma.bloodInventory.update({
        where: {
          bloodBankId_bloodType: {
            bloodBankId: bloodBank.id,
            bloodType: request.bloodType,
          },
        },
        data: { units: { decrement: request.unitsNeeded } },
      }),
      prisma.reservation.create({
        data: {
          requestId: id,
          bloodBankId: bloodBank.id,
          units: request.unitsNeeded,
        },
      }),
    ]);

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Reserve request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/requests/:id/reject — Blood bank rejects a request
router.patch('/:id/reject', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, error: 'Blood request not found' });
      return;
    }

    if (request.status === RequestStatus.FULFILLED || request.status === RequestStatus.RESERVED) {
      res.status(400).json({
        success: false,
        error: `Cannot reject a request with status: ${request.status}`,
      });
      return;
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/requests/:id/emergency — Blood bank marks as emergency and sends alerts
router.patch('/:id/emergency', requireRole('BLOOD_BANK'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ success: false, error: 'Blood request not found' });
      return;
    }

    if (request.status === RequestStatus.FULFILLED || request.status === RequestStatus.REJECTED) {
      res.status(400).json({
        success: false,
        error: `Cannot escalate a request with status: ${request.status}`,
      });
      return;
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: { status: RequestStatus.EMERGENCY },
    });

    // Trigger WhatsApp alerts asynchronously (don't block response)
    triggerAlert(id).catch((err) =>
      console.error(`Emergency alert trigger failed for request ${id}:`, err)
    );

    res.json({ success: true, data: updated, message: 'Emergency alert triggered' });
  } catch (error) {
    console.error('Emergency request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

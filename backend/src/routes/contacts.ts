import { Router, Request, Response } from 'express';
import { ContactType } from '@prisma/client';
import prisma from '../lib/prisma';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(verifyToken);
router.use(requireRole('BLOOD_BANK'));

// GET /api/contacts — list emergency contacts for this blood bank
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: { bloodBankId: bloodBank.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/contacts — add emergency contact
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, phone, district } = req.body as {
      name: string;
      type: ContactType;
      phone: string;
      district: string;
    };

    if (!name || !type || !phone || !district) {
      res.status(400).json({ success: false, error: 'name, type, phone, and district are required' });
      return;
    }

    if (!Object.values(ContactType).includes(type)) {
      res.status(400).json({
        success: false,
        error: `Invalid contact type. Must be one of: ${Object.values(ContactType).join(', ')}`,
      });
      return;
    }

    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        bloodBankId: bloodBank.id,
        name,
        type,
        phone,
        district,
      },
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/contacts/:id — delete emergency contact
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const bloodBank = await prisma.bloodBank.findUnique({
      where: { userId: req.user!.id },
    });

    if (!bloodBank) {
      res.status(404).json({ success: false, error: 'Blood bank profile not found' });
      return;
    }

    const contact = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    if (contact.bloodBankId !== bloodBank.id) {
      res.status(403).json({ success: false, error: 'You do not own this contact' });
      return;
    }

    await prisma.emergencyContact.delete({ where: { id } });

    res.json({ success: true, data: { message: 'Contact deleted successfully' } });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;

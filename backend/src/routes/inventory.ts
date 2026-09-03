import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { Role } from '../types/enums';
import { triggerLowStockAlert } from '../services/emergencyService';

const router = Router();
const prisma = new PrismaClient();

// Get ALL blood banks and their inventory (For hospitals to check sufficient units)
router.get('/all', verifyToken, requireRole(Role.HOSPITAL, Role.BLOOD_BANK), async (req, res) => {
  try {
    const bloodBanks = await prisma.bloodBank.findMany({
      include: {
        inventory: true
      }
    });
    res.json({ success: true, data: bloodBanks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get own inventory (For BLOOD_BANK)
router.get('/', verifyToken, requireRole(Role.BLOOD_BANK), async (req, res) => {
  try {
    const bloodBankId = req.user?.bloodBankId;
    if (!bloodBankId) return res.status(403).json({ success: false, error: 'Not a blood bank' });

    const inventory = await prisma.bloodInventory.findMany({
      where: { bloodBankId }
    });
    res.json({ success: true, data: inventory });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:bloodType', verifyToken, requireRole(Role.BLOOD_BANK), async (req, res) => {
  try {
    const bloodBankId = req.user?.bloodBankId;
    if (!bloodBankId) return res.status(403).json({ success: false, error: 'Not a blood bank' });

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

    
    if (updated.units < 10) {
      triggerLowStockAlert(bloodBankId, bloodType, updated.units).catch(err => console.error("Twilio Alert Failed:", err));
    }
    res.json({ success: true, data: updated });
    
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

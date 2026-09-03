import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Haversine formula to calculate distance in miles
function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

// 1. Register a new Donor
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, bloodType, lat, lng } = req.body;
    
    // Basic validation
    if (!name || !email || !bloodType || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const donor = await prisma.donor.create({
      data: { name, email, phone: phone || '', bloodType, lat, lng }
    });

    res.json({ success: true, data: donor });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Algorithm: Match nearby donors for an emergency
router.post('/match', async (req, res) => {
  try {
    const { hospitalLat, hospitalLng, requiredBloodType, maxDistanceMiles = 10 } = req.body;

    if (hospitalLat === undefined || hospitalLng === undefined || !requiredBloodType) {
      return res.status(400).json({ success: false, error: 'Missing location or blood type' });
    }

    // Get all available donors with matching blood type
    // Note: In a massive scale app, use PostGIS. For SQLite demo, we filter in memory.
    const eligibleDonors = await prisma.donor.findMany({
      where: { 
        bloodType: requiredBloodType,
        isAvailable: true 
      }
    });

    // Run the matching algorithm
    const matchedDonors = eligibleDonors.map(donor => {
      const distance = getDistanceInMiles(hospitalLat, hospitalLng, donor.lat, donor.lng);
      return { ...donor, distance };
    })
    .filter(donor => donor.distance <= maxDistanceMiles)
    .sort((a, b) => a.distance - b.distance);

    res.json({ 
      success: true, 
      data: {
        totalEligible: eligibleDonors.length,
        totalMatchedNearby: matchedDonors.length,
        donors: matchedDonors
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

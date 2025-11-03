const express = require('express');
const router = express.Router();
const { admin } = require('../services/firebaseService');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const adminDb = admin.firestore();

// Get event settings
router.get('/', verifyToken, async (req, res) => {
  try {
    const settingsDoc = await adminDb.collection('eventSettings').doc('main').get();

    if (!settingsDoc.exists) {
      return res.json({
        address: '',
        latitude: null,
        longitude: null,
        eventDate: '',
        eventTime: ''
      });
    }

    res.json(settingsDoc.data());
  } catch (error) {
    console.error('Error getting event settings:', error);
    res.status(500).json({ error: 'Error getting event settings' });
  }
});

// Update event settings (admin only)
router.put('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { address, latitude, longitude, eventDate, eventTime } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const settings = {
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      eventDate: eventDate || '',
      eventTime: eventTime || '',
      updatedAt: new Date(),
      updatedBy: req.user.email
    };

    await adminDb.collection('eventSettings').doc('main').set(settings, { merge: true });

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating event settings:', error);
    res.status(500).json({ error: 'Error updating event settings' });
  }
});

module.exports = router;

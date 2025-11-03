const { createInvite, getAllInvites } = require('../models/inviteModel');
const { createGift, getAllGifts } = require('../models/giftModel');
const { generateToken } = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');
const { getFirestore } = require('../services/firebaseService');

const generateInvite = async (req, res) => {
  try {
    const token = generateToken();
    const invite = await createInvite(token);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invite?t=${token}`;

    // Send email notification
    await sendEmail('invite', {
      token,
      link: inviteLink
    });

    res.json({
      success: true,
      token,
      link: inviteLink
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    res.status(500).json({ error: 'Error generating invite' });
  }
};

const addGift = async (req, res) => {
  try {
    const { name, link } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Gift name is required' });
    }

    const gift = await createGift({ name, link });
    res.json({ success: true, gift });
  } catch (error) {
    console.error('Error adding gift:', error);
    res.status(500).json({ error: 'Error adding gift' });
  }
};

const listAllInvites = async (req, res) => {
  try {
    const invites = await getAllInvites();
    res.json(invites);
  } catch (error) {
    console.error('Error listing invites:', error);
    res.status(500).json({ error: 'Error listing invites' });
  }
};

const listAllGifts = async (req, res) => {
  try {
    const gifts = await getAllGifts();
    res.json(gifts);
  } catch (error) {
    console.error('Error listing gifts:', error);
    res.status(500).json({ error: 'Error listing gifts' });
  }
};

const getEmailLogs = async (req, res) => {
  try {
    const db = getFirestore();
    const logsSnapshot = await db.collection('emailLogs')
      .orderBy('sentAt', 'desc')
      .limit(10)
      .get();

    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(logs);
  } catch (error) {
    console.error('Error getting email logs:', error);
    res.status(500).json({ error: 'Error getting email logs' });
  }
};

module.exports = {
  generateInvite,
  addGift,
  listAllInvites,
  listAllGifts,
  getEmailLogs
};

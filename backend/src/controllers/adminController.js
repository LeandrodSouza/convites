const { createInvite, getAllInvites } = require('../models/inviteModel');
const { createGift, getAllGifts, getGift } = require('../models/giftModel');
const { generateToken } = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');
const { getSupabase } = require('../services/supabaseService');

const generateInvite = async (req, res) => {
  try {
    const token = generateToken();
    await createInvite(token);

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
    const { name, link, imagePath } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Gift name is required' });
    }

    const gift = await createGift({ name, link, imagePath });
    res.json({ success: true, gift });
  } catch (error) {
    console.error('Error adding gift:', error);
    res.status(500).json({ error: 'Error adding gift' });
  }
};

const updateGift = async (req, res) => {
  try {
    const { giftId } = req.params;
    const { name, link, imagePath } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Gift name is required' });
    }

    const { updateGift: updateGiftModel } = require('../models/giftModel');
    await updateGiftModel(giftId, { name, link, image_path: imagePath });

    res.json({ success: true, message: 'Gift updated successfully' });
  } catch (error) {
    console.error('Error updating gift:', error);
    res.status(500).json({ error: 'Error updating gift' });
  }
};

const deleteGift = async (req, res) => {
  try {
    const { giftId } = req.params;
    const supabase = getSupabase();

    // Check if the gift exists and if it's taken
    const gift = await getGift(giftId);
    if (!gift) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    if (gift.taken) {
      return res.status(400).json({ error: 'Cannot delete a gift that has been selected' });
    }

    // Delete image if it exists
    if (gift.image_path) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '../../uploads');
      const imagePath = path.join(uploadDir, gift.image_path);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete gift
    const { error } = await supabase.from('gifts').delete().eq('id', giftId);

    if (error) {
        throw new Error('Error deleting gift');
    }

    res.json({ success: true, message: 'Gift deleted successfully' });
  } catch (error) {
    console.error('Error deleting gift:', error);
    res.status(500).json({ error: 'Error deleting gift' });
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
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (error) {
        throw new Error('Error getting email logs');
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting email logs:', error);
    res.status(500).json({ error: 'Error getting email logs' });
  }
};

module.exports = {
  generateInvite,
  addGift,
  updateGift,
  deleteGift,
  listAllInvites,
  listAllGifts,
  getEmailLogs
};

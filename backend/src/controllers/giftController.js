const { getAllGifts, getGift, takeGift } = require('../models/giftModel');
const { getInvite, updateInvite } = require('../models/inviteModel');
const { sendEmail } = require('../services/emailService');

const listGifts = async (req, res) => {
  try {
    const gifts = await getAllGifts();
    res.json(gifts);
  } catch (error) {
    console.error('Error listing gifts:', error);
    res.status(500).json({ error: 'Error listing gifts' });
  }
};

const selectGift = async (req, res) => {
  try {
    const { giftId } = req.params;
    const { token } = req.body;

    const invite = await getInvite(token);

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (!invite.confirmed) {
      return res.status(400).json({ error: 'Please confirm presence first' });
    }

    if (invite.giftId) {
      return res.status(400).json({ error: 'You already selected a gift' });
    }

    // Take the gift (with transaction to prevent race conditions)
    const gift = await takeGift(giftId, invite.email);

    // Update invite with gift selection
    await updateInvite(token, {
      giftId
    });

    // Send email notification
    await sendEmail('gift', {
      name: invite.name,
      email: invite.email,
      giftName: gift.name,
      giftLink: gift.link
    });

    res.json({ success: true, gift });
  } catch (error) {
    console.error('Error selecting gift:', error);

    if (error.message === 'Gift already taken') {
      return res.status(400).json({ error: 'This gift was already selected by someone else' });
    }

    res.status(500).json({ error: 'Error selecting gift' });
  }
};

module.exports = {
  listGifts,
  selectGift
};

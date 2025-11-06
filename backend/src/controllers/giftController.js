const { getAllGifts, takeGift, unselectGift: unselectGiftModel } = require('../models/giftModel');
const { updateUser } = require('../models/userModel');
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
    const { user } = req;

    if (user.selected_gifts && user.selected_gifts.length > 0) {
      return res.status(400).json({ error: 'You already selected a gift' });
    }

    const gift = await takeGift(giftId, user.email);

    await updateUser(user.id, {
      selected_gifts: [giftId],
    });

    await sendEmail('gift', {
      name: user.display_name,
      email: user.email,
      giftName: gift.name,
      giftLink: gift.link,
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

const unselectGift = async (req, res) => {
    try {
        const { giftId } = req.params;
        const { user } = req;

        if (!user.selected_gifts || !user.selected_gifts.includes(giftId)) {
            return res.status(400).json({ error: 'You have not selected this gift' });
        }

        await unselectGiftModel(giftId);

        await updateUser(user.id, {
            selected_gifts: [],
        });

        res.json({ success: true, message: 'Gift unselected' });
    } catch (error)
    {
        console.error('Error unselecting gift:', error);
        res.status(500).json({ error: 'Error unselecting gift' });
    }
};

module.exports = {
  listGifts,
  selectGift,
  unselectGift
};

const { getInvite, updateInvite } = require('../models/inviteModel');
const { sendEmail } = require('../services/emailService');

const verifyInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await getInvite(token);

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    res.json(invite);
  } catch (error) {
    console.error('Error verifying invite:', error);
    res.status(500).json({ error: 'Error verifying invite' });
  }
};

const useInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, name } = req.body;

    const invite = await getInvite(token);

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.used && invite.email !== email) {
      return res.status(400).json({ error: 'Invite already used by another user' });
    }

    await updateInvite(token, {
      used: true,
      email,
      name
    });

    res.json({ success: true, message: 'Invite activated' });
  } catch (error) {
    console.error('Error using invite:', error);
    res.status(500).json({ error: 'Error using invite' });
  }
};

const confirmPresence = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await getInvite(token);

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (!invite.used) {
      return res.status(400).json({ error: 'Invite not activated yet' });
    }

    await updateInvite(token, {
      confirmed: true
    });

    // Send email notification
    await sendEmail('confirm', {
      name: invite.name,
      email: invite.email
    });

    res.json({ success: true, message: 'Presence confirmed' });
  } catch (error) {
    console.error('Error confirming presence:', error);
    res.status(500).json({ error: 'Error confirming presence' });
  }
};

module.exports = {
  verifyInvite,
  useInvite,
  confirmPresence
};

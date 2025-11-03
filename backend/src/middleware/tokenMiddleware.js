const { validateToken } = require('../services/tokenService');
const { getFirestore } = require('../services/firebaseService');

const validateInviteToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!validateToken(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const db = getFirestore();
    const inviteDoc = await db.collection('invites').doc(token).get();

    if (!inviteDoc.exists) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    req.invite = inviteDoc.data();
    req.inviteId = token;
    next();
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Error validating token' });
  }
};

module.exports = { validateInviteToken };

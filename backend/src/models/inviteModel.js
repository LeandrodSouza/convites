const { getFirestore } = require('../services/firebaseService');

const createInvite = async (token) => {
  const db = getFirestore();
  const inviteData = {
    token,
    email: null,
    name: null,
    confirmed: false,
    giftId: null,
    used: false,
    createdAt: new Date()
  };

  await db.collection('invites').doc(token).set(inviteData);
  return inviteData;
};

const getInvite = async (token) => {
  const db = getFirestore();
  const doc = await db.collection('invites').doc(token).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const updateInvite = async (token, data) => {
  const db = getFirestore();
  await db.collection('invites').doc(token).update(data);
};

const getAllInvites = async () => {
  const db = getFirestore();
  const snapshot = await db.collection('invites').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  createInvite,
  getInvite,
  updateInvite,
  getAllInvites
};

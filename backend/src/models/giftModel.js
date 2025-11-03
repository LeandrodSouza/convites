const { getFirestore } = require('../services/firebaseService');

const createGift = async (giftData) => {
  const db = getFirestore();
  const gift = {
    name: giftData.name,
    link: giftData.link || '',
    taken: false,
    takenBy: null,
    takenAt: null,
    createdAt: new Date()
  };

  const docRef = await db.collection('gifts').add(gift);
  return { id: docRef.id, ...gift };
};

const getGift = async (giftId) => {
  const db = getFirestore();
  const doc = await db.collection('gifts').doc(giftId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const getAllGifts = async () => {
  const db = getFirestore();
  const snapshot = await db.collection('gifts').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const updateGift = async (giftId, data) => {
  const db = getFirestore();
  await db.collection('gifts').doc(giftId).update(data);
};

const takeGift = async (giftId, email) => {
  const db = getFirestore();
  const giftRef = db.collection('gifts').doc(giftId);

  return await db.runTransaction(async (transaction) => {
    const giftDoc = await transaction.get(giftRef);

    if (!giftDoc.exists) {
      throw new Error('Gift not found');
    }

    if (giftDoc.data().taken) {
      throw new Error('Gift already taken');
    }

    transaction.update(giftRef, {
      taken: true,
      takenBy: email,
      takenAt: new Date()
    });

    return { id: giftDoc.id, ...giftDoc.data(), taken: true, takenBy: email };
  });
};

module.exports = {
  createGift,
  getGift,
  getAllGifts,
  updateGift,
  takeGift
};

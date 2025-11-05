const admin = require('firebase-admin');
const path = require('path');

let db = null;

const initializeFirebase = () => {
  try {
    const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

const getFirestore = () => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
};

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};

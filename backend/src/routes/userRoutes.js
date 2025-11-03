const express = require('express');
const router = express.Router();
const { getFirestore } = require('../services/firebaseService');
const { verifyToken } = require('../middleware/authMiddleware');
const admin = require('firebase-admin');

const db = getFirestore();
const USERS_COLLECTION = 'users';

// Criar ou atualizar usuário (público - após login Firebase)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    const userId = req.user.uid;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId e email são obrigatórios' });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userRef.get();

    // Verificar se é admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(email.toLowerCase());

    if (userDoc.exists) {
      // Atualizar usuário existente
      await userRef.update({
        email,
        displayName,
        photoURL,
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.json({
        userId,
        ...userDoc.data(),
        email,
        displayName,
        photoURL
      });
    } else {
      // Criar novo usuário
      const newUser = {
        userId,
        email,
        displayName,
        photoURL,
        status: isAdmin ? 'approved' : 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.set(newUser);
      return res.json(newUser);
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao processar usuário' });
  }
});

// Aprovar usuário (apenas admin)
router.put('/:userId/approve', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvedBy } = req.body;

    // Verificar se quem está aprovando é admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(req.user.email.toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({ error: 'Apenas administradores podem aprovar usuários' });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
      status: 'approved',
      approvedBy,
      approvedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const userDoc = await userRef.get();
    res.json({
      userId: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({ error: 'Erro ao aprovar usuário' });
  }
});

// Rejeitar usuário (apenas admin)
router.put('/:userId/reject', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectedBy } = req.body;

    // Verificar se quem está rejeitando é admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(req.user.email.toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({ error: 'Apenas administradores podem rejeitar usuários' });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    await userRef.update({
      status: 'rejected',
      rejectedBy,
      rejectedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const userDoc = await userRef.get();
    res.json({
      userId: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error);
    res.status(500).json({ error: 'Erro ao rejeitar usuário' });
  }
});

module.exports = router;

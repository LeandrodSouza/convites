import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// Buscar usuário por ID (apenas leitura)
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      userId: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

// Listar todos os usuários (apenas leitura)
export const getAllUsers = async () => {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(usersQuery);
    const users = [];

    snapshot.forEach(doc => {
      users.push({
        userId: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
};

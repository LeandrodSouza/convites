import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const EVENT_SETTINGS_DOC = 'eventSettings/main';

// Buscar configuracoes do evento (leitura direta do Firestore)
export const getEventSettings = async () => {
  try {
    const settingsRef = doc(db, 'eventSettings', 'main');
    const settingsDoc = await getDoc(settingsRef);

    if (!settingsDoc.exists()) {
      return {
        address: '',
        latitude: null,
        longitude: null
      };
    }

    return settingsDoc.data();
  } catch (error) {
    console.error('Erro ao buscar configuracoes do evento:', error);
    throw error;
  }
};

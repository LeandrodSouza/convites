import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { api } from '../services/api';
import GiftCard from '../components/GiftCard';
import ConfirmationButton from '../components/ConfirmationButton';

function HomePage({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('t');

  const [invite, setInvite] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/invite');
      return;
    }

    // Load invite data
    loadInvite();

    // Subscribe to gifts in real-time
    const giftsQuery = query(collection(db, 'gifts'));
    const unsubscribe = onSnapshot(giftsQuery, (snapshot) => {
      const giftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGifts(giftsData);
    });

    return () => unsubscribe();
  }, [token]);

  const loadInvite = async () => {
    try {
      setLoading(true);
      const data = await api.verifyInvite(token);
      if (data.error) {
        setError('Convite inválido');
      } else {
        setInvite(data);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const result = await api.confirmPresence(token);
      if (result.error) {
        setError(result.error);
      } else {
        await loadInvite();
      }
    } catch (err) {
      setError('Erro ao confirmar presença');
      console.error(err);
    }
  };

  const handleSelectGift = async (giftId) => {
    try {
      const result = await api.selectGift(giftId, token);
      if (result.error) {
        alert(result.error);
      } else {
        await loadInvite();
      }
    } catch (err) {
      alert('Erro ao selecionar presente');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/invite');
  };

  const handleAdminAccess = () => {
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
    if (adminEmails.includes(user.email)) {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-2xl text-primary">Carregando...</div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700">{error || 'Convite não encontrado'}</p>
        </div>
      </div>
    );
  }

  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Olá, {user.displayName}! 🎉</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={handleAdminAccess}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Section */}
        {!invite.confirmed && (
          <ConfirmationButton onConfirm={handleConfirm} />
        )}

        {/* Address Section */}
        {invite.confirmed && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📍 Endereço do Evento</h2>
            <p className="text-lg text-gray-700 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              {import.meta.env.VITE_EVENT_ADDRESS || 'Endereço não configurado'}
            </p>
          </div>
        )}

        {/* Gift Selection */}
        {invite.confirmed && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🎁 Lista de Presentes</h2>

            {invite.giftId && (
              <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                <p className="text-green-800 font-bold">
                  ✅ Você já escolheu seu presente!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gifts.map(gift => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onSelect={handleSelectGift}
                  disabled={!!invite.giftId || gift.taken}
                  isSelected={gift.id === invite.giftId}
                />
              ))}
            </div>

            {gifts.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum presente cadastrado ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;

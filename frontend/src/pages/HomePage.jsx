import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { getUserById } from '../services/userService';
import GiftCard from '../components/GiftCard';

function HomePage({ user }) {
  const navigate = useNavigate();

  const [userStatus, setUserStatus] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGift, setSelectedGift] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Verificar se usuário está aprovado
    loadUserStatus();

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
  }, [user]);

  const loadUserStatus = async () => {
    try {
      setLoading(true);
      const status = await getUserById(user.uid);

      if (!status || status.status !== 'approved') {
        navigate('/pending');
        return;
      }

      setUserStatus(status);
      setSelectedGift(status.selectedGift || null);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGift = async (giftId) => {
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const userRef = doc(db, 'users', user.uid);

      // Atualizar presente como selecionado
      await updateDoc(giftRef, {
        taken: true,
        takenBy: user.displayName || user.email
      });

      // Atualizar usuário com presente selecionado
      await updateDoc(userRef, {
        selectedGift: giftId
      });

      setSelectedGift(giftId);
      alert('Presente selecionado com sucesso!');
    } catch (err) {
      alert('Erro ao selecionar presente');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-700">{error}</p>
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
              <h1 className="text-3xl font-bold text-primary mb-2">Ola, {user.displayName}!</h1>
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

        {/* Address Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Endereco do Evento</h2>
          <p className="text-lg text-gray-700 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            {import.meta.env.VITE_EVENT_ADDRESS || 'Endereco nao configurado'}
          </p>
        </div>

        {/* Gift Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Escolha seu Presente</h2>
          {selectedGift && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
              <p className="text-green-800">Voce ja selecionou um presente!</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onSelect={handleSelectGift}
                selected={selectedGift === gift.id}
                disabled={gift.taken && selectedGift !== gift.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { getUserById } from '../services/userService';
import GiftCard from '../components/GiftCard';
import Toast from '../components/Toast';

function HomePage({ user }) {
  const navigate = useNavigate();

  const [userStatus, setUserStatus] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGift, setSelectedGift] = useState(null);
  const [toasts, setToasts] = useState([]);

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

      console.log('Presentes carregados:', giftsData);

      // Detectar presentes que foram escolhidos por outros usuarios
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const oldData = gifts.find(g => g.id === change.doc.id);
          const newData = change.doc.data();

          // Se um presente mudou de disponivel para taken
          // E nao foi o proprio usuario que escolheu
          if (oldData && !oldData.taken && newData.taken && selectedGift !== change.doc.id) {
            showToast(`Presente "${newData.name}" foi escolhido!`);
          }
        }
      });

      setGifts(giftsData);
    }, (error) => {
      console.error('Erro ao carregar presentes:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadUserStatus = async () => {
    try {
      setLoading(true);
      const status = await getUserById(user.uid);

      console.log('Status do usuario:', status);

      if (!status || status.status !== 'approved') {
        navigate('/pending');
        return;
      }

      setUserStatus(status);
      setSelectedGift(status.selectedGift || null);
      console.log('selectedGift setado:', status.selectedGift);
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

  const handleUnselectGift = async (giftId) => {
    if (!giftId) return;

    if (!confirm('Deseja realmente desselecionar este presente?')) return;

    try {
      const giftRef = doc(db, 'gifts', giftId);
      const userRef = doc(db, 'users', user.uid);

      // Marcar presente como disponível novamente
      await updateDoc(giftRef, {
        taken: false,
        takenBy: null
      });

      // Remover presente selecionado do usuário
      await updateDoc(userRef, {
        selectedGift: null
      });

      setSelectedGift(null);
      alert('Presente deselecionado com sucesso!');
    } catch (err) {
      alert('Erro ao desselecionar presente');
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

        {/* User's Selected Gift */}
        {(() => {
          const userName = user.displayName || user.email;
          const myGifts = gifts.filter(gift => gift.takenBy === userName);

          if (myGifts.length > 0) {
            return (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Seu Presente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGifts.map((gift) => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      onSelect={handleSelectGift}
                      onUnselect={handleUnselectGift}
                      isSelected={true}
                      disabled={false}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Available Gifts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Presentes Disponiveis</h2>
          {(() => {
            const userName = user.displayName || user.email;
            const hasSelectedGift = gifts.some(g => g.takenBy === userName);

            if (hasSelectedGift) {
              return (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                  <p className="text-blue-800">
                    Voce ja escolheu um presente. Para escolher outro, desselecione o atual primeiro.
                  </p>
                </div>
              );
            }
            return null;
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const userName = user.displayName || user.email;
              const hasSelectedGift = gifts.some(g => g.takenBy === userName);
              const availableGifts = gifts.filter(gift => !gift.taken);
              console.log('Presentes disponiveis:', availableGifts);
              return availableGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onSelect={handleSelectGift}
                  onUnselect={handleUnselectGift}
                  isSelected={false}
                  disabled={hasSelectedGift}
                />
              ));
            })()}
          </div>
          {gifts.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum presente cadastrado ainda.</p>
          )}
          {gifts.length > 0 && gifts.filter(gift => !gift.taken).length === 0 && (
            <p className="text-center text-gray-500 py-8">Todos os presentes ja foram escolhidos.</p>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type="info"
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default HomePage;

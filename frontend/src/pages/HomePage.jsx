import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { getUserById } from '../services/userService';
import { getEventSettings } from '../services/eventSettingsService';
import GiftCard from '../components/GiftCard';
import Toast from '../components/Toast';
import Chip from '../components/Chip';
import Story from '../components/Story';
import { WazeLogo, UberLogo, GoogleMapsLogo } from '../components/AppLogos';

function HomePage({ user }) {
  const navigate = useNavigate();

  const [userStatus, setUserStatus] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGift, setSelectedGift] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [eventAddress, setEventAddress] = useState('');
  const [eventLatitude, setEventLatitude] = useState(null);
  const [eventLongitude, setEventLongitude] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  // Refs for scrolling to sections
  const listaRef = useRef(null);
  const localRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Verificar se usuário está aprovado
    loadUserStatus();

    // Carregar configuracoes do evento
    loadEventSettings();

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

  const loadEventSettings = async () => {
    try {
      const settings = await getEventSettings();
      setEventAddress(settings.address || '');
      setEventLatitude(settings.latitude);
      setEventLongitude(settings.longitude);
      setEventDate(settings.eventDate || '');
      setEventTime(settings.eventTime || '');
    } catch (err) {
      console.error('Erro ao carregar configuracoes do evento:', err);
    }
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
      alert('Tudo certo! Presente reservado com sucesso 💚');
    } catch (err) {
      alert('Erro ao reservar presente. Tente novamente.');
      console.error(err);
    }
  };

  const handleUnselectGift = async (giftId) => {
    if (!giftId) return;

    if (!confirm('Deseja alterar sua escolha de presente?')) return;

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
      alert('Escolha alterada! Você pode escolher outro presente agora.');
    } catch (err) {
      alert('Erro ao alterar escolha. Tente novamente.');
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

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatEventDateTime = () => {
    if (!eventDate && !eventTime) {
      return '06 dez · 16:30'; // fallback default
    }

    let formatted = '';

    if (eventDate) {
      const date = new Date(eventDate + 'T00:00:00');
      const day = date.getDate();
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const month = months[date.getMonth()];
      formatted = `${day} ${month}`;
    }

    if (eventTime) {
      formatted += formatted ? ` · ${eventTime}` : eventTime;
    }

    return formatted || '06 dez · 16:30';
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
    <div className="min-h-[100svh] bg-secondary relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none"
        style={{ backgroundImage: 'url(/nossobrunch.png)' }}
      />

      <div className="mx-auto w-full max-w-screen-sm md:max-w-2xl lg:max-w-4xl pb-[calc(24px+env(safe-area-inset-bottom))] relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-border mb-6 pt-[env(safe-area-inset-top)]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full border-2 border-primary"
                  />
                )}
                <div>
                  <p className="text-sm text-primary font-medium">
                    Olá, {user.displayName || 'Convidado'}! 💚
                  </p>
                  <h1 className="text-base font-medium text-accent tracking-tight">
                    Brunch de Casa Nova
                  </h1>
                  <p className="text-xs text-gray-600">Família Andrade Silva convida</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    onClick={handleAdminAccess}
                    className="min-w-[44px] min-h-[44px] p-2 hover:bg-secondary rounded-lg transition flex items-center justify-center"
                    aria-label="Admin"
                  >
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="min-w-[44px] min-h-[44px] p-2 hover:bg-secondary rounded-lg transition flex items-center justify-center"
                  aria-label="Sair"
                >
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Chip
                icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
              >
                {formatEventDateTime()}
              </Chip>
              {eventAddress && (
                <Chip
                  icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
                >
                  {eventAddress}
                </Chip>
              )}
              {userStatus?.status === 'approved' && (
                <Chip variant="success">
                  Confirmado
                </Chip>
              )}
            </div>
          </div>
        </div>

        {/* Stories */}
        <div className="px-4 mb-6">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {isAdmin && (
              <Story
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                label="Convite"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            )}
            <Story
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
              label="Lista"
              onClick={() => scrollToSection(listaRef)}
            />
            <Story
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
              label="Local"
              onClick={() => scrollToSection(localRef)}
            />
          </div>
        </div>

        {/* Feed */}
        <div className="px-4 space-y-4">

        {/* Local Card */}
        <div ref={localRef} className="bg-white rounded-card border border-border shadow-subtle p-5">
          <h3 className="text-base font-medium text-accent mb-2 tracking-tight">Local do Brunch</h3>
          <p className="text-sm text-gray-600 mb-4">
            {eventAddress || 'Endereco nao configurado'}
          </p>
          {eventAddress && (
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://www.waze.com/ul?q=${encodeURIComponent(eventAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 bg-secondary hover:bg-border rounded-xl transition text-center"
              >
                <WazeLogo />
                <span className="text-xs text-accent font-medium">Waze</span>
              </a>
              <a
                href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(eventAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 bg-secondary hover:bg-border rounded-xl transition text-center"
              >
                <UberLogo />
                <span className="text-xs text-accent font-medium">Uber</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 bg-secondary hover:bg-border rounded-xl transition text-center"
              >
                <GoogleMapsLogo />
                <span className="text-xs text-accent font-medium">Maps</span>
              </a>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3 text-center">
            Te espero para celebrar este novo momento.
          </p>
        </div>

        {/* Sua Escolha */}
        {(() => {
          const userName = user.displayName || user.email;
          const myGifts = gifts.filter(gift => gift.takenBy === userName);

          if (myGifts.length > 0) {
            return (
              <div className="bg-white rounded-card border border-border shadow-subtle p-5">
                <h3 className="text-base font-medium text-accent mb-1 tracking-tight">Seu Presente</h3>
                <p className="text-xs text-gray-500 mb-4">Presente que você reservou para os anfitriões</p>
                <div className="grid grid-cols-1 gap-4">
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

        {/* Lista de Presentes */}
        <div ref={listaRef} className="bg-white rounded-card border border-border shadow-subtle p-5">
          <h3 className="text-base font-medium text-accent mb-4 tracking-tight">Escolha um presente para nos ajudar a montar nosso lar 💚</h3>
          {(() => {
            const userName = user.displayName || user.email;
            const hasSelectedGift = gifts.some(g => g.takenBy === userName);

            if (hasSelectedGift) {
              return (
                <div className="bg-brand-light border border-primary/20 p-3 rounded-xl mb-4">
                  <p className="text-sm text-primary">
                    Você já reservou um presente. Para escolher outro, altere sua escolha primeiro.
                  </p>
                </div>
              );
            }
            return null;
          })()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Ainda não temos presentes aqui</p>
            </div>
          )}
          {gifts.length > 0 && gifts.filter(gift => !gift.taken).length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Todos os presentes já foram escolhidos</p>
            </div>
          )}
        </div>

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

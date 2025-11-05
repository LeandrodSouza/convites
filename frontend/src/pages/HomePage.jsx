import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { getUserById } from '../services/userService';
import { getEventSettings } from '../services/eventSettingsService';
import GiftCard from '../components/GiftCard';
import Toast from '../components/Toast';
import { WazeLogo, UberLogo, GoogleMapsLogo } from '../components/AppLogos';

function HomePage({ user }) {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGift, setSelectedGift] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [eventAddress, setEventAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const listaRef = useRef(null);
  const localRef = useRef(null);
  const homeRef = useRef(null);

  const selectedGiftRef = useRef(selectedGift);
  useEffect(() => {
    selectedGiftRef.current = selectedGift;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserStatus();
    loadEventSettings();

    const giftsQuery = query(collection(db, 'gifts'));
    const unsubscribe = onSnapshot(giftsQuery, (snapshot) => {
      const giftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGifts(prevGifts => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const oldData = prevGifts.find(g => g.id === change.doc.id);
            const newData = change.doc.data();
            if (oldData && !oldData.taken && newData.taken && selectedGiftRef.current !== change.doc.id) {
              showToast(`Presente "${newData.name}" foi escolhido!`);
            }
          }
        });
        return giftsData;
      });
    }, (error) => {
      console.error('Erro ao carregar presentes:', error);
    });

    return () => unsubscribe();
  }, [user, navigate]);

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
      setEventAddress(settings.address || 'Avenida Bernardo Manoel, 10099, planalto Itapery.');
      setEventDate(settings.eventDate || '');
      setEventTime(settings.eventTime || '');
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  };

  const loadUserStatus = async () => {
    try {
      setLoading(true);
      const status = await getUserById(user.uid);
      if (!status || status.status !== 'approved') {
        navigate('/pending');
        return;
      }
      setSelectedGift(status.selectedGift || null);
    } catch (err) {
      setError('Erro ao carregar seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGift = async (giftId) => {
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(giftRef, { taken: true, takenBy: user.displayName });
      await updateDoc(userRef, { selectedGift: giftId });
      setSelectedGift(giftId);
      showToast('Presente reservado com sucesso! 💚');
    } catch (err) {
      showToast('Erro ao reservar. Tente novamente.', 'error');
    }
  };

  const handleUnselectGift = async (giftId) => {
    if (!giftId || !window.confirm('Deseja mesmo alterar sua escolha?')) return;
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(giftRef, { taken: false, takenBy: null });
      await updateDoc(userRef, { selectedGift: null });
      setSelectedGift(null);
      showToast('Escolha alterada. Agora você pode selecionar outro presente.');
    } catch (err) {
      showToast('Erro ao alterar. Tente novamente.', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleAdminAccess = () => navigate('/admin');

  const scrollToSection = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const formatEventDateTime = () => {
    if (!eventDate || !eventTime) return '06 de Dezembro, às 16:30';
    try {
      const date = new Date(`${eventDate}T${eventTime}`);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch {
      return 'Data em breve';
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-secondary"><p>Carregando...</p></div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-red-100"><p>{error}</p></div>;

  const isAdmin = (import.meta.env.VITE_ADMIN_EMAILS || '').includes(user.email);
  const myGift = gifts.find(g => g.taken && g.takenBy === user.displayName);

  return (
    <div className="bg-secondary min-h-screen font-sans text-accent relative">
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none"
        style={{ backgroundImage: 'url(/nossobrunch.png)' }}
      />

      <header ref={homeRef} className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-3">
          <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border-2 border-primary" />
          <div>
            <p className="text-sm">Olá, <span className="font-semibold text-primary">{user.displayName}</span>!</p>
            <p className="text-xs text-gray-600">Seja bem-vindo(a)!</p>
          </div>
        </div>
        <div>
          {isAdmin && (
            <button onClick={handleAdminAccess} className="p-2 rounded-full hover:bg-brand-light" aria-label="Admin">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          )}
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-brand-light" aria-label="Sair">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      <main className="p-4 pb-24 relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-meow text-primary leading-tight">
            <span className="text-6xl">Nosso Brunch</span>
            <br />
            <span className="text-5xl">de casa nova💚</span>
          </h1>
        </div>

        <div ref={localRef} className="bg-white rounded-card border border-border shadow-subtle p-6 mb-8 text-center">
          <h2 className="text-4xl font-meow text-accent mb-4">Detalhes do Evento</h2>
          <p className="text-xl font-semibold text-primary">{formatEventDateTime()}</p>
          <p className="text-gray-600 mt-2 text-lg">{eventAddress}</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <a href={`https://waze.com/ul?q=${encodeURIComponent(eventAddress)}`} className="flex flex-col items-center gap-2 p-3 bg-secondary hover:bg-border rounded-xl transition"><WazeLogo /><span className="text-xs font-medium text-accent">Waze</span></a>
            <a href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(eventAddress)}`} className="flex flex-col items-center gap-2 p-3 bg-secondary hover:bg-border rounded-xl transition"><UberLogo /><span className="text-xs font-medium text-accent">Uber</span></a>
            <a href={`https://google.com/maps/search/?api=1&query=${encodeURIComponent(eventAddress)}`} className="flex flex-col items-center gap-2 p-3 bg-secondary hover:bg-border rounded-xl transition"><GoogleMapsLogo /><span className="text-xs font-medium text-accent">Maps</span></a>
          </div>
        </div>

        <div ref={listaRef} className="bg-white rounded-card border border-border shadow-subtle p-6">
          <h2 className="text-xl font-semibold text-center text-accent mb-6">Escolha um presente para nos ajudar a montar nosso lar 💚</h2>
          {myGift ? (
            <div>
              <p className="text-center mb-4 text-primary">Você escolheu nosso presente! Muito obrigado! 💚</p>
              <GiftCard gift={myGift} isSelected onUnselect={() => handleUnselectGift(myGift.id)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {gifts.filter(g => !g.taken).map(gift => (
                <GiftCard key={gift.id} gift={gift} onSelect={() => handleSelectGift(gift.id)} />
              ))}
            </div>
          )}
          {gifts.every(g => g.taken) && <p className="text-center text-gray-500 mt-6">Todos os presentes já foram escolhidos! Agradecemos o carinho de todos.</p>}
        </div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-border z-20 flex justify-around p-2">
        {[
          { ref: homeRef, label: 'Início', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> },
          { ref: localRef, label: 'Local', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
          { ref: listaRef, label: 'Presentes', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg> }
        ].map(({ ref, label, icon }) => (
          <button key={label} onClick={() => scrollToSection(ref)} className="flex flex-col items-center gap-1 text-accent hover:text-primary transition-colors">
            {icon}
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

export default HomePage;

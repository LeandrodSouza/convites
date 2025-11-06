import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { getAllUsers } from '../services/userService';
import AdminGiftForm from '../components/AdminGiftForm';
import EmailStatus from '../components/EmailStatus';
import EditGiftModal from '../components/EditGiftModal';

function AdminPage({ user }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventAddress, setEventAddress] = useState('');
  const [eventLatitude, setEventLatitude] = useState('');
  const [eventLongitude, setEventLongitude] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [requireApproval, setRequireApproval] = useState(true);
  const [activeSection, setActiveSection] = useState('evento');
  const [editingGift, setEditingGift] = useState(null);

  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = adminEmails.includes(user.email);

  useEffect(() => {
    if (!isAdmin) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/login');
      return;
    }

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
            loadAdminData(session);
        }
    };

    fetchSession();
  }, [isAdmin]);

  const loadAdminData = async (currentSession) => {
    try {
      setLoading(true);
      const token = currentSession.provider_token;
      const [giftsData, logsData, usersData, eventSettings] = await Promise.all([
        api.getAdminGifts(token),
        api.getEmailLogs(token),
        getAllUsers(),
        api.getEventSettings(token)
      ]);

      setGifts(giftsData.error ? [] : giftsData);
      setEmailLogs(logsData.error ? [] : logsData);
      setUsers(usersData || []);
      setEventAddress(eventSettings.address || '');
      setEventLatitude(eventSettings.latitude || '');
      setEventLongitude(eventSettings.longitude || '');
      setEventDate(eventSettings.eventDate || '');
      setEventTime(eventSettings.eventTime || '');
      setRequireApproval(eventSettings.requireApproval !== undefined ? eventSettings.requireApproval : true);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, userName) => {
    if (!confirm(`Aprovar usuario ${userName}?`)) return;

    try {
      await api.approveUser(session.provider_token, userId, user.email);
      alert('Usuario aprovado com sucesso!');
      await loadAdminData(session);
    } catch (err) {
      alert('Erro ao aprovar usuario');
      console.error(err);
    }
  };

  const handleRejectUser = async (userId, userName) => {
    if (!confirm(`Rejeitar usuario ${userName}?`)) return;

    try {
      await api.rejectUser(session.provider_token, userId, user.email);
      alert('Usuario rejeitado!');
      await loadAdminData(session);
    } catch (err) {
      alert('Erro ao rejeitar usuario');
      console.error(err);
    }
  };

  const handleAddGift = async (name, link, imagePath) => {
    try {
      const result = await api.addGift(session.provider_token, name, link, imagePath);
      if (result.error) {
        alert('Erro ao adicionar presente: ' + result.error);
        return false;
      }
      await loadAdminData(session);
      return true;
    } catch (err) {
      alert('Erro ao adicionar presente');
      console.error(err);
      return false;
    }
  };

  const handleSaveEventSettings = async (e) => {
    e.preventDefault();

    if (!eventAddress.trim()) {
      alert('Endereco é obrigatorio');
      return;
    }

    try {
      const result = await api.updateEventSettings(
        session.provider_token,
        eventAddress,
        eventLatitude || null,
        eventLongitude || null,
        eventDate,
        eventTime,
        requireApproval
      );

      if (result.error) {
        alert('Erro ao salvar configuracoes: ' + result.error);
        return;
      }

      alert('Configuracoes salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configuracoes');
      console.error(err);
    }
  };

  const handleEditGift = async (giftId, name, link, imagePath) => {
    try {
      const result = await api.updateGift(session.provider_token, giftId, name, link, imagePath);
      if (result.error) {
        alert('Erro ao atualizar presente: ' + result.error);
        return false;
      }
      alert('Presente atualizado com sucesso!');
      setEditingGift(null);
      await loadAdminData(session);
      return true;
    } catch (err) {
      alert('Erro ao atualizar presente');
      console.error(err);
      return false;
    }
  };

  const handleDeleteGift = async (giftId, giftName) => {
    if (!confirm(`Deseja realmente deletar o presente "${giftName}"?`)) return;

    try {
      const result = await api.deleteGift(session.provider_token, giftId);
      if (result.error) {
        alert('Erro ao deletar presente: ' + result.error);
        return;
      }
      alert('Presente deletado com sucesso!');
      await loadAdminData(session);
    } catch (err) {
      alert('Erro ao deletar presente');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-2xl text-primary">Carregando...</div>
      </div>
    );
  }

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');

  const menuItems = [
    { id: 'evento', label: 'Configurações', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'presentes', label: 'Presentes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { id: 'usuarios', label: 'Usuários', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: 'emails', label: 'Emails', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> }
  ];

  return (
    <div className="min-h-[100svh] bg-secondary flex flex-col sm:flex-row">
      {/* Sidebar - Desktop only */}
      <div className="hidden sm:flex sm:w-64 bg-white border-r border-border flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-medium text-accent tracking-tight">Painel Admin</h1>
          <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition ${
                activeSection === item.id
                  ? 'bg-brand-light text-primary'
                  : 'text-gray-600 hover:bg-secondary'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-border hover:bg-secondary text-accent font-medium rounded-xl transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </div>
      </div>

      {/* Mobile Header - Mobile only */}
      <div className="sm:hidden bg-white border-b border-border pt-[env(safe-area-inset-top)] px-4 py-3 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-medium text-accent tracking-tight">Painel Admin</h1>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="min-w-[44px] min-h-[44px] p-2 hover:bg-secondary rounded-lg transition flex items-center justify-center flex-shrink-0"
            aria-label="Sair"
          >
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-[calc(var(--app-tab-h)+env(safe-area-inset-bottom))] sm:pb-0">
        <div className="p-4 sm:p-8">

        {/* Configuracoes do Evento */}
        {activeSection === 'evento' && (
        <div className="bg-white rounded-card border border-border shadow-subtle p-6">
          <h2 className="text-2xl font-medium text-accent mb-6 tracking-tight">Configuracoes do Evento</h2>
          <form onSubmit={handleSaveEventSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereco do Evento *
              </label>
              <input
                type="text"
                value={eventAddress}
                onChange={(e) => setEventAddress(e.target.value)}
                placeholder="Ex: Av. Bernardo Manoel, 10099. Planalto Itapery."
                className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário do Evento
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (opcional)
                </label>
                <input
                  type="text"
                  value={eventLatitude}
                  onChange={(e) => setEventLatitude(e.target.value)}
                  placeholder="Ex: -3.7327"
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (opcional)
                </label>
                <input
                  type="text"
                  value={eventLongitude}
                  onChange={(e) => setEventLongitude(e.target.value)}
                  placeholder="Ex: -38.5270"
                  className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Requer aprovação manual de usuários</span>
                  <p className="text-xs text-gray-500">Quando ativado, novos usuários precisam ser aprovados por um admin antes de acessar o evento</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-6 rounded-xl transition shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Salvar Configuracoes
            </button>
          </form>
        </div>
        )}

        {/* Presentes Section */}
        {activeSection === 'presentes' && (
        <div>
          {/* Cadastrar Presente */}
          <div className="bg-white rounded-card border border-border shadow-subtle p-6 mb-6">
            <h2 className="text-2xl font-medium text-accent mb-6 tracking-tight">Cadastrar Presente</h2>
            <AdminGiftForm onSubmit={handleAddGift} />
          </div>

          {/* Lista de Presentes */}
          <div className="bg-white rounded-card border border-border shadow-subtle p-6">
            <h2 className="text-2xl font-medium text-accent mb-6 tracking-tight">Todos os Presentes</h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Presente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Link</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Escolhido por</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map((gift, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{gift.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {gift.link ? (
                          <a
                            href={gift.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {gift.taken ? (
                          <span className="text-primary font-medium">Escolhido</span>
                        ) : (
                          <span className="text-gray-400">Disponivel</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{gift.taken_by || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          {!gift.taken && (
                            <>
                              <button
                                onClick={() => setEditingGift(gift)}
                                className="bg-primary hover:bg-primary-hover text-white font-medium py-1.5 px-3 rounded-lg transition text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteGift(gift.id, gift.name)}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded-lg transition text-xs"
                              >
                                Deletar
                              </button>
                            </>
                          )}
                          {gift.taken && (
                            <span className="text-xs text-gray-400 italic">Escolhido</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {gifts.map((gift, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Presente</p>
                    <p className="text-sm font-medium text-accent">{gift.name}</p>
                  </div>

                  {gift.link && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Link</p>
                      <a
                        href={gift.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        Ver sugestão
                      </a>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {gift.taken ? (
                      <span className="text-sm text-primary font-medium">Escolhido</span>
                    ) : (
                      <span className="text-sm text-gray-400">Disponível</span>
                    )}
                  </div>

                  {gift.taken && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Escolhido por</p>
                      <p className="text-sm text-accent">{gift.taken_by}</p>
                    </div>
                  )}

                  {!gift.taken && (
                    <div className="flex gap-2 mt-4 justify-center">
                      <button
                        onClick={() => setEditingGift(gift)}
                        className="flex-1 min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2 px-3 rounded-lg transition text-sm text-center"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteGift(gift.id, gift.name)}
                        className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition text-sm text-center"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {gifts.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">Nenhum presente cadastrado.</p>
            )}
          </div>
        </div>
        )}

        {/* Usuarios Section */}
        {activeSection === 'usuarios' && (
        <div className="bg-white rounded-card border border-border shadow-subtle p-6">
          <h2 className="text-2xl font-medium text-accent mb-6 tracking-tight">Gerenciar Usuarios</h2>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Aguardando Aprovacao ({pendingUsers.length})</h3>
            {pendingUsers.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((u, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {u.photo_url && (
                                <img src={u.photo_url} alt={u.display_name} className="w-8 h-8 rounded-full" />
                              )}
                              <span className="font-medium">{u.display_name || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApproveUser(u.id, u.display_name || u.email)}
                                className="bg-primary hover:bg-primary-hover text-white font-medium py-1.5 px-4 rounded-lg transition text-xs"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleRejectUser(u.id, u.display_name || u.email)}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded-lg transition text-xs"
                              >
                                Rejeitar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {pendingUsers.map((u, idx) => (
                    <div key={idx} className="border border-yellow-200 rounded-xl p-4 bg-yellow-50">
                      <div className="flex items-center gap-3 mb-3">
                        {u.photo_url && (
                          <img src={u.photo_url} alt={u.display_name} className="w-12 h-12 rounded-full flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-accent truncate">{u.display_name || '-'}</p>
                          <p className="text-xs text-gray-600 truncate">{u.email}</p>
                        </div>
                      </div>

                      {u.created_at && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Data de cadastro</p>
                          <p className="text-sm text-accent">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 justify-center">
                        <button
                          onClick={() => handleApproveUser(u.id, u.display_name || u.email)}
                          className="flex-1 min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2 px-3 rounded-lg transition text-sm text-center"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejectUser(u.id, u.display_name || u.email)}
                          className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition text-sm text-center"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">Nenhum usuario pendente.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Usuarios Aprovados ({approvedUsers.length})</h3>
            {approvedUsers.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Presente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedUsers.map((u, idx) => {
                        const userGifts = gifts.filter(g => u.selected_gifts?.includes(g.id));
                        return (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                {u.photo_url && (
                                  <img src={u.photo_url} alt={u.display_name} className="w-8 h-8 rounded-full" />
                                )}
                                <span className="font-medium">{u.display_name || '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{u.email}</td>
                            <td className="px-4 py-3 text-sm">
                              {userGifts.length > 0 ? (
                                <span className="text-primary font-medium">{userGifts.map(g => g.name).join(', ')}</span>
                              ) : (
                                <span className="text-gray-400">Nenhum</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {approvedUsers.map((u, idx) => {
                    const userGifts = gifts.filter(g => u.selected_gifts?.includes(g.id));
                    return (
                      <div key={idx} className="border border-green-200 rounded-xl p-4 bg-green-50">
                        <div className="flex items-center gap-3 mb-3">
                          {u.photo_url && (
                            <img src={u.photo_url} alt={u.display_name} className="w-12 h-12 rounded-full flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-accent truncate">{u.display_name || '-'}</p>
                            <p className="text-xs text-gray-600 truncate">{u.email}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Presentes escolhidos</p>
                          {userGifts.length > 0 ? (
                            <p className="text-sm text-primary font-medium">{userGifts.map(g => g.name).join(', ')}</p>
                          ) : (
                            <p className="text-sm text-gray-400">Nenhum</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">Nenhum usuario aprovado ainda.</p>
            )}
          </div>
        </div>
        )}

        {/* Emails Section */}
        {activeSection === 'emails' && (
          <div className="bg-white rounded-card border border-border shadow-subtle p-6">
            <h2 className="text-2xl font-medium text-accent mb-6 tracking-tight">Logs de Email</h2>
            <EmailStatus logs={emailLogs} />
          </div>
        )}

        </div>
      </div>

      {/* Mobile Tab Bar - Mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)] z-30 h-[var(--app-tab-h)]">
        <div className="grid grid-cols-4 gap-1 px-2 h-full items-center">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition min-h-[44px] justify-center ${
                activeSection === item.id
                  ? 'text-primary bg-brand-light'
                  : 'text-gray-600 hover:bg-secondary'
              }`}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit Gift Modal */}
      {editingGift && (
        <EditGiftModal
          gift={editingGift}
          onClose={() => setEditingGift(null)}
          onSave={handleEditGift}
        />
      )}
    </div>
  );
}

export default AdminPage;

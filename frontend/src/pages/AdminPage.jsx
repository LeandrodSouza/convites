import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { api } from '../services/api';
import AdminGiftForm from '../components/AdminGiftForm';
import InviteModal from '../components/InviteModal';
import EmailStatus from '../components/EmailStatus';

function AdminPage({ user }) {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState('');
  const [invites, setInvites] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = adminEmails.includes(user.email);

  useEffect(() => {
    if (!isAdmin) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/login');
      return;
    }

    // Get Firebase auth token
    auth.currentUser?.getIdToken().then(token => {
      setAuthToken(token);
      loadAdminData(token);
    });
  }, [isAdmin]);

  const loadAdminData = async (token) => {
    try {
      setLoading(true);
      const [invitesData, giftsData, logsData] = await Promise.all([
        api.getAdminInvites(token),
        api.getAdminGifts(token),
        api.getEmailLogs(token)
      ]);

      setInvites(invitesData.error ? [] : invitesData);
      setGifts(giftsData.error ? [] : giftsData);
      setEmailLogs(logsData.error ? [] : logsData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const result = await api.generateInvite(authToken);
      if (result.error) {
        alert('Erro ao gerar convite: ' + result.error);
      } else {
        setGeneratedInvite(result);
        setShowInviteModal(true);
        await loadAdminData(authToken);
      }
    } catch (err) {
      alert('Erro ao gerar convite');
      console.error(err);
    }
  };

  const handleAddGift = async (name, link) => {
    try {
      const result = await api.addGift(authToken, name, link);
      if (result.error) {
        alert('Erro ao adicionar presente: ' + result.error);
        return false;
      }
      await loadAdminData(authToken);
      return true;
    } catch (err) {
      alert('Erro ao adicionar presente');
      console.error(err);
      return false;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/invite');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-2xl text-primary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 mb-2">Painel Admin 👑</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Generate Invite */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📨 Gerar Convite</h2>
            <button
              onClick={handleGenerateInvite}
              className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              Gerar Novo Convite
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Total de convites: <strong>{invites.length}</strong>
            </p>
          </div>

          {/* Add Gift */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎁 Cadastrar Presente</h2>
            <AdminGiftForm onSubmit={handleAddGift} />
          </div>
        </div>

        {/* Email Logs */}
        <EmailStatus logs={emailLogs} />

        {/* Confirmed Guests */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Confirmados</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Presente</th>
                </tr>
              </thead>
              <tbody>
                {invites
                  .filter(inv => inv.confirmed)
                  .map((inv, idx) => {
                    const gift = gifts.find(g => g.id === inv.giftId);
                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm">{inv.name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{inv.email || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {gift ? (
                            <span className="text-green-600 font-bold">{gift.name}</span>
                          ) : (
                            <span className="text-gray-400">Nenhum</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {invites.filter(inv => inv.confirmed).length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhuma confirmação ainda.</p>
            )}
          </div>
        </div>

        {/* Gifts List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎁 Todos os Presentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Presente</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Link</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Escolhido por</th>
                </tr>
              </thead>
              <tbody>
                {gifts.map((gift, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-bold">{gift.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {gift.link ? (
                        <a
                          href={gift.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {gift.taken ? (
                        <span className="text-green-600 font-bold">✅ Escolhido</span>
                      ) : (
                        <span className="text-gray-400">Disponível</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{gift.takenBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gifts.length === 0 && (
              <p className="text-center text-gray-500 py-8">Nenhum presente cadastrado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && generatedInvite && (
        <InviteModal
          invite={generatedInvite}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}

export default AdminPage;

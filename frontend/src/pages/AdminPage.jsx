import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { api } from '../services/api';
import { getAllUsers } from '../services/userService';
import AdminGiftForm from '../components/AdminGiftForm';
import EmailStatus from '../components/EmailStatus';

function AdminPage({ user }) {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState('');
  const [gifts, setGifts] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [users, setUsers] = useState([]);
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
      const [giftsData, logsData, usersData] = await Promise.all([
        api.getAdminGifts(token),
        api.getEmailLogs(token),
        getAllUsers()
      ]);

      setGifts(giftsData.error ? [] : giftsData);
      setEmailLogs(logsData.error ? [] : logsData);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, userName) => {
    if (!confirm(`Aprovar usuario ${userName}?`)) return;

    try {
      await api.approveUser(authToken, userId, user.email);
      alert('Usuario aprovado com sucesso!');
      await loadAdminData(authToken);
    } catch (err) {
      alert('Erro ao aprovar usuario');
      console.error(err);
    }
  };

  const handleRejectUser = async (userId, userName) => {
    if (!confirm(`Rejeitar usuario ${userName}?`)) return;

    try {
      await api.rejectUser(authToken, userId, user.email);
      alert('Usuario rejeitado!');
      await loadAdminData(authToken);
    } catch (err) {
      alert('Erro ao rejeitar usuario');
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

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 mb-2">Painel Admin</h1>
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

        {/* Cadastrar Presente */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cadastrar Presente</h2>
          <AdminGiftForm onSubmit={handleAddGift} />
        </div>

        {/* Email Logs */}
        <EmailStatus logs={emailLogs} />

        {/* User Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Gerenciar Usuarios</h2>

          {/* Pending Users */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Aguardando Aprovacao ({pendingUsers.length})
            </h3>
            {pendingUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Data</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {u.photoURL && (
                              <img src={u.photoURL} alt={u.displayName} className="w-8 h-8 rounded-full" />
                            )}
                            <span className="font-medium">{u.displayName || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{u.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {u.createdAt ? new Date(u.createdAt._seconds * 1000).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApproveUser(u.userId, u.displayName || u.email)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded transition"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejectUser(u.userId, u.displayName || u.email)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition"
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
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum usuario pendente.</p>
            )}
          </div>

          {/* Approved Users */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Usuarios Aprovados ({approvedUsers.length})
            </h3>
            {approvedUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Presente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedUsers.map((u, idx) => {
                      const gift = gifts.find(g => g.id === u.selectedGift);
                      return (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {u.photoURL && (
                                <img src={u.photoURL} alt={u.displayName} className="w-8 h-8 rounded-full" />
                              )}
                              <span className="font-medium">{u.displayName || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{u.email}</td>
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
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum usuario aprovado ainda.</p>
            )}
          </div>
        </div>

        {/* Gifts List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Todos os Presentes</h2>
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
                        <span className="text-green-600 font-bold">Escolhido</span>
                      ) : (
                        <span className="text-gray-400">Disponivel</span>
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
    </div>
  );
}

export default AdminPage;

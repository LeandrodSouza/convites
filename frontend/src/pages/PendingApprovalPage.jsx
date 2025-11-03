import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

function PendingApprovalPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Aguardando Aprovacao
          </h1>
          <p className="text-gray-600">
            Seu acesso esta sendo analisado
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">O que aconteceu?</h3>
              <p className="text-sm text-gray-700">
                Voce fez login com sucesso, mas precisa da aprovacao de um administrador para acessar o sistema.
              </p>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Informacoes da sua conta:</p>
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{user.displayName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-2xl">1.</span>
            <div>
              <p className="font-medium text-gray-800">Notificacao automatica</p>
              <p className="text-gray-600">Os administradores ja foram notificados sobre sua solicitacao</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <span className="text-2xl">2.</span>
            <div>
              <p className="font-medium text-gray-800">Aguarde a aprovacao</p>
              <p className="text-gray-600">Voce recebera acesso assim que um admin aprovar sua conta</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <span className="text-2xl">3.</span>
            <div>
              <p className="font-medium text-gray-800">Volte mais tarde</p>
              <p className="text-gray-600">Faca login novamente em algumas horas para verificar se foi aprovado</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingApprovalPage;

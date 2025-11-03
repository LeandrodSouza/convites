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
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Top Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-accent mb-2 tracking-tight">
            Brunch de Casa Nova
          </h1>
          <p className="text-base text-gray-600 font-medium">Família Andrade Silva convida</p>
        </div>

        <div className="bg-white rounded-card border border-border shadow-subtle p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-accent mb-2 tracking-tight">
              Aguardando Confirmação
            </h2>
            <p className="text-sm text-gray-600">
              Seu acesso está sendo analisado
            </p>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-secondary border border-border rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full border-2 border-primary"
                  />
                )}
                <div>
                  <p className="font-medium text-accent">{user.displayName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-brand-light border border-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-accent mb-1">O que aconteceu?</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Você fez login com sucesso, mas precisa da aprovação de um administrador para acessar o evento.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-accent mb-0.5">Notificação enviada</p>
                <p className="text-xs text-gray-600">Os administradores já foram notificados sobre sua solicitação</p>
              </div>
            </div>

            <div className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <p className="font-medium text-accent mb-0.5">Aguarde a aprovação</p>
                <p className="text-xs text-gray-600">Você receberá acesso assim que um admin aprovar sua conta</p>
              </div>
            </div>

            <div className="flex gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-accent mb-0.5">Volte mais tarde</p>
                <p className="text-xs text-gray-600">Faça login novamente para verificar se foi aprovado</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-white border border-border hover:bg-secondary text-accent font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Em caso de dúvidas, entre em contato com os organizadores
        </p>
      </div>
    </div>
  );
}

export default PendingApprovalPage;

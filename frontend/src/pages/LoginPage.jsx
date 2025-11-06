import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { getUserById } from '../services/userService';

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processAuth = async (session) => {
    setLoading(true);
    try {
      const user = session.user;
      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const isAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

      if (isAdmin) {
        navigate('/admin');
        return;
      }

      const token = session.provider_token;
      await api.createOrUpdateUser(token, user.email, user.user_metadata.full_name, user.user_metadata.avatar_url);
      const userStatus = await getUserById(user.id);

      if (userStatus?.status === 'approved') {
        navigate('/home');
      } else if (userStatus?.status === 'rejected') {
        setError('Seu acesso foi negado. Fale com os administradores.');
        await supabase.auth.signOut();
      } else {
        navigate('/pending');
      }
    } catch (err) {
      console.error('Erro ao processar autenticação:', err);
      setError('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        processAuth(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError('Falha ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-20"
        style={{ backgroundImage: 'url(/nossobrunch.png)' }}
      />

      {/* Login Card */}
      <div className="bg-white/85 backdrop-blur-md p-8 md:p-12 rounded-card border border-border shadow-subtle max-w-md w-full text-center relative z-10">
        <div className="mb-8">
          <h1 className="font-meow text-primary leading-tight">
            <span className="text-6xl">Nosso Brunch</span>
            <br />
            <span className="text-5xl">de casa nova💚</span>
          </h1>
          <p className="text-gray-600 mt-4">Faça login para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            'Carregando...'
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </>
          )}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>Use sua conta Google para continuar</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

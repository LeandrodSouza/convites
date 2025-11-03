import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { api } from '../services/api';

function InvitePage({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = searchParams.get('t');

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou ausente');
      return;
    }

    // Verify token validity
    api.verifyInvite(token).then(data => {
      if (data.error) {
        setError('Convite inválido ou expirado');
      }
    });
  }, [token]);

  useEffect(() => {
    if (user && token) {
      handleUseInvite();
    } else if (!user && token) {
      // Se não está logado mas tem token, redireciona para login com returnUrl
      navigate(`/login?returnUrl=${encodeURIComponent('/invite?t=' + token)}`);
    }
  }, [user, token]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleUseInvite = async () => {
    try {
      const result = await api.useInvite(token, user.email, user.displayName);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/home?t=' + token);
      }
    } catch (err) {
      setError('Erro ao ativar convite');
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Token Inválido</h1>
          <p className="text-gray-700">Não foi possível encontrar o convite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">🎉</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Chá de Panela</h2>
          <p className="text-gray-600">Você foi convidado! Faça login para continuar.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!user && (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}

export default InvitePage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { api } from '../services/api';
import { getUserById } from '../services/userService';

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processAuth = async (user) => {
    setLoading(true);
    try {
      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
      const isAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

      if (isAdmin) {
        navigate('/admin');
        return;
      }

      const token = await user.getIdToken();
      await api.createOrUpdateUser(token, user.email, user.displayName, user.photoURL);
      const userStatus = await getUserById(user.uid);

      if (userStatus?.status === 'approved') {
        navigate('/home');
      } else if (userStatus?.status === 'rejected') {
        setError('Seu acesso foi negado. Fale com os administradores.');
        await auth.signOut();
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
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        processAuth(user);
      }
    });

    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          await processAuth(result.user);
        }
      } catch (error) {
        console.error("Redirect Error:", error);
        setError("Falha ao autenticar. Tente novamente.");
      }
    })();

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing.
      } else {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setError('Falha ao fazer login. Tente novamente.');
          console.error(redirectErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-7xl font-meow text-gray-800">Nosso Brunch</h1>
          <p className="text-gray-600 mt-2">de casa nova</p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Bem-vindo!</h2>
            <p className="text-gray-500">Faça login para continuar</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Para uma melhor experiência, use o Google Chrome.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

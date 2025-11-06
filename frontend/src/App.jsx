import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import InvitePage from './pages/InvitePage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-2xl text-primary">Carregando...</div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pending" element={user ? <PendingApprovalPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/invite" element={user ? <InvitePage user={user} /> : <Navigate to="/login" />} />
        <Route path="/home" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <AdminPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

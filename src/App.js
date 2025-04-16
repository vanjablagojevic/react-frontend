import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserList from './pages/UserList';
import AdminRoute from './components/AdminRoute';
import UserHistory from './pages/UserHistory';
import AuditLog from './pages/AuditLog';

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('jwt'));

  // Update token state kad se promijeni u sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem('jwt'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginForm />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <RegisterForm />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }
        />
        <Route
          path="/user-history"
          element={
            <AdminRoute>
              <UserHistory />
            </AdminRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <AdminRoute>
              <AuditLog />
            </AdminRoute>
          }
        />

        {/* catch-all: ako neko upiše nepostojeći URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

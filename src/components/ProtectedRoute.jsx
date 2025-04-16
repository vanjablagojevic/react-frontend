// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = sessionStorage.getItem('jwt');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = JSON.parse(atob(token.split('.')[1]));
  const userRole = payload?.role;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

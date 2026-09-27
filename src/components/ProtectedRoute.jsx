import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, vaultKey } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token existe (ex.: após F5), mas a vaultKey sumiu da memória → desbloquear
  if (!vaultKey) {
    return <Navigate to="/unlock" replace />;
  }

  return children;
}

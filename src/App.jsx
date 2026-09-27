import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnlockPage from './pages/UnlockPage';
import VaultPage from './pages/VaultPage';
import VaultItemFormPage from './pages/VaultItemFormPage';

function PublicOnly({ children }) {
  const { isAuthenticated, token, vaultKey } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  // Token sem chave → precisa desbloquear, não login
  if (token && !vaultKey) return <Navigate to="/unlock" replace />;
  return children;
}

function UnlockOnly({ children }) {
  const { token, vaultKey } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (vaultKey) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <AppNavbar />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />
        <Route
          path="/unlock"
          element={
            <UnlockOnly>
              <UnlockPage />
            </UnlockOnly>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <VaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/new"
          element={
            <ProtectedRoute>
              <VaultItemFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id/edit"
          element={
            <ProtectedRoute>
              <VaultItemFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser, getMe } from '../api/authApi';
import {
  deriveVaultKey,
  generateSalt,
  DEFAULT_KDF_PARAMS,
} from '../crypto/vaultCrypto';

const AuthContext = createContext(null);

const TOKEN_KEY = 'pm-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [vaultKey, setVaultKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setVaultKey(null);
  }, []);

  const applySession = useCallback(async (authData, masterPassword) => {
    const nextToken = authData.token;
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);

    const profile = {
      _id: authData._id,
      name: authData.name,
      email: authData.email,
      kdfSalt: authData.kdfSalt,
      kdfParams: authData.kdfParams,
      active: authData.active,
    };
    setUser(profile);

    const key = await deriveVaultKey(
      masterPassword,
      authData.kdfSalt,
      authData.kdfParams || DEFAULT_KDF_PARAMS
    );
    setVaultKey(key);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const data = await loginUser({ email, password });
        await applySession(data, password);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      try {
        const kdfSalt = generateSalt();
        await registerUser({
          name,
          email,
          password,
          kdfSalt,
          kdfParams: DEFAULT_KDF_PARAMS,
        });
        const data = await loginUser({ email, password });
        await applySession(data, password);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const restoreSession = useCallback(
    async (masterPassword) => {
      if (!token) return false;
      setLoading(true);
      try {
        const profile = await getMe(token);
        setUser(profile);
        const key = await deriveVaultKey(
          masterPassword,
          profile.kdfSalt,
          profile.kdfParams || DEFAULT_KDF_PARAMS
        );
        setVaultKey(key);
        return true;
      } catch {
        logout();
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      vaultKey,
      loading,
      isAuthenticated: Boolean(token && vaultKey),
      login,
      register,
      logout,
      restoreSession,
    }),
    [token, user, vaultKey, loading, login, register, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

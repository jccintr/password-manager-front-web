import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'pm-theme-preference';

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference) {
  const isDark =
    preference === 'dark' || (preference === 'system' && getSystemDark());
  document.documentElement.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    applyTheme(preference);

    if (preference !== 'system') return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      isDark:
        preference === 'dark' ||
        (preference === 'system' && getSystemDark()),
    }),
    [preference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}

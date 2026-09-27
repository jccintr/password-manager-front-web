import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';

export default function UnlockPage() {
  const { restoreSession, logout, loading, token } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!token) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const ok = await restoreSession(password);
      if (!ok) {
        setError('Não foi possível desbloquear. Faça login novamente.');
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Senha mestra incorreta ou sessão inválida.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Desbloquear cofre</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sua sessão continua ativa, mas a chave do cofre não fica salva. Informe a senha mestra
          para descriptografar os itens neste dispositivo.
        </p>

        {error && (
          <Alert color="failure" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="unlock-password">Senha mestra</Label>
            <TextInput
              id="unlock-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" color="blue" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" light />
                Desbloqueando…
              </span>
            ) : (
              'Desbloquear'
            )}
          </Button>
          <Button type="button" color="gray" onClick={handleLogout} disabled={loading}>
            Sair e usar outra conta
          </Button>
        </form>
      </Card>
    </div>
  );
}

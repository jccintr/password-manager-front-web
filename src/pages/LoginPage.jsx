import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Falha no login');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entrar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use a senha mestra. A chave do cofre é derivada só neste dispositivo.
        </p>

        {error && (
          <Alert color="failure" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha mestra</Label>
            <TextInput
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" color="blue" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Entrando…
              </span>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Não tem conta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}

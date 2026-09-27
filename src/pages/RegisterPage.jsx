import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput, Alert } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Falha no cadastro');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar conta</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A senha mestra protege o login e deriva a chave do cofre neste dispositivo.
        </p>

        {error && (
          <Alert color="failure" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Nome</Label>
            <TextInput
              id="name"
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha mestra</Label>
            <TextInput
              id="password"
              type="password"
              required
              minLength={3}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <TextInput
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}

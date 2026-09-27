import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Label, TextInput, Textarea, Spinner } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';
import {
  createVaultItem,
  listVaultItems,
  updateVaultItem,
} from '../api/vaultApi';
import { decryptPayload, encryptPayload } from '../crypto/vaultCrypto';

const emptyForm = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
};

export default function VaultItemFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, vaultKey } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return undefined;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await listVaultItems(token);
        const item = items.find((i) => i._id === id);
        if (!item) {
          throw new Error('Item não encontrado.');
        }
        const data = await decryptPayload(item.ciphertext, item.nonce, vaultKey);
        if (!cancelled) {
          setForm({
            title: data.title || '',
            username: data.username || '',
            password: data.password || '',
            url: data.url || '',
            notes: data.notes || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar item');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, token, vaultKey]);

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Informe um título.');
      return;
    }
    if (!form.password) {
      setError('Informe a senha.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        username: form.username.trim(),
        password: form.password,
        url: form.url.trim(),
        notes: form.notes.trim(),
      };
      const encrypted = await encryptPayload(payload, vaultKey);

      if (isEdit) {
        await updateVaultItem(id, encrypted, token);
      } else {
        await createVaultItem(encrypted, token);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar item' : 'Nova senha'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Os dados são cifrados neste navegador antes de enviar à API.
        </p>

        {error && (
          <Alert color="failure" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Título</Label>
            <TextInput
              id="title"
              required
              placeholder="Google, Banco…"
              value={form.title}
              onChange={onChange('title')}
            />
          </div>
          <div>
            <Label htmlFor="username">Usuário / email</Label>
            <TextInput
              id="username"
              value={form.username}
              onChange={onChange('username')}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <TextInput
              id="password"
              type="text"
              required
              value={form.password}
              onChange={onChange('password')}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="url">URL</Label>
            <TextInput
              id="url"
              type="url"
              placeholder="https://"
              value={form.url}
              onChange={onChange('url')}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={onChange('notes')}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={saving} className="sm:flex-1">
              {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Salvar no cofre'}
            </Button>
            <Button color="gray" as={Link} to="/" className="sm:flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

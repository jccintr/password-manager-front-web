import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Spinner,
  TextInput,
  Badge,
} from 'flowbite-react';
import { useAuth } from '../context/AuthContext';
import { listVaultItems, deleteVaultItem } from '../api/vaultApi';
import { decryptPayload } from '../crypto/vaultCrypto';

export default function VaultPage() {
  const { token, vaultKey } = useAuth();
  const [rawItems, setRawItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await listVaultItems(token);
      setRawItems(items);

      const decrypted = [];
      for (const item of items) {
        try {
          const data = await decryptPayload(item.ciphertext, item.nonce, vaultKey);
          decrypted.push({ id: item._id, ...data });
        } catch {
          decrypted.push({
            id: item._id,
            title: '(não foi possível descriptografar)',
            username: '',
            password: '',
            url: '',
            notes: '',
            corrupt: true,
          });
        }
      }
      setEntries(decrypted);
    } catch (err) {
      setError(err.message || 'Erro ao carregar cofre');
    } finally {
      setLoading(false);
    }
  }, [token, vaultKey]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.username?.toLowerCase().includes(q) ||
        e.url?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este item do cofre?')) return;
    try {
      await deleteVaultItem(id, token);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setRawItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleReveal = (id) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu cofre</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rawItems.length} item(ns) · busca apenas neste dispositivo
          </p>
        </div>
        <Button as={Link} to="/items/new">
          Nova senha
        </Button>
      </div>

      <TextInput
        className="mb-4"
        placeholder="Buscar por título, usuário, URL…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">
            {query ? 'Nenhum resultado para a busca.' : 'Nenhuma senha salva ainda.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="w-full">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                      {entry.title || 'Sem título'}
                    </h2>
                    {entry.corrupt && <Badge color="failure">Erro</Badge>}
                  </div>
                  {entry.username && (
                    <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                      {entry.username}
                    </p>
                  )}
                  {entry.url && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {entry.url}
                    </a>
                  )}
                  {!entry.corrupt && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">
                        {revealed[entry.id] ? entry.password : '••••••••'}
                      </code>
                      <Button size="xs" color="gray" onClick={() => toggleReveal(entry.id)}>
                        {revealed[entry.id] ? 'Ocultar' : 'Mostrar'}
                      </Button>
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => copyText(entry.password)}
                      >
                        Copiar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" color="light" as={Link} to={`/items/${entry.id}/edit`}>
                    Editar
                  </Button>
                  <Button size="sm" color="failure" onClick={() => handleDelete(entry.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

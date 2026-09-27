import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Spinner,
  TextInput,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'flowbite-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listVaultItems, deleteVaultItem } from '../api/vaultApi';
import { decryptPayload } from '../crypto/vaultCrypto';
import { IconEye, IconEyeOff, IconCopy } from '../components/Icons';

const REVEAL_MS = 5000;

export default function VaultPage() {
  const { token, vaultKey } = useAuth();
  const { showToast } = useToast();
  const [rawItems, setRawItems] = useState([]);
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const hideTimers = useRef({});

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

  useEffect(() => {
    const timers = hideTimers.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

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

  const clearRevealTimer = (id) => {
    if (hideTimers.current[id]) {
      clearTimeout(hideTimers.current[id]);
      delete hideTimers.current[id];
    }
  };

  const revealPassword = (id) => {
    clearRevealTimer(id);
    setRevealed((prev) => ({ ...prev, [id]: true }));
    hideTimers.current[id] = setTimeout(() => {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      delete hideTimers.current[id];
    }, REVEAL_MS);
  };

  const hidePassword = (id) => {
    clearRevealTimer(id);
    setRevealed((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggleReveal = (id) => {
    if (revealed[id]) {
      hidePassword(id);
    } else {
      revealPassword(id);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copiado para a área de transferência');
    } catch {
      showToast('Não foi possível copiar', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVaultItem(deleteTarget.id, token);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setRawItems((prev) => prev.filter((i) => i._id !== deleteTarget.id));
      showToast('Item excluído');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
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
        <Button as={Link} to="/items/new" color="blue">
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
                      <Button
                        size="xs"
                        color="gray"
                        onClick={() => toggleReveal(entry.id)}
                        title={revealed[entry.id] ? 'Ocultar' : 'Mostrar'}
                        aria-label={revealed[entry.id] ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {revealed[entry.id] ? <IconEyeOff /> : <IconEye />}
                      </Button>
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => copyText(entry.password)}
                        title="Copiar"
                        aria-label="Copiar senha"
                      >
                        <IconCopy />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" color="light" as={Link} to={`/items/${entry.id}/edit`}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    color="failure"
                    onClick={() => setDeleteTarget({ id: entry.id, title: entry.title })}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal show={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <ModalHeader>Excluir item</ModalHeader>
        <ModalBody>
          <p className="text-gray-600 dark:text-gray-300">
            Tem certeza que deseja excluir{' '}
            <strong>{deleteTarget?.title || 'este item'}</strong>? Esta ação não pode ser desfeita.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" light />
                Excluindo…
              </span>
            ) : (
              'Excluir'
            )}
          </Button>
          <Button color="gray" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

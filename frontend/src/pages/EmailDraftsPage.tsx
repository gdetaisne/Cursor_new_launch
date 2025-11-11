import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Mail, Edit, Trash2, Send, Plus } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:4000';

interface EmailDraft {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  folder?: {
    id: string;
    originCity: string;
    destCity: string;
  };
}

export function EmailDraftsPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/emails/drafts`, {
        params: { page: 1, limit: 50 },
        headers: { 'x-user-id': 'admin' },
      });
      setDrafts(response.data.data);
    } catch (err: any) {
      console.error('Failed to load drafts:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (draftId: string) => {
    navigate(`/admin/emails/compose?draftId=${draftId}`);
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Supprimer ce brouillon ?')) return;

    try {
      await axios.delete(`${API_BASE}/api/emails/drafts/${draftId}`, {
        headers: { 'x-user-id': 'admin' },
      });
      setDrafts(drafts.filter((d) => d.id !== draftId));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSend = async (draftId: string) => {
    if (!confirm('Envoyer cet email ?')) return;

    try {
      await axios.post(
        `${API_BASE}/api/emails/drafts/${draftId}/send`,
        {},
        { headers: { 'x-user-id': 'admin' } }
      );
      alert('✅ Email envoyé !');
      setDrafts(drafts.filter((d) => d.id !== draftId));
    } catch (error: any) {
      console.error('Failed to send:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Brouillons
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {drafts.length} brouillon{drafts.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/emails/compose')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card variant="glass" className="p-4 border-l-4 border-red-500">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Drafts List */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Recipients */}
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      À : {draft.to.join(', ')}
                    </span>
                    {draft.cc.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Cc: {draft.cc.length}
                      </Badge>
                    )}
                  </div>

                  {/* Subject */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {draft.subject || '(Sans objet)'}
                  </h3>

                  {/* Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {stripHtml(draft.bodyHtml) || '(Vide)'}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Modifié {new Date(draft.updatedAt).toLocaleString('fr-FR')}
                    </span>
                    {draft.folder && (
                      <span>
                        📁 {draft.folder.originCity} → {draft.folder.destCity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(draft.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSend(draft.id)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && drafts.length === 0 && !error && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun brouillon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Les brouillons enregistrés apparaîtront ici
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/admin/emails/compose')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un brouillon
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}


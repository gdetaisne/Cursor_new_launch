import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Mail, CheckCircle, XCircle, Loader2, Plus, FileText } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:4000';

interface EmailLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  folder?: {
    id: string;
    originCity: string;
    destCity: string;
  };
  sentByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function EmailsPage() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/emails`, {
        params: { page: 1, limit: 50 },
        headers: { 'x-user-id': 'admin' }, // TODO: real auth
      });
      setEmails(response.data.data);
    } catch (err: any) {
      console.error('Failed to load emails:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des emails');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status === 'SENT').length,
    failed: emails.filter((e) => e.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emails</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Historique des emails envoyés par le système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin/emails/drafts')}>
            <FileText className="w-4 h-4 mr-2" />
            Brouillons
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/emails/compose')}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Envoyés</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.sent}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Échoués</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.failed}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card variant="glass" className="p-4 border-l-4 border-red-500">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Email List */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Objet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {emails.map((email) => (
                <tr
                  key={email.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {email.recipient}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                    {email.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {email.folder ? (
                      <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        {email.folder.originCity} → {email.folder.destCity}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(
                      email.sentAt || email.createdAt
                    ).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        email.status === 'SENT'
                          ? 'success'
                          : email.status === 'FAILED'
                          ? 'danger'
                          : 'secondary'
                      }
                    >
                      {email.status === 'SENT'
                        ? 'Envoyé'
                        : email.status === 'FAILED'
                        ? 'Échoué'
                        : email.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && emails.length === 0 && !error && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun email envoyé pour le moment
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Les emails envoyés via le système apparaîtront ici
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


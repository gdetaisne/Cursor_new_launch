import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailComposer } from '../components/emails/EmailComposer';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:4000';

export function EmailComposePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');
  const [draftData, setDraftData] = useState<any>(null);
  const [loading, setLoading] = useState(!!draftId);

  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  const loadDraft = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/emails/drafts/${id}`, {
        headers: { 'x-user-id': 'admin' },
      });
      setDraftData({
        to: response.data.to,
        cc: response.data.cc,
        bcc: response.data.bcc,
        subject: response.data.subject,
        bodyHtml: response.data.bodyHtml,
        folderId: response.data.folderId,
        inReplyToId: response.data.inReplyToId,
      });
    } catch (error) {
      console.error('Failed to load draft:', error);
      alert('Impossible de charger le brouillon');
    } finally {
      setLoading(false);
    }
  };

  const handleSent = () => {
    alert('✅ Email envoyé avec succès !');
    navigate('/admin/emails');
  };

  const handleSaved = (newDraftId: string) => {
    // Update URL with draft ID if it wasn't there
    if (!draftId) {
      navigate(`/admin/emails/compose?draftId=${newDraftId}`, { replace: true });
    }
  };

  const handleCancel = () => {
    navigate('/admin/emails');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {draftId ? 'Modifier le brouillon' : 'Nouveau message'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Rédigez et envoyez un email
        </p>
      </div>

      <EmailComposer
        draftId={draftId || undefined}
        initialData={draftData}
        onSent={handleSent}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    </div>
  );
}


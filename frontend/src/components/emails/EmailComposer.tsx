import { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Send, Save, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useDebounce } from '../../hooks/useDebounce';

const API_BASE = 'http://localhost:4000';

interface EmailComposerProps {
  draftId?: string;
  onSent?: () => void;
  onSaved?: (draftId: string) => void;
  onCancel?: () => void;
  initialData?: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    bodyHtml?: string;
    folderId?: string;
    inReplyToId?: string;
  };
}

export function EmailComposer({
  draftId,
  onSent,
  onSaved,
  onCancel,
  initialData,
}: EmailComposerProps) {
  const [to, setTo] = useState(initialData?.to?.join(', ') || '');
  const [cc, setCc] = useState(initialData?.cc?.join(', ') || '');
  const [bcc, setBcc] = useState(initialData?.bcc?.join(', ') || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [bodyHtml, setBodyHtml] = useState(initialData?.bodyHtml || '');
  const [showCc, setShowCc] = useState(!!initialData?.cc?.length);
  const [showBcc, setShowBcc] = useState(!!initialData?.bcc?.length);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(draftId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save debounced
  const debouncedTo = useDebounce(to, 5000);
  const debouncedSubject = useDebounce(subject, 5000);
  const debouncedBodyHtml = useDebounce(bodyHtml, 5000);

  // Auto-save effect
  useEffect(() => {
    if (!debouncedTo || !debouncedSubject || !debouncedBodyHtml) return;

    const autoSave = async () => {
      try {
        await handleSave(true);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    autoSave();
  }, [debouncedTo, debouncedSubject, debouncedBodyHtml]);

  const parseEmails = (str: string): string[] => {
    return str
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
  };

  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true);

    try {
      const data = {
        to: parseEmails(to),
        cc: parseEmails(cc),
        bcc: parseEmails(bcc),
        subject,
        bodyHtml,
        folderId: initialData?.folderId,
        inReplyToId: initialData?.inReplyToId,
      };

      let draft;
      if (currentDraftId) {
        const response = await axios.patch(
          `${API_BASE}/api/emails/drafts/${currentDraftId}`,
          data,
          { headers: { 'x-user-id': 'admin' } }
        );
        draft = response.data;
      } else {
        const response = await axios.post(`${API_BASE}/api/emails/drafts`, data, {
          headers: { 'x-user-id': 'admin' },
        });
        draft = response.data;
        setCurrentDraftId(draft.id);
        onSaved?.(draft.id);
      }

      setLastSaved(new Date());
      if (!silent) {
        alert('✅ Brouillon enregistré !');
      }
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      if (!silent) {
        alert(`Erreur : ${error.response?.data?.message || error.message}`);
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!to || !subject) {
      alert('⚠️ Destinataire et sujet requis');
      return;
    }

    setSending(true);

    try {
      // Save first if not already saved
      if (!currentDraftId) {
        await handleSave(true);
      }

      if (!currentDraftId) {
        throw new Error('Failed to create draft');
      }

      // Send draft
      await axios.post(
        `${API_BASE}/api/emails/drafts/${currentDraftId}/send`,
        {},
        { headers: { 'x-user-id': 'admin' } }
      );

      alert('✅ Email envoyé !');
      onSent?.();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      alert(`Erreur : ${error.response?.data?.message || error.message}`);
    } finally {
      setSending(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <Card variant="glass-strong" className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Nouveau message
        </h2>
        {lastSaved && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            💾 Auto-enregistré à {lastSaved.toLocaleTimeString('fr-FR')}
          </span>
        )}
      </div>

      {/* Recipients */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
            À :
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinataire@example.com"
            className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {showCc && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
              Cc :
            </label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {showBcc && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
              Bcc :
            </label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
              className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
            Objet :
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet de l'email"
            className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="mb-4">
        <ReactQuill
          theme="snow"
          value={bodyHtml}
          onChange={setBodyHtml}
          modules={modules}
          placeholder="Rédigez votre message..."
          className="bg-white dark:bg-gray-800 rounded-lg"
          style={{ height: '300px', marginBottom: '50px' }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={sending || !to || !subject}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>

          <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>

        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        )}
      </div>
    </Card>
  );
}

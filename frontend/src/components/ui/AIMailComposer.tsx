import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { X, Sparkles, Send } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

interface AIMailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    clientName?: string;
    clientEmail?: string;
    folderName?: string;
    folderId?: string;
    volume?: number;
    originCity?: string;
    destinationCity?: string;
  };
  onSend?: (draft: { subject: string; body: string }) => void;
}

const draftTemplates = [
  {
    id: 'reminder',
    name: 'Relance client',
    subject: 'Votre déménagement - {{folderName}}',
    body: 'Bonjour {{clientName}},\n\nNous revenons vers vous concernant votre déménagement de {{volume}}m³ de {{originCity}} vers {{destinationCity}}.\n\nPouvez-vous nous confirmer votre disponibilité ?\n\nCordialement,\nL\'équipe Moverz',
  },
  {
    id: 'quote_request',
    name: 'Demande devis',
    subject: 'Nouvelle demande de devis - {{folderName}}',
    body: 'Bonjour,\n\nNous avons un nouveau dossier de déménagement :\n- Volume: {{volume}}m³\n- Trajet: {{originCity}} → {{destinationCity}}\n\nPouvez-vous nous faire parvenir votre devis ?\n\nMerci,\nL\'équipe',
  },
  {
    id: 'confirmation',
    name: 'Confirmation',
    subject: 'Confirmation de votre déménagement',
    body: 'Bonjour {{clientName}},\n\nNous confirmons votre déménagement :\n- Volume: {{volume}}m³\n- De: {{originCity}}\n- Vers: {{destinationCity}}\n\nL\'équipe vous recontactera sous 24h.\n\nCordialement',
  },
];

export function AIMailComposer({ isOpen, onClose, context, onSend }: AIMailComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const fillTemplate = (templateId: string) => {
    const template = draftTemplates.find((t) => t.id === templateId);
    if (!template || !context) return;

    let filledSubject = template.subject;
    let filledBody = template.body;

    // Simple template replacement
    const replacements: Record<string, string> = {
      '{{clientName}}': context.clientName || 'Client',
      '{{folderName}}': context.folderName || 'Dossier',
      '{{volume}}': context.volume?.toString() || '0',
      '{{originCity}}': context.originCity || 'Ville A',
      '{{destinationCity}}': context.destinationCity || 'Ville B',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      filledSubject = filledSubject.replace(new RegExp(key, 'g'), value);
      filledBody = filledBody.replace(new RegExp(key, 'g'), value);
    });

    setSubject(filledSubject);
    setBody(filledBody);
    setSelectedTemplate(templateId);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      if (context) {
        fillTemplate('reminder');
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!subject || !body) {
      alert('Veuillez remplir l\'objet et le message');
      return;
    }

    // Default recipient email or from context
    const recipientEmail = context?.clientEmail || 'test@example.com';

    try {
      await axios.post(
        `${API_BASE}/api/emails/send`,
        {
          to: recipientEmail,
          subject,
          body: `<html><body>${body.replace(/\n/g, '<br>')}</body></html>`,
          folderId: context?.folderId,
          type: 'CLIENT_REMINDER',
        },
        {
          headers: { 'x-user-id': 'admin' }, // TODO: real auth
        }
      );

      alert('✅ Email envoyé avec succès !');
      
      if (onSend) {
        onSend({ subject, body });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erreur envoi email:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      alert(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card variant="glass-strong" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Mail Composer
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assistance IA pour rédiger vos emails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Context Info */}
          {context && (
            <Card variant="glass" className="p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Contexte
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                {context.clientName && (
                  <div>Client: <strong>{context.clientName}</strong></div>
                )}
                {context.folderName && (
                  <div>Dossier: <strong>{context.folderName}</strong></div>
                )}
                {context.volume && (
                  <div>Volume: <strong>{context.volume}m³</strong></div>
                )}
                {context.originCity && context.destinationCity && (
                  <div className="col-span-2">
                    Trajet: <strong>{context.originCity} → {context.destinationCity}</strong>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Templates */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Modèles suggérés
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {draftTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => fillTemplate(template.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Génération en cours...' : 'Générer un email IA'}
          </Button>

          {/* Email Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Objet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sujet de l'email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Corps de l'email..."
              />
            </div>
          </div>

          {/* Note */}
          <Card variant="glass" className="p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 <strong>Note:</strong> L'IA génère un brouillon que vous pouvez éditer avant envoi.
              Aucun email n'est envoyé automatiquement.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleSend}
              disabled={!subject || !body}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


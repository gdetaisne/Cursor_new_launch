import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  MapPin,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

// Mock data
const mockQuote = {
  id: 'q1',
  mover: {
    id: 'm1',
    name: 'Move Express',
    email: 'contact@moveexpress.fr',
    phone: '+33 6 98 76 54 32',
    rating: 4.5,
  },
  folder: {
    id: '1',
    name: 'Déménagement Dupont',
    client: 'Jean Dupont',
    volume: 35,
    originCity: 'Paris',
    destinationCity: 'Lyon',
    movingDate: '2025-12-15',
  },
  amount: 2800,
  status: 'PENDING',
  validUntil: '2025-12-01',
  createdAt: '2025-11-02T14:30:00Z',
  responseTime: '24h',
  details: {
    basePrice: 2400,
    packingService: 300,
    insurance: 100,
    notes: 'Disponible pour cette date. Équipe de 3 déménageurs. Matériel de protection inclus.',
  },
};

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  ACCEPTED: { label: 'Accepté', variant: 'success' as const },
  REJECTED: { label: 'Refusé', variant: 'danger' as const },
  EXPIRED: { label: 'Expiré', variant: 'default' as const },
};

export function QuoteDetailPage() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [quote] = useState(mockQuote);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  console.log('Quote ID:', quoteId);

  const handleAccept = () => {
    // TODO: Call API to accept quote
    console.log('Accepting quote:', quoteId);
    setShowAcceptModal(false);
    // Navigate back or show success
    navigate('/admin/quotes');
  };

  const handleReject = () => {
    // TODO: Call API to reject quote
    console.log('Rejecting quote:', quoteId);
    setShowRejectModal(false);
    // Navigate back or show success
    navigate('/admin/quotes');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/quotes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Devis #{quote.id}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {quote.mover.name} • {quote.folder.name}
            </p>
          </div>
          <Badge variant={statusConfig[quote.status as keyof typeof statusConfig].variant}>
            {statusConfig[quote.status as keyof typeof statusConfig].label}
          </Badge>
        </div>

        {/* Actions (only for PENDING quotes) */}
        {quote.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button
              variant="success"
              size="md"
              onClick={() => setShowAcceptModal(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepter
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Refuser
            </Button>
          </div>
        )}
      </div>

      {/* Main content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Quote details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount breakdown */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Détails du Prix
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Prix de base
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quote.details.basePrice.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Service d'emballage
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quote.details.packingService.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Assurance
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quote.details.insurance.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="flex justify-between py-3 pt-4">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {quote.amount.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Notes du Déménageur
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {quote.details.notes}
            </p>
          </Card>

          {/* Folder info */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              Informations du Dossier
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Nom du dossier
                </span>
                <button
                  onClick={() => navigate(`/admin/folders/${quote.folder.id}`)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {quote.folder.name}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Client
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {quote.folder.client}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Volume
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {quote.folder.volume} m³
                </span>
              </div>
              <div className="flex items-start justify-between pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trajet</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {quote.folder.originCity} → {quote.folder.destinationCity}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Date de déménagement
                  </span>
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(quote.folder.movingDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Mover info & metadata */}
        <div className="space-y-6">
          {/* Mover info */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Déménageur
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {quote.mover.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Note: {quote.mover.rating}/5 ⭐
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${quote.mover.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {quote.mover.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${quote.mover.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {quote.mover.phone}
                  </a>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate(`/admin/movers/${quote.mover.id}`)}
              >
                Voir profil
              </Button>
            </div>
          </Card>

          {/* Metadata */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Métadonnées
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Temps de réponse
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                    {quote.responseTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Créé le
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Valide jusqu'au
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">
                    {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass-strong" className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Accepter ce devis ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Le client sera notifié et le déménageur sera confirmé pour ce dossier.
              Montant: <strong>{quote.amount.toLocaleString('fr-FR')} €</strong>
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowAcceptModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="success"
                size="md"
                className="flex-1"
                onClick={handleAccept}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass-strong" className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Refuser ce devis ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Le déménageur sera notifié du refus. Cette action est définitive.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowRejectModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Confirmer le refus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


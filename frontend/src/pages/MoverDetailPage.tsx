import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  FileText,
  Ban,
  CheckCircle,
  Building2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

// Mock data
const mockMover = {
  id: 'm1',
  name: 'Move Express',
  email: 'contact@moveexpress.fr',
  phone: '+33 6 98 76 54 32',
  siret: '123 456 789 00012',
  address: '15 Rue de la Logistique, 75012 Paris',
  city: 'Paris',
  rating: 4.5,
  reviewsCount: 24,
  status: 'ACTIVE',
  createdAt: '2024-01-15T10:00:00Z',
  stats: {
    quotesSubmitted: 24,
    quotesAccepted: 18,
    quotesRejected: 4,
    quotesPending: 2,
    acceptanceRate: 75,
    avgAmount: 2850,
    totalRevenue: 51300,
  },
  recentQuotes: [
    {
      id: 'q1',
      folderName: 'Déménagement Dupont',
      amount: 2800,
      status: 'PENDING',
      createdAt: '2025-11-02',
    },
    {
      id: 'q2',
      folderName: 'Déménagement Martin',
      amount: 3200,
      status: 'ACCEPTED',
      createdAt: '2025-10-28',
    },
    {
      id: 'q6',
      folderName: 'Déménagement Rousseau',
      amount: 2650,
      status: 'REJECTED',
      createdAt: '2025-10-15',
    },
  ],
};

const statusConfig = {
  ACTIVE: { label: 'Actif', variant: 'success' as const },
  BLACKLISTED: { label: 'Blacklisté', variant: 'danger' as const },
};

const quoteStatusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  ACCEPTED: { label: 'Accepté', variant: 'success' as const },
  REJECTED: { label: 'Refusé', variant: 'danger' as const },
  EXPIRED: { label: 'Expiré', variant: 'default' as const },
};

export function MoverDetailPage() {
  const { moverId } = useParams();
  const navigate = useNavigate();
  const [mover, setMover] = useState(mockMover);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showUnblacklistModal, setShowUnblacklistModal] = useState(false);

  console.log('Mover ID:', moverId);

  const handleBlacklist = () => {
    // TODO: Call API to blacklist mover
    console.log('Blacklisting mover:', moverId);
    setMover({ ...mover, status: 'BLACKLISTED' });
    setShowBlacklistModal(false);
  };

  const handleUnblacklist = () => {
    // TODO: Call API to unblacklist mover
    console.log('Unblacklisting mover:', moverId);
    setMover({ ...mover, status: 'ACTIVE' });
    setShowUnblacklistModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/movers')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mover.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Déménageur #{mover.id}
            </p>
          </div>
          <Badge variant={statusConfig[mover.status as keyof typeof statusConfig].variant}>
            {statusConfig[mover.status as keyof typeof statusConfig].label}
          </Badge>
        </div>

        {/* Blacklist Actions */}
        {mover.status === 'ACTIVE' ? (
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowBlacklistModal(true)}
          >
            <Ban className="w-4 h-4 mr-2" />
            Blacklister
          </Button>
        ) : (
          <Button
            variant="success"
            size="md"
            onClick={() => setShowUnblacklistModal(true)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Réactiver
          </Button>
        )}
      </div>

      {/* Main content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Informations
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${mover.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mover.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${mover.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mover.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {mover.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white font-mono">
                  SIRET: {mover.siret}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {mover.rating}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / 5 ({mover.reviewsCount} avis)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Devis soumis
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {mover.stats.quotesSubmitted}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Taux d'acceptation
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {mover.stats.acceptanceRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Montant moyen
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {mover.stats.avgAmount.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CA total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(mover.stats.totalRevenue / 1000)}k €
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Recent Quotes */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Devis récents
            </h2>
            <div className="space-y-3">
              {mover.recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {quote.folderName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {quote.amount.toLocaleString('fr-FR')} €
                    </span>
                    <Badge variant={quoteStatusConfig[quote.status as keyof typeof quoteStatusConfig].variant}>
                      {quoteStatusConfig[quote.status as keyof typeof quoteStatusConfig].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/admin/quotes?mover=' + mover.id)}
            >
              Voir tous les devis
            </Button>
          </Card>
        </div>

        {/* Right column - Quick info */}
        <div className="space-y-6">
          {/* Summary */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Résumé
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ville
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mover.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Devis acceptés
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {mover.stats.quotesAccepted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Devis refusés
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {mover.stats.quotesRejected}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  En attente
                </span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {mover.stats.quotesPending}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Membre depuis
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(mover.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Taux d'acceptation
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {mover.stats.acceptanceRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${mover.stats.acceptanceRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Note moyenne
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {mover.rating}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(mover.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass-strong" className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Blacklister ce déménageur ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>{mover.name}</strong> ne recevra plus de demandes de devis.
              Cette action peut être annulée plus tard.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowBlacklistModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={handleBlacklist}
              >
                <Ban className="w-4 h-4 mr-2" />
                Blacklister
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Unblacklist Modal */}
      {showUnblacklistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass-strong" className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Réactiver ce déménageur ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>{mover.name}</strong> recevra à nouveau des demandes de devis.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowUnblacklistModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="success"
                size="md"
                className="flex-1"
                onClick={handleUnblacklist}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Réactiver
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


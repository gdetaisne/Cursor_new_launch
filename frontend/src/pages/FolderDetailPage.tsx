import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  FileText,
  DollarSign,
} from 'lucide-react';

// Mock data
const mockFolder = {
  id: '1',
  name: 'Déménagement Dupont',
  status: 'ACTIVE',
  client: {
    id: 'c1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
  },
  volume: 35,
  originCity: 'Paris',
  originAddress: '15 Rue de la Paix, 75002 Paris',
  destinationCity: 'Lyon',
  destinationAddress: '8 Place Bellecour, 69002 Lyon',
  movingDate: '2025-12-15',
  createdAt: '2025-11-01',
  estimatedPrice: 2500,
  quotesCount: 3,
  activeQuoteId: 'q1',
};

const mockTimeline = [
  {
    id: 't1',
    type: 'folder',
    action: 'Dossier créé',
    actor: 'Système',
    timestamp: '2025-11-01T10:00:00Z',
    details: 'Dossier créé par Jean Dupont via le formulaire web',
  },
  {
    id: 't2',
    type: 'quote',
    action: 'Devis envoyé à 3 déménageurs',
    actor: 'Automation',
    timestamp: '2025-11-01T10:15:00Z',
    details: 'Devis envoyés à Move Express, Transport Pro, Déménagement Plus',
  },
  {
    id: 't3',
    type: 'quote',
    action: 'Devis reçu',
    actor: 'Move Express',
    timestamp: '2025-11-02T14:30:00Z',
    details: 'Montant: 2 800€ - Disponibilité confirmée',
  },
  {
    id: 't4',
    type: 'email',
    action: 'Email envoyé au client',
    actor: 'Opérateur (Sophie)',
    timestamp: '2025-11-03T09:00:00Z',
    details: 'Sujet: Récapitulatif de votre demande de déménagement',
  },
  {
    id: 't5',
    type: 'quote',
    action: 'Devis accepté',
    actor: 'Client',
    timestamp: '2025-11-05T16:20:00Z',
    details: 'Devis Move Express accepté - En attente de paiement',
  },
];

const statusConfig = {
  ACTIVE: { label: 'Actif', variant: 'success' as const },
  PENDING: { label: 'En attente', variant: 'warning' as const },
  COMPLETED: { label: 'Terminé', variant: 'default' as const },
  CANCELLED: { label: 'Annulé', variant: 'danger' as const },
};

const timelineIcons = {
  folder: '📁',
  quote: '💼',
  email: '✉️',
  payment: '💳',
  alert: '🔔',
};

export function FolderDetailPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch real data based on folderId
  console.log('Folder ID:', folderId);
  const folder = mockFolder;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/folders')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {folder.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Dossier #{folder.id}
            </p>
          </div>
          <Badge variant={statusConfig[folder.status as keyof typeof statusConfig].variant}>
            {statusConfig[folder.status as keyof typeof statusConfig].label}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="danger" size="md">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Main content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informations Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {folder.client.name}
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <a
                  href={`mailto:${folder.client.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {folder.client.email}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                <a
                  href={`tel:${folder.client.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {folder.client.phone}
                </a>
              </div>
            </div>
          </Card>

          {/* Moving Details */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Détails du Déménagement
            </h2>
            <div className="space-y-4">
              {/* Origin */}
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Départ
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                  {folder.originAddress}
                </p>
              </div>

              {/* Destination */}
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Arrivée
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                  {folder.destinationAddress}
                </p>
              </div>

              {/* Volume & Date */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center mb-1">
                    <Package className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Volume
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                    {folder.volume} m³
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Date
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                    {new Date(folder.movingDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card variant="glass-strong" className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📜 Timeline
            </h2>
            <div className="space-y-4">
              {mockTimeline.map((event, index) => (
                <div
                  key={event.id}
                  className="flex gap-4 relative pb-4 last:pb-0"
                >
                  {/* Timeline line */}
                  {index < mockTimeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center relative z-10">
                    <span className="text-sm">
                      {timelineIcons[event.type as keyof typeof timelineIcons]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.action}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {new Date(event.timestamp).toLocaleString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Par {event.actor}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column - Quick info & actions */}
        <div className="space-y-6">
          {/* Stats */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Résumé
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Devis reçus
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {folder.quotesCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Prix estimé
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {folder.estimatedPrice.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Créé le
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(folder.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick actions */}
          <Card variant="glass" className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Button variant="primary" size="md" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Voir les devis
              </Button>
              <Button variant="secondary" size="md" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Gérer les paiements
              </Button>
              <Button variant="secondary" size="md" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un email
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


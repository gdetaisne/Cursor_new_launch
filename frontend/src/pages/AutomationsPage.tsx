import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Play, Pause, Clock, CheckCircle } from 'lucide-react';

// Mock data
const mockAutomations = [
  {
    id: 'auto1',
    name: 'Auto-send Quotes',
    description: 'Envoie automatiquement les devis aux déménageurs',
    status: 'ACTIVE',
    lastRun: '2025-11-10T10:35:00Z',
    nextRun: '2025-11-10T14:00:00Z',
    runsCount: 342,
  },
  {
    id: 'auto2',
    name: 'Client Reminders',
    description: 'Relances automatiques aux clients en attente',
    status: 'ACTIVE',
    lastRun: '2025-11-10T09:00:00Z',
    nextRun: '2025-11-11T09:00:00Z',
    runsCount: 128,
  },
  {
    id: 'auto3',
    name: 'Sync Google Sheets',
    description: 'Synchronisation des déménageurs depuis Google Sheets',
    status: 'PAUSED',
    lastRun: '2025-11-08T18:00:00Z',
    nextRun: null,
    runsCount: 45,
  },
  {
    id: 'auto4',
    name: 'Payment Reminders',
    description: 'Rappels de paiements en attente',
    status: 'ACTIVE',
    lastRun: '2025-11-10T08:30:00Z',
    nextRun: '2025-11-11T08:30:00Z',
    runsCount: 89,
  },
];

const statusConfig = {
  ACTIVE: { label: 'Actif', variant: 'success' as const },
  PAUSED: { label: 'Pausé', variant: 'warning' as const },
  ERROR: { label: 'Erreur', variant: 'danger' as const },
};

export function AutomationsPage() {
  const stats = {
    total: mockAutomations.length,
    active: mockAutomations.filter((a) => a.status === 'ACTIVE').length,
    paused: mockAutomations.filter((a) => a.status === 'PAUSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Automations
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Gérer toutes les automatisations système
        </p>
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
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actives</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.active}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pausées</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.paused}
              </p>
            </div>
            <Pause className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 gap-4">
        {mockAutomations.map((automation) => (
          <Card key={automation.id} variant="glass-strong" className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {automation.name}
                  </h3>
                  <Badge variant={statusConfig[automation.status as keyof typeof statusConfig].variant}>
                    {statusConfig[automation.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {automation.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Dernière exécution</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(automation.lastRun).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Prochaine exécution</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {automation.nextRun
                        ? new Date(automation.nextRun).toLocaleString('fr-FR')
                        : 'Aucune'}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Exécutions totales</p>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      {automation.runsCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {automation.status === 'ACTIVE' ? (
                  <Button variant="warning" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="success" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Activer
                  </Button>
                )}
                <Button variant="secondary" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Run now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


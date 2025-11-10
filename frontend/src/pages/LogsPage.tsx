import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Filter, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

// Mock data
const mockLogs = [
  {
    id: 'log1',
    action: 'folder.created',
    actorType: 'USER',
    actorName: 'Sophie (Admin)',
    entityType: 'Folder',
    entityId: '1',
    status: 'SUCCESS',
    timestamp: '2025-11-10T10:30:00Z',
    details: 'Dossier "Déménagement Dupont" créé',
  },
  {
    id: 'log2',
    action: 'quote.sent',
    actorType: 'AUTOMATION',
    actorName: 'Auto-send Quotes',
    entityType: 'Quote',
    entityId: 'q1',
    status: 'SUCCESS',
    timestamp: '2025-11-10T10:35:00Z',
    details: 'Devis envoyé à 3 déménageurs',
  },
  {
    id: 'log3',
    action: 'email.sent',
    actorType: 'SYSTEM',
    actorName: 'Email Service',
    entityType: 'Email',
    entityId: 'e1',
    status: 'SUCCESS',
    timestamp: '2025-11-10T11:00:00Z',
    details: 'Email de confirmation envoyé au client',
  },
  {
    id: 'log4',
    action: 'payment.failed',
    actorType: 'EXTERNAL_API',
    actorName: 'Stripe API',
    entityType: 'Payment',
    entityId: 'p4',
    status: 'ERROR',
    timestamp: '2025-11-10T12:15:00Z',
    details: 'Erreur: Carte bancaire refusée',
  },
  {
    id: 'log5',
    action: 'mover.blacklisted',
    actorType: 'USER',
    actorName: 'Admin (Guillaume)',
    entityType: 'Mover',
    entityId: 'm3',
    status: 'WARNING',
    timestamp: '2025-11-09T16:45:00Z',
    details: 'Déménageur "Déménagement Plus" blacklisté',
  },
];

const statusConfig = {
  SUCCESS: { label: 'Succès', variant: 'success' as const, icon: CheckCircle },
  ERROR: { label: 'Erreur', variant: 'danger' as const, icon: XCircle },
  WARNING: { label: 'Avertissement', variant: 'warning' as const, icon: AlertCircle },
  INFO: { label: 'Info', variant: 'default' as const, icon: Info },
};

export function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockLogs.length,
    success: mockLogs.filter((l) => l.status === 'SUCCESS').length,
    errors: mockLogs.filter((l) => l.status === 'ERROR').length,
    warnings: mockLogs.filter((l) => l.status === 'WARNING').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Logs & Audit
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Historique complet de toutes les actions système
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total événements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Info className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Succès</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.success}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Erreurs</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.errors}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avertissements</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.warnings}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SUCCESS">Succès</option>
              <option value="ERROR">Erreurs</option>
              <option value="WARNING">Avertissements</option>
              <option value="INFO">Informations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card variant="glass-strong" className="p-6">
        <div className="space-y-4">
          {filteredLogs.map((log, index) => {
            const StatusIcon = statusConfig[log.status as keyof typeof statusConfig].icon;
            return (
              <div
                key={log.id}
                className="relative pb-4 last:pb-0"
              >
                {/* Timeline line */}
                {index < filteredLogs.length - 1 && (
                  <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative z-10">
                    <StatusIcon className={`w-4 h-4 ${
                      log.status === 'SUCCESS' ? 'text-green-600' :
                      log.status === 'ERROR' ? 'text-red-600' :
                      log.status === 'WARNING' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </span>
                        <Badge variant={statusConfig[log.status as keyof typeof statusConfig].variant} className="text-xs">
                          {statusConfig[log.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Par <strong>{log.actorName}</strong> ({log.actorType})</span>
                      <span>•</span>
                      <span>{log.entityType} #{log.entityId}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun log trouvé
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


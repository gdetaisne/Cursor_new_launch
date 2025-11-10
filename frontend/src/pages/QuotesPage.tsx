import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { FileText, Search, Filter, DollarSign } from 'lucide-react';

// Mock data
const mockQuotes = [
  {
    id: 'q1',
    moverName: 'Move Express',
    folderName: 'Déménagement Dupont',
    folderId: '1',
    amount: 2800,
    status: 'PENDING',
    validUntil: '2025-12-01',
    createdAt: '2025-11-02',
    responseTime: '24h',
  },
  {
    id: 'q2',
    moverName: 'Transport Pro',
    folderName: 'Déménagement Martin',
    folderId: '2',
    amount: 3200,
    status: 'ACCEPTED',
    validUntil: '2025-12-05',
    createdAt: '2025-11-03',
    responseTime: '12h',
  },
  {
    id: 'q3',
    moverName: 'Déménagement Plus',
    folderName: 'Déménagement Dupont',
    folderId: '1',
    amount: 2650,
    status: 'REJECTED',
    validUntil: '2025-11-30',
    createdAt: '2025-11-02',
    responseTime: '48h',
  },
  {
    id: 'q4',
    moverName: 'Fast Move',
    folderName: 'Déménagement Lefebvre',
    folderId: '3',
    amount: 1950,
    status: 'EXPIRED',
    validUntil: '2025-11-15',
    createdAt: '2025-10-20',
    responseTime: '6h',
  },
  {
    id: 'q5',
    moverName: 'Move Express',
    folderName: 'Déménagement Bernard',
    folderId: '4',
    amount: 3500,
    status: 'PENDING',
    validUntil: '2025-12-10',
    createdAt: '2025-11-05',
    responseTime: '18h',
  },
];

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  ACCEPTED: { label: 'Accepté', variant: 'success' as const },
  REJECTED: { label: 'Refusé', variant: 'danger' as const },
  EXPIRED: { label: 'Expiré', variant: 'default' as const },
};

export function QuotesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredQuotes = mockQuotes.filter((quote) => {
    const matchesSearch =
      quote.moverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.folderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: mockQuotes.length,
    pending: mockQuotes.filter((q) => q.status === 'PENDING').length,
    accepted: mockQuotes.filter((q) => q.status === 'ACCEPTED').length,
    avgAmount:
      mockQuotes.reduce((acc, q) => acc + q.amount, 0) / mockQuotes.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Devis
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer tous les devis des déménageurs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Acceptés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.accepted}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Montant moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(stats.avgAmount).toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par déménageur ou dossier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptés</option>
              <option value="REJECTED">Refusés</option>
              <option value="EXPIRED">Expirés</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredQuotes.length} devis trouvé{filteredQuotes.length > 1 ? 's' : ''}
      </div>

      {/* Table */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Déménageur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Temps réponse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valide jusqu'au
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {quote.moverName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {quote.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/folders/${quote.folderId}`);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {quote.folderName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {quote.amount.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {quote.responseTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[quote.status as keyof typeof statusConfig].variant}>
                      {statusConfig[quote.status as keyof typeof statusConfig].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/quotes/${quote.id}`);
                      }}
                    >
                      Voir détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun devis trouvé
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { FolderOpen, Search, Filter, Plus } from 'lucide-react';

// Mock data
const mockFolders = [
  {
    id: '1',
    name: 'Déménagement Dupont',
    status: 'ACTIVE',
    client: 'Jean Dupont',
    volume: 35,
    originCity: 'Paris',
    destinationCity: 'Lyon',
    movingDate: '2025-12-15',
    createdAt: '2025-11-01',
  },
  {
    id: '2',
    name: 'Déménagement Martin',
    status: 'PENDING',
    client: 'Marie Martin',
    volume: 50,
    originCity: 'Marseille',
    destinationCity: 'Bordeaux',
    movingDate: '2025-12-20',
    createdAt: '2025-11-03',
  },
  {
    id: '3',
    name: 'Déménagement Lefebvre',
    status: 'COMPLETED',
    client: 'Paul Lefebvre',
    volume: 28,
    originCity: 'Lille',
    destinationCity: 'Nantes',
    movingDate: '2025-11-10',
    createdAt: '2025-10-15',
  },
  {
    id: '4',
    name: 'Déménagement Bernard',
    status: 'CANCELLED',
    client: 'Sophie Bernard',
    volume: 42,
    originCity: 'Toulouse',
    destinationCity: 'Strasbourg',
    movingDate: '2025-12-01',
    createdAt: '2025-10-28',
  },
];

const statusConfig = {
  ACTIVE: { label: 'Actif', variant: 'success' as const },
  PENDING: { label: 'En attente', variant: 'warning' as const },
  COMPLETED: { label: 'Terminé', variant: 'default' as const },
  CANCELLED: { label: 'Annulé', variant: 'danger' as const },
};

export function FoldersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredFolders = mockFolders.filter((folder) => {
    const matchesSearch =
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || folder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dossiers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer tous les dossiers de déménagement
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/admin/folders/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau dossier
        </Button>
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
                placeholder="Rechercher par nom ou client..."
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
              <option value="ACTIVE">Actifs</option>
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Terminés</option>
              <option value="CANCELLED">Annulés</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredFolders.length} dossier{filteredFolders.length > 1 ? 's' : ''} trouvé
        {filteredFolders.length > 1 ? 's' : ''}
      </div>

      {/* Table */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trajet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date déménagement
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
              {filteredFolders.map((folder) => (
                <tr
                  key={folder.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/folders/${folder.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {folder.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {folder.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {folder.client}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {folder.originCity} → {folder.destinationCity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {folder.volume} m³
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(folder.movingDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[folder.status as keyof typeof statusConfig].variant}>
                      {statusConfig[folder.status as keyof typeof statusConfig].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/folders/${folder.id}`);
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

        {filteredFolders.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun dossier trouvé
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Truck, Search, Filter, Star, Users } from 'lucide-react';

// Mock data
const mockMovers = [
  {
    id: 'm1',
    name: 'Move Express',
    email: 'contact@moveexpress.fr',
    phone: '+33 6 98 76 54 32',
    siret: '123 456 789 00012',
    rating: 4.5,
    quotesCount: 24,
    status: 'ACTIVE',
    city: 'Paris',
  },
  {
    id: 'm2',
    name: 'Transport Pro',
    email: 'info@transportpro.fr',
    phone: '+33 6 87 65 43 21',
    siret: '987 654 321 00098',
    rating: 4.2,
    quotesCount: 18,
    status: 'ACTIVE',
    city: 'Lyon',
  },
  {
    id: 'm3',
    name: 'Déménagement Plus',
    email: 'contact@demenagementplus.fr',
    phone: '+33 6 76 54 32 10',
    siret: '456 789 123 00045',
    rating: 3.8,
    quotesCount: 31,
    status: 'BLACKLISTED',
    city: 'Marseille',
  },
  {
    id: 'm4',
    name: 'Fast Move',
    email: 'hello@fastmove.fr',
    phone: '+33 6 65 43 21 09',
    siret: '789 123 456 00078',
    rating: 4.7,
    quotesCount: 12,
    status: 'ACTIVE',
    city: 'Toulouse',
  },
  {
    id: 'm5',
    name: 'Eco Déménagement',
    email: 'contact@ecodemenagement.fr',
    phone: '+33 6 54 32 10 98',
    siret: '321 654 987 00032',
    rating: 4.0,
    quotesCount: 8,
    status: 'ACTIVE',
    city: 'Bordeaux',
  },
];

const statusConfig = {
  ACTIVE: { label: 'Actif', variant: 'success' as const },
  BLACKLISTED: { label: 'Blacklisté', variant: 'danger' as const },
};

export function MoversPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredMovers = mockMovers.filter((mover) => {
    const matchesSearch =
      mover.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mover.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mover.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || mover.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: mockMovers.length,
    active: mockMovers.filter((m) => m.status === 'ACTIVE').length,
    blacklisted: mockMovers.filter((m) => m.status === 'BLACKLISTED').length,
    avgRating:
      mockMovers.reduce((acc, m) => acc + m.rating, 0) / mockMovers.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Déménageurs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer tous les déménageurs partenaires
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/admin/movers/new')}>
          <Users className="w-4 h-4 mr-2" />
          Nouveau déménageur
        </Button>
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
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Blacklistés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.blacklisted}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.avgRating.toFixed(1)} ⭐
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                placeholder="Rechercher par nom, email ou ville..."
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
              <option value="BLACKLISTED">Blacklistés</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredMovers.length} déménageur{filteredMovers.length > 1 ? 's' : ''} trouvé
        {filteredMovers.length > 1 ? 's' : ''}
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
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SIRET
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Devis
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
              {filteredMovers.map((mover) => (
                <tr
                  key={mover.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/movers/${mover.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                        <Truck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {mover.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {mover.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {mover.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {mover.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {mover.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      {mover.siret}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mover.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {mover.quotesCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[mover.status as keyof typeof statusConfig].variant}>
                      {statusConfig[mover.status as keyof typeof statusConfig].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/movers/${mover.id}`);
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

        {filteredMovers.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun déménageur trouvé
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}


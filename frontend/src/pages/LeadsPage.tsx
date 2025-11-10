import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { UserPlus, Search, Filter, Mail, Phone, MapPin } from 'lucide-react';

// Mock data
const mockLeads = [
  {
    id: 'l1',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@example.com',
    phone: '+33 6 45 67 89 01',
    originCity: 'Toulouse',
    destinationCity: 'Strasbourg',
    volume: 42,
    movingDate: '2025-12-01',
    status: 'NEW',
    createdAt: '2025-11-08',
  },
  {
    id: 'l2',
    name: 'Thomas Rousseau',
    email: 'thomas.rousseau@example.com',
    phone: '+33 6 56 78 90 12',
    originCity: 'Nice',
    destinationCity: 'Rennes',
    volume: 28,
    movingDate: '2025-12-20',
    status: 'CONTACTED',
    createdAt: '2025-11-06',
  },
  {
    id: 'l3',
    name: 'Claire Durand',
    email: 'claire.durand@example.com',
    phone: '+33 6 67 89 01 23',
    originCity: 'Nantes',
    destinationCity: 'Montpellier',
    volume: 35,
    movingDate: '2025-11-25',
    status: 'CONVERTED',
    createdAt: '2025-10-28',
  },
];

const statusConfig = {
  NEW: { label: 'Nouveau', variant: 'primary' as const },
  CONTACTED: { label: 'Contacté', variant: 'warning' as const },
  CONVERTED: { label: 'Converti', variant: 'success' as const },
  LOST: { label: 'Perdu', variant: 'danger' as const },
};

export function LeadsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockLeads.length,
    new: mockLeads.filter((l) => l.status === 'NEW').length,
    converted: mockLeads.filter((l) => l.status === 'CONVERTED').length,
    conversionRate: (mockLeads.filter((l) => l.status === 'CONVERTED').length / mockLeads.length) * 100,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leads
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer tous les leads
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
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.new}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convertis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.converted}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux conversion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(stats.conversionRate)}%
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-green-600" />
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
                placeholder="Rechercher par nom ou email..."
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
              <option value="NEW">Nouveaux</option>
              <option value="CONTACTED">Contactés</option>
              <option value="CONVERTED">Convertis</option>
              <option value="LOST">Perdus</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card variant="glass-strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
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
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/leads/${lead.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <UserPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {lead.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white mb-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {lead.originCity} → {lead.destinationCity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {lead.volume} m³
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(lead.movingDate).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[lead.status as keyof typeof statusConfig].variant}>
                      {statusConfig[lead.status as keyof typeof statusConfig].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/leads/${lead.id}`);
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
      </Card>
    </div>
  );
}


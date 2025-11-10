import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { CreditCard, Search, Filter, DollarSign } from 'lucide-react';

// Mock data
const mockPayments = [
  {
    id: 'p1',
    folderName: 'Déménagement Dupont',
    folderId: '1',
    amount: 2800,
    status: 'SUCCEEDED',
    method: 'CARD',
    paidAt: '2025-11-05T16:30:00Z',
    clientName: 'Jean Dupont',
  },
  {
    id: 'p2',
    folderName: 'Déménagement Martin',
    folderId: '2',
    amount: 3200,
    status: 'PENDING',
    method: 'BANK_TRANSFER',
    paidAt: null,
    clientName: 'Marie Martin',
  },
  {
    id: 'p3',
    folderName: 'Déménagement Lefebvre',
    folderId: '3',
    amount: 1950,
    status: 'SUCCEEDED',
    method: 'CARD',
    paidAt: '2025-10-18T10:15:00Z',
    clientName: 'Paul Lefebvre',
  },
  {
    id: 'p4',
    folderName: 'Déménagement Bernard',
    folderId: '4',
    amount: 3500,
    status: 'FAILED',
    method: 'CARD',
    paidAt: null,
    clientName: 'Sophie Bernard',
  },
];

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  SUCCEEDED: { label: 'Payé', variant: 'success' as const },
  FAILED: { label: 'Échoué', variant: 'danger' as const },
  REFUNDED: { label: 'Remboursé', variant: 'default' as const },
};

const methodConfig: Record<string, string> = {
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement',
  CASH: 'Espèces',
};

export function PaymentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockPayments.reduce((acc, p) => acc + p.amount, 0),
    succeeded: mockPayments.filter((p) => p.status === 'SUCCEEDED').reduce((acc, p) => acc + p.amount, 0),
    pending: mockPayments.filter((p) => p.status === 'PENDING').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paiements
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérer tous les paiements
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total.toLocaleString('fr-FR')} €
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Encaissé</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.succeeded.toLocaleString('fr-FR')} €
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
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
            <CreditCard className="w-8 h-8 text-yellow-600" />
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
                placeholder="Rechercher par dossier ou client..."
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
              <option value="PENDING">En attente</option>
              <option value="SUCCEEDED">Payés</option>
              <option value="FAILED">Échoués</option>
              <option value="REFUNDED">Remboursés</option>
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
                  Dossier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
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
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/payments/${payment.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/folders/${payment.folderId}`);
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {payment.folderName}
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {payment.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {payment.amount.toLocaleString('fr-FR')} €
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {methodConfig[payment.method]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig[payment.status as keyof typeof statusConfig].variant}>
                      {statusConfig[payment.status as keyof typeof statusConfig].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/payments/${payment.id}`);
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


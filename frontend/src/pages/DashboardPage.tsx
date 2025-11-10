import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../components/ui';
import { TrendingUp, TrendingDown, FolderOpen, FileText, DollarSign, Users, AlertCircle, Clock } from 'lucide-react';

// Mock data
const kpis = [
  {
    title: 'Dossiers actifs',
    value: 42,
    change: +12,
    changePercent: '+15%',
    trend: 'up' as const,
    icon: FolderOpen,
  },
  {
    title: 'Devis en attente',
    value: 18,
    change: -3,
    changePercent: '-14%',
    trend: 'down' as const,
    icon: FileText,
  },
  {
    title: 'CA ce mois',
    value: '12 500€',
    change: +2100,
    changePercent: '+20%',
    trend: 'up' as const,
    icon: DollarSign,
  },
  {
    title: 'Nouveaux clients',
    value: 27,
    change: +5,
    changePercent: '+23%',
    trend: 'up' as const,
    icon: Users,
  },
];

const alerts = [
  {
    id: 1,
    type: 'warning' as const,
    title: '3 devis expirent aujourd\'hui',
    time: 'Il y a 2h',
  },
  {
    id: 2,
    type: 'danger' as const,
    title: 'Paiement en retard - Dossier #1234',
    time: 'Il y a 4h',
  },
  {
    id: 3,
    type: 'success' as const,
    title: 'Nouveau déménageur validé',
    time: 'Il y a 1j',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'folder',
    title: 'Nouveau dossier créé',
    description: 'Paris → Lyon | Client: Marie Dubois',
    time: 'Il y a 15 min',
    status: 'success' as const,
  },
  {
    id: 2,
    type: 'quote',
    title: 'Devis reçu',
    description: 'Dossier #4521 | Déménageur: Trans Express',
    time: 'Il y a 1h',
    status: 'primary' as const,
  },
  {
    id: 3,
    type: 'payment',
    title: 'Paiement confirmé',
    description: '850€ | Dossier #4498',
    time: 'Il y a 3h',
    status: 'success' as const,
  },
  {
    id: 4,
    type: 'alert',
    title: 'Relance envoyée',
    description: 'Dossier #4487 | 3 déménageurs relancés',
    time: 'Il y a 5h',
    status: 'warning' as const,
  },
  {
    id: 5,
    type: 'folder',
    title: 'Dossier clôturé',
    description: 'Dossier #4456 | Déménagement effectué',
    time: 'Il y a 1j',
    status: 'default' as const,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble de l'activité Moverz
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} variant="glass">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.changePercent}
                  </span>
                  <span className="text-xs text-gray-500">vs mois dernier</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-100/80 dark:bg-blue-900/30">
                <kpi.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card variant="glass-strong" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"
                >
                  <Badge variant={alert.type} className="mt-0.5">
                    {alert.type === 'warning' && '⚠️'}
                    {alert.type === 'danger' && '🚨'}
                    {alert.type === 'success' && '✅'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2">
                Voir toutes les alertes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card variant="glass-strong" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <Badge variant={activity.status}>
                    {activity.type === 'folder' && '📁'}
                    {activity.type === 'quote' && '💰'}
                    {activity.type === 'payment' && '💳'}
                    {activity.type === 'alert' && '🔔'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="secondary" size="sm" className="w-full mt-2">
                Voir toute l'activité
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="primary" className="w-full">
              ➕ Nouveau dossier
            </Button>
            <Button variant="secondary" className="w-full">
              📤 Envoyer devis
            </Button>
            <Button variant="secondary" className="w-full">
              📊 Voir rapports
            </Button>
            <Button variant="secondary" className="w-full">
              ⚙️ Paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

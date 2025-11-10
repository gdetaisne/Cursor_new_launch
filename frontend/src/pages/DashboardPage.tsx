export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Dossiers actifs</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Devis en attente</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">18</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Paiements ce mois</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">12 500€</p>
        </div>
      </div>
    </div>
  );
}


import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/folders': 'Dossiers',
  '/admin/quotes': 'Devis',
  '/admin/movers': 'Déménageurs',
  '/admin/clients': 'Clients',
  '/admin/leads': 'Leads',
  '/admin/payments': 'Paiements',
  '/admin/logs': 'Logs',
  '/admin/emails': 'Emails',
  '/admin/settings': 'Paramètres',
};

export function Header() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      name: routeNames[path] || segment,
      path,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6">
      <div className="flex h-full items-center justify-between">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              )}
              {crumb.isLast ? (
                <span className="font-medium text-gray-900">{crumb.name}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right side - Status indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">API OK</span>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="text-sm text-gray-600">
            Backend: <span className="font-mono text-xs">:3001</span>
          </div>
        </div>
      </div>
    </header>
  );
}


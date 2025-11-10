import { NavLink } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  FileText,
  Truck,
  Users,
  UserPlus,
  CreditCard,
  Activity,
  Mail,
  Globe,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Dossiers', href: '/admin/folders', icon: FolderOpen },
  { name: 'Devis', href: '/admin/quotes', icon: FileText },
  { name: 'Déménageurs', href: '/admin/movers', icon: Truck },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Leads', href: '/admin/leads', icon: UserPlus },
  { name: 'Websites', href: '/admin/websites', icon: Globe },
  { name: 'Paiements', href: '/admin/payments', icon: CreditCard },
  { name: 'Logs', href: '/admin/logs', icon: Activity },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">🚚 Moverz</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-800 p-3">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </NavLink>
      </div>
    </div>
  );
}


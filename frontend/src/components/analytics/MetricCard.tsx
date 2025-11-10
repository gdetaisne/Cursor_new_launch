/**
 * Composant Metric Card pour afficher une statistique clé
 * Avec indicateur de variation (change %)
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // Pourcentage de variation (ex: +12.5, -5.2)
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}

export function MetricCard({ title, value, change, icon, description, loading }: MetricCardProps) {
  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    return `${absChange.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getChangeColor(change)}`}>
              {getChangeIcon(change)}
              <span>{formatChange(change)}</span>
              <span className="text-gray-500 font-normal">vs période précédente</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}


/**
 * Page principale du Dashboard Websites (Analytics)
 * Affiche GSC, GA4, Web Vitals
 */

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { TrendingUp, MousePointerClick, Eye, Globe, Gauge } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/analytics/MetricCard';
import { LineChart } from '../components/analytics/LineChart';
import { BarChart } from '../components/analytics/BarChart';
import { DataTable } from '../components/analytics/DataTable';
import { DateRangePicker } from '../components/analytics/DateRangePicker';
import {
  useDashboardSummary,
  useGSCDailyMetrics,
  useGSCTopPages,
  useGSCTopQueries,
  useGA4DailyMetrics,
  useWebVitalsSummary,
} from '../hooks/useAnalytics';
import type { DateRangeFilter } from '../types/analytics';

export default function WebsitesDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Données principales
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(dateRange);
  const { data: gscDaily, isLoading: gscLoading } = useGSCDailyMetrics({ ...dateRange, limit: 1000 });
  const { data: gscPages, isLoading: pagesLoading } = useGSCTopPages({ ...dateRange, limit: 10 });
  const { data: gscQueries, isLoading: queriesLoading } = useGSCTopQueries({ ...dateRange, limit: 10 });
  const { data: ga4Daily, isLoading: ga4Loading } = useGA4DailyMetrics({ ...dateRange, limit: 1000 });
  const { data: webVitals, isLoading: vitalsLoading } = useWebVitalsSummary(dateRange);

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(Math.round(num));
  const formatPercent = (num: number) => `${(num * 100).toFixed(2)}%`;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getWebVitalsColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Websites</h1>
        <p className="text-gray-600 mt-2">
          Métriques Google Search Console, Google Analytics 4 et Core Web Vitals
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* KPIs Summary */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Clics (GSC)"
            value={formatNumber(summary?.gsc.total_clicks || 0)}
            change={summary?.gsc.clicks_change_pct}
            icon={<MousePointerClick className="w-6 h-6" />}
            loading={summaryLoading}
          />
          <MetricCard
            title="Impressions (GSC)"
            value={formatNumber(summary?.gsc.total_impressions || 0)}
            change={summary?.gsc.impressions_change_pct}
            icon={<Eye className="w-6 h-6" />}
            loading={summaryLoading}
          />
          <MetricCard
            title="CTR Moyen"
            value={formatPercent(summary?.gsc.avg_ctr || 0)}
            description="Google Search"
            icon={<TrendingUp className="w-6 h-6" />}
            loading={summaryLoading}
          />
          <MetricCard
            title="Utilisateurs (GA4)"
            value={formatNumber(summary?.ga4.total_users || 0)}
            change={summary?.ga4.users_change_pct}
            icon={<Globe className="w-6 h-6" />}
            loading={summaryLoading}
          />
          <MetricCard
            title="Web Vitals Score"
            value={summary?.web_vitals.overall_score || 'N/A'}
            description={`LCP: ${Math.round(summary?.web_vitals.lcp_p75 || 0)}ms`}
            icon={<Gauge className="w-6 h-6" />}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* GSC Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Search Console</h2>
        <div className="space-y-4">
          {/* Évolution temporelle */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution Clics & Impressions</h3>
            <LineChart
              data={gscDaily?.data || []}
              lines={[
                { dataKey: 'clicks', stroke: '#3B82F6', name: 'Clics' },
                { dataKey: 'impressions', stroke: '#10B981', name: 'Impressions' },
              ]}
              xAxisKey="date"
              height={300}
            />
          </Card>

          {/* Top Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
            <DataTable
              data={gscPages?.data || []}
              columns={[
                {
                  key: 'page',
                  label: 'Page',
                  render: (value) => (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-md">
                      {value}
                    </a>
                  ),
                  sortable: true,
                },
                { key: 'clicks', label: 'Clics', render: formatNumber, sortable: true },
                { key: 'impressions', label: 'Impressions', render: formatNumber, sortable: true },
                { key: 'ctr', label: 'CTR', render: (v) => formatPercent(v), sortable: true },
                { key: 'position', label: 'Position Moy.', render: (v) => v.toFixed(1), sortable: true },
              ]}
              loading={pagesLoading}
            />
          </Card>

          {/* Top Queries */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Requêtes</h3>
            <DataTable
              data={gscQueries?.data || []}
              columns={[
                { key: 'query', label: 'Requête', sortable: true },
                { key: 'clicks', label: 'Clics', render: formatNumber, sortable: true },
                { key: 'impressions', label: 'Impressions', render: formatNumber, sortable: true },
                { key: 'ctr', label: 'CTR', render: (v) => formatPercent(v), sortable: true },
                { key: 'position', label: 'Position Moy.', render: (v) => v.toFixed(1), sortable: true },
              ]}
              loading={queriesLoading}
            />
          </Card>
        </div>
      </div>

      {/* GA4 Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Analytics 4</h2>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisateurs & Sessions</h3>
          <LineChart
            data={ga4Daily?.data || []}
            lines={[
              { dataKey: 'users', stroke: '#8B5CF6', name: 'Utilisateurs' },
              { dataKey: 'sessions', stroke: '#EC4899', name: 'Sessions' },
            ]}
            xAxisKey="date"
            height={300}
          />
        </Card>
      </div>

      {/* Web Vitals Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Web Vitals</h2>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics (P75)</h3>
          <BarChart
            data={webVitals?.data || []}
            bars={[
              { dataKey: 'p75', fill: '#3B82F6', name: 'P75 Value' },
            ]}
            xAxisKey="metric_name"
            height={300}
          />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {webVitals?.data.map((metric) => (
              <div key={metric.metric_name} className="border rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">{metric.metric_name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(metric.p75)}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">Good</span>
                    <span>{formatPercent(metric.good_percentage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Needs Improvement</span>
                    <span>{formatPercent(metric.needs_improvement_percentage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Poor</span>
                    <span>{formatPercent(metric.poor_percentage)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


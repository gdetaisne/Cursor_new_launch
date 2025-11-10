/**
 * Composant générique Bar Chart avec Recharts
 * Utilisé pour comparaisons (devices, countries, pages)
 */

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  fill: string;
  name?: string;
}

interface BarChartProps {
  data: DataPoint[];
  bars: BarConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yAxisLabel?: string;
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  yAxisLabel,
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />}
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              className="text-xs text-gray-600"
              tick={{ fill: '#6B7280' }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              className="text-xs text-gray-600"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              className="text-xs text-gray-600"
              tick={{ fill: '#6B7280' }}
              width={150}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            padding: '8px 12px',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
        />
        {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            radius={[4, 4, 0, 0]}
            name={bar.name || bar.dataKey}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}


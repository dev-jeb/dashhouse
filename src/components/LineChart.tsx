import React, { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { REGION_COLORS } from '../types/census/regions';
import { ChartData, ChartDataset } from '../types/common';

export type { ChartData, ChartDataset };

interface LineChartProps {
  data: ChartData;
  title: string;
  yAxisLabel?: string;
  unit?: string;
  className?: string;
}

// Default color palette for non-region datasets
const DEFAULT_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
];

function getColor(label: string, index: number): string {
  return (REGION_COLORS as Record<string, string>)[label] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

/** Format a date label for the X axis — show readable short dates */
function formatXLabel(label: string): string {
  // Quarterly: "2024-Q3" → "Q3 '24"
  const qMatch = label.match(/^(\d{4})-Q(\d)$/);
  if (qMatch) return `Q${qMatch[2]} '${qMatch[1].slice(2)}`;

  // Monthly: "2024-06" → "Jun '24"
  const mMatch = label.match(/^(\d{4})-(\d{2})$/);
  if (mMatch) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(mMatch[2]) - 1]} '${mMatch[1].slice(2)}`;
  }

  // Full date: "2024-06-15" → "Jun '24"
  const dMatch = label.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dMatch) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(dMatch[2]) - 1]} '${dMatch[1].slice(2)}`;
  }

  return label;
}

/** Custom tooltip styled to match the forest theme */
function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-forest-900 border border-forest-600 rounded-lg p-3 shadow-xl text-sm">
      <div className="text-forest-300 mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-forest-200">{entry.name}:</span>
          <span className="text-forest-100 font-semibold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisLabel = 'Value',
  unit = '%',
  className = '',
}) => {
  // Transform ChartData into Recharts format: array of { label, dataset1: val, dataset2: val, ... }
  const chartData = useMemo(() => {
    if (!data.labels.length) return [];

    return data.labels.map((label, i) => {
      const point: Record<string, string | number> = { label };
      data.datasets.forEach(ds => {
        point[ds.label] = ds.data[i] ?? null;
      });
      return point;
    });
  }, [data]);

  // For the brush, default to showing the last 2 years of data
  const brushStartIndex = useMemo(() => {
    if (chartData.length <= 48) return 0;
    return chartData.length - 48; // ~4 years for monthly, ~2 years for weekly
  }, [chartData.length]);

  if (!data.labels.length || !data.datasets.length) {
    return (
      <div className={`bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-accent-400 mb-4">{title}</h3>
        <div className="text-forest-200 text-center py-12">No data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-forest-400 text-center mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1e" />

          <XAxis
            dataKey="label"
            tickFormatter={formatXLabel}
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={40}
          />

          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              style: { fill: '#9ca3af', fontSize: 13 },
            }}
            tickFormatter={(val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          />

          <Tooltip content={<CustomTooltip unit={unit} />} />

          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value: string) => <span style={{ color: '#a8d1b5' }}>{value}</span>}
          />

          {data.datasets.map((ds, i) => (
            <Line
              key={ds.label}
              type="monotone"
              dataKey={ds.label}
              stroke={getColor(ds.label, i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          ))}

          {/* Date range slider at the bottom */}
          <Brush
            dataKey="label"
            height={30}
            stroke="#4a7c5c"
            fill="#0a130c"
            tickFormatter={formatXLabel}
            startIndex={brushStartIndex}
            travellerWidth={10}
          >
            <RechartsLineChart>
              <Line
                type="monotone"
                dataKey={data.datasets[0]?.label}
                stroke="#4a7c5c"
                dot={false}
                strokeWidth={1}
              />
            </RechartsLineChart>
          </Brush>
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;

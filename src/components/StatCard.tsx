import React, { useState, useRef } from 'react';
import { Card } from '@tremor/react';

export interface TrendDisplay {
  direction: 'up' | 'down' | 'flat';
  change: number;
  period: string;
  unit?: string;
}

interface StatCardProps {
  label: string;
  value: number | null;
  unit?: string;
  className?: string;
  hoverDescription?: string;
  howToRead?: string;
  timePeriod?: string;
  trend?: TrendDisplay;
  trends?: TrendDisplay[];
  interpretation?: string;
  comparisonLabel?: string;
  comparisonValue?: number | null;
  comparisonUnit?: string;
}

function formatChange(trend: TrendDisplay): string {
  const sign = trend.change > 0 ? '+' : '';
  if (trend.unit === '%' || trend.unit === '') {
    return `${sign}${trend.change.toFixed(2)}${trend.unit || ''}`;
  }
  return `${sign}${Math.round(trend.change)}${trend.unit || ''}`;
}

function formatPeriodLabel(period: string): string {
  return period === 'YoY' ? 'YoY' : `vs ${period} ago`;
}

/** Color the main value based on trend direction */
function valueColor(trend?: TrendDisplay): string {
  if (!trend) return 'text-forest-100';
  if (trend.direction === 'up') return 'text-emerald-400';
  if (trend.direction === 'down') return 'text-red-400';
  return 'text-forest-100';
}

function TrendBadge({ trend }: { trend: TrendDisplay }) {
  if (trend.direction === 'flat') {
    return (
      <span className="text-xs text-forest-400 bg-forest-900/50 px-2 py-0.5 rounded-full">
        flat {trend.period === 'YoY' ? 'YoY' : `vs ${trend.period} ago`}
      </span>
    );
  }

  const isUp = trend.direction === 'up';
  const arrow = isUp ? '\u25B2' : '\u25BC';
  const color = isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10';

  return (
    <span className={`text-xs ${color} px-2 py-0.5 rounded-full`}>
      {arrow} {formatChange(trend)} {formatPeriodLabel(trend.period)}
    </span>
  );
}

function TrendWithToggle({ trends, defaultIndex }: { trends: TrendDisplay[]; defaultIndex: number }) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const activeTrend = trends[selectedIndex];

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex gap-0.5 justify-center">
        {trends.map((t, i) => (
          <button
            key={t.period}
            onClick={() => setSelectedIndex(i)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              i === selectedIndex
                ? 'bg-forest-600 text-forest-100'
                : 'text-forest-400 hover:bg-forest-700 hover:text-forest-300'
            }`}
          >
            {t.period}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <TrendBadge trend={activeTrend} />
      </div>
    </div>
  );
}

function InfoTooltip({ description, howToRead }: { description: string; howToRead: string }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  return (
    <div className="absolute top-4 right-4">
      <button
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="w-5 h-5 rounded-full bg-forest-700 text-forest-300 text-xs flex items-center justify-center hover:bg-forest-600 hover:text-forest-100 transition-colors cursor-help"
        aria-label="More info"
      >
        ?
      </button>
      {visible && (
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute z-50 bottom-full right-0 mb-2 w-72 max-h-48 overflow-y-auto bg-forest-900 border border-forest-600 rounded-lg p-3 shadow-xl text-sm"
        >
          <p className="font-semibold text-forest-100 mb-1 text-left">{description}</p>
          {howToRead && <p className="text-forest-300 text-xs leading-relaxed text-left">{howToRead}</p>}
        </div>
      )}
    </div>
  );
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit = '%',
  className = '',
  hoverDescription = '',
  howToRead = '',
  timePeriod = '',
  trend,
  trends,
  interpretation,
  comparisonLabel,
  comparisonValue,
  comparisonUnit,
}) => {
  const displayValue = value !== null ? `${value}${unit}` : 'No data';
  const hasInfo = hoverDescription || howToRead;

  const defaultTrendIndex = trends && trend
    ? Math.max(0, trends.findIndex(t => t.period === trend.period))
    : 0;

  // For color coding, use the currently visible trend (default)
  const activeTrend = trend;

  return (
    <Card className={`!bg-forest-800 !border-forest-600 !ring-0 !shadow-lg relative flex flex-col justify-center ${className}`}>
      {hasInfo && (
        <InfoTooltip description={hoverDescription} howToRead={howToRead} />
      )}

      <div className="text-center">
        <p className="text-sm font-medium text-forest-400">{label}</p>
        {timePeriod && (
          <p className="text-xs text-forest-500 mt-0.5">{timePeriod}</p>
        )}

        <p className="text-4xl font-bold mt-2 text-forest-100">
          {displayValue}
        </p>

        {trends && trends.length > 1 ? (
          <TrendWithToggle trends={trends} defaultIndex={defaultTrendIndex} />
        ) : trend ? (
          <div className="mt-3 flex justify-center">
            <TrendBadge trend={trend} />
          </div>
        ) : null}

        {interpretation && (
          <p className="text-sm text-accent-400 mt-2">{interpretation}</p>
        )}

        {comparisonLabel && comparisonValue !== undefined && comparisonValue !== null && (
          <p className="text-xs text-forest-400 mt-1">
            {comparisonLabel}: {comparisonValue}{comparisonUnit || unit}
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;

import { useMemo } from 'react';
import { FredSeriesData } from '../../types/fred/series';
import { ChartData } from '../../types/common';
import { FRED_SERIES } from '../../config/fred';

export interface FredLatest {
  value: number;
  date: string;
}

export interface TrendInfo {
  direction: 'up' | 'down' | 'flat';
  change: number;
  changePercent: number;
  period: string;
  unit?: string;
}

export interface FredSeriesResult {
  latest: FredLatest | null;
  timeSeries: ChartData;
  trend: TrendInfo;
  trends: TrendInfo[];  // all available comparison periods
  name: string;
  unit: string;
}

// Map FRED units to display-friendly change units
const UNIT_MAP: Record<string, string> = {
  '%': '%',
  'index': '',
  'listings': '',
  'days': '',
  'permits': '',
  'thousands': 'K',
};

interface ComparisonPeriod {
  label: string;
  monthsBack?: number;
  yearsBack?: number;
}

const COMPARISON_PERIODS: ComparisonPeriod[] = [
  { label: '3mo', monthsBack: 3 },
  { label: '6mo', monthsBack: 6 },
  { label: 'YoY', yearsBack: 1 },
];

function computeTrend(
  obs: { date: string; value: number }[],
  latestObs: { date: string; value: number },
  period: ComparisonPeriod,
  displayUnit: string,
): TrendInfo {
  const compDate = new Date(latestObs.date);
  if (period.yearsBack) {
    compDate.setFullYear(compDate.getFullYear() - period.yearsBack);
  } else if (period.monthsBack) {
    compDate.setMonth(compDate.getMonth() - period.monthsBack);
  }
  const compDateStr = compDate.toISOString().split('T')[0];

  let comparisonValue = obs[0].value;
  for (const o of obs) {
    if (o.date <= compDateStr) {
      comparisonValue = o.value;
    } else {
      break;
    }
  }

  const change = latestObs.value - comparisonValue;
  const changePercent = comparisonValue !== 0
    ? (change / Math.abs(comparisonValue)) * 100
    : 0;

  const threshold = Math.abs(comparisonValue) * 0.01;
  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (change > threshold) direction = 'up';
  else if (change < -threshold) direction = 'down';

  return {
    direction,
    change,
    changePercent,
    period: period.label,
    unit: displayUnit,
  };
}

export function useFredSeries(
  data: Record<string, FredSeriesData>,
  seriesId: string
): FredSeriesResult {
  return useMemo(() => {
    const meta = FRED_SERIES[seriesId];
    const displayUnit = UNIT_MAP[meta?.unit || ''] ?? '';
    const flatTrend: TrendInfo = { direction: 'flat', change: 0, changePercent: 0, period: '3mo', unit: displayUnit };
    const empty: FredSeriesResult = {
      latest: null,
      timeSeries: { labels: [], datasets: [] },
      trend: flatTrend,
      trends: [flatTrend],
      name: meta?.name || seriesId,
      unit: meta?.unit || '',
    };

    const series = data[seriesId];
    if (!series || series.observations.length === 0) {
      return empty;
    }

    const obs = series.observations;
    const latestObs = obs[obs.length - 1];

    // Compute all comparison periods
    const trends = COMPARISON_PERIODS.map(period =>
      computeTrend(obs, latestObs, period, displayUnit)
    );

    // Default trend: YoY for seasonal, 3mo for non-seasonal
    const isSeasonal = meta?.seasonal === true;
    const defaultPeriod = isSeasonal ? 'YoY' : '3mo';
    const trend = trends.find(t => t.period === defaultPeriod) || trends[0];

    // Build chart data
    const labels = obs.map(o => o.date);
    const values = obs.map(o => o.value);

    return {
      latest: { value: latestObs.value, date: latestObs.date },
      timeSeries: {
        labels,
        datasets: [{
          label: meta?.name || seriesId,
          data: values,
        }],
      },
      trend,
      trends,
      name: meta?.name || seriesId,
      unit: meta?.unit || '',
    };
  }, [data, seriesId]);
}

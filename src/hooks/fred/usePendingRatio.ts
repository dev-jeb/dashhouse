import { useMemo } from 'react';
import { FredSeriesData } from '../../types/fred/series';
import { TrendInfo } from './useFredSeries';

export interface PendingRatioResult {
  pendingCount: number | null;
  pendingPercent: number | null;  // % of total that are pending/under contract
  date: string | null;
  trends: TrendInfo[];
  trend: TrendInfo;
}

interface ComparisonPeriod {
  label: string;
  monthsBack?: number;
  yearsBack?: number;
}

const PERIODS: ComparisonPeriod[] = [
  { label: '3mo', monthsBack: 3 },
  { label: '6mo', monthsBack: 6 },
  { label: 'YoY', yearsBack: 1 },
];

/**
 * Derives pending listings (total - active) and computes
 * the pending rate with time comparisons.
 */
export function usePendingRatio(
  data: Record<string, FredSeriesData>,
): PendingRatioResult {
  return useMemo(() => {
    const flat: TrendInfo = { direction: 'flat', change: 0, changePercent: 0, period: 'YoY', unit: '%' };
    const empty: PendingRatioResult = {
      pendingCount: null,
      pendingPercent: null,
      date: null,
      trends: [flat],
      trend: flat,
    };

    const active = data['ACTLISCOU45019'];
    const total = data['TOTLISCOU45019'];
    if (!active || !total || active.observations.length === 0 || total.observations.length === 0) {
      return empty;
    }

    // Build a map of active listings by date
    const activeMap = new Map<string, number>();
    for (const o of active.observations) {
      activeMap.set(o.date, o.value);
    }

    // Compute pending rate for each date where both exist
    const pendingSeries: { date: string; rate: number; count: number }[] = [];
    for (const o of total.observations) {
      const activeVal = activeMap.get(o.date);
      if (activeVal !== undefined && o.value > 0) {
        const pending = o.value - activeVal;
        const rate = (pending / o.value) * 100;
        pendingSeries.push({ date: o.date, rate, count: Math.round(pending) });
      }
    }

    if (pendingSeries.length === 0) return empty;

    const latest = pendingSeries[pendingSeries.length - 1];

    // Compute trends on the pending rate
    const trends: TrendInfo[] = PERIODS.map(period => {
      const compDate = new Date(latest.date);
      if (period.yearsBack) {
        compDate.setFullYear(compDate.getFullYear() - period.yearsBack);
      } else if (period.monthsBack) {
        compDate.setMonth(compDate.getMonth() - period.monthsBack);
      }
      const compDateStr = compDate.toISOString().split('T')[0];

      let compRate = pendingSeries[0].rate;
      for (const p of pendingSeries) {
        if (p.date <= compDateStr) compRate = p.rate;
        else break;
      }

      const change = latest.rate - compRate;
      const changePercent = compRate !== 0 ? (change / Math.abs(compRate)) * 100 : 0;
      const threshold = Math.abs(compRate) * 0.01;

      let direction: 'up' | 'down' | 'flat' = 'flat';
      if (change > threshold) direction = 'up';
      else if (change < -threshold) direction = 'down';

      return { direction, change, changePercent, period: period.label, unit: '%' };
    });

    return {
      pendingCount: latest.count,
      pendingPercent: Math.round(latest.rate * 10) / 10,
      date: latest.date,
      trends,
      trend: trends.find(t => t.period === 'YoY') || trends[0],
    };
  }, [data]);
}

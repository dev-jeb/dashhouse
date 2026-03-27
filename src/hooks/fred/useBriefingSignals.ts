import { useMemo } from 'react';
import { FredSeriesData } from '../../types/fred/series';

export interface BriefingSignal {
  metric: string;
  currentValue: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  interpretation: string;
}

function getLatest(data: Record<string, FredSeriesData>, seriesId: string): number | null {
  const series = data[seriesId];
  if (!series || series.observations.length === 0) return null;
  return series.observations[series.observations.length - 1].value;
}

function getTrend(data: Record<string, FredSeriesData>, seriesId: string): 'up' | 'down' | 'flat' {
  const series = data[seriesId];
  if (!series || series.observations.length < 2) return 'flat';

  const obs = series.observations;
  const latest = obs[obs.length - 1];

  // Compare to ~3 months ago
  const threeMonthsAgo = new Date(latest.date);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const targetDate = threeMonthsAgo.toISOString().split('T')[0];

  let compValue = obs[0].value;
  for (const o of obs) {
    if (o.date <= targetDate) compValue = o.value;
    else break;
  }

  const diff = latest.value - compValue;
  const threshold = Math.abs(compValue) * 0.01;
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'flat';
}

export function useBriefingSignals(data: Record<string, FredSeriesData>): BriefingSignal[] {
  return useMemo(() => {
    const signals: BriefingSignal[] = [];

    // Mortgage rate signal
    const mortgageRate = getLatest(data, 'MORTGAGE30US');
    if (mortgageRate !== null) {
      const mortgageTrend = getTrend(data, 'MORTGAGE30US');
      if (mortgageRate >= 7.0) {
        signals.push({
          metric: 'Mortgage Rates',
          currentValue: mortgageRate,
          sentiment: 'negative',
          interpretation: `At ${mortgageRate.toFixed(2)}%, rates are high. This suppresses buyer demand and may keep prices in check, but monthly payments on a $600K home would be steep (~$3,200/mo with 20% down).`,
        });
      } else if (mortgageRate >= 6.5) {
        signals.push({
          metric: 'Mortgage Rates',
          currentValue: mortgageRate,
          sentiment: 'neutral',
          interpretation: `At ${mortgageRate.toFixed(2)}%, rates are moderate. A $600K home with 20% down runs about $3,000/mo. ${mortgageTrend === 'down' ? 'The trend is moving in your favor.' : mortgageTrend === 'up' ? 'Watch for further increases.' : 'Holding steady for now.'}`,
        });
      } else {
        signals.push({
          metric: 'Mortgage Rates',
          currentValue: mortgageRate,
          sentiment: 'positive',
          interpretation: `At ${mortgageRate.toFixed(2)}%, rates are getting more affordable. This could bring more buyers into the market — expect more competition but better monthly payments.`,
        });
      }
    }

    // Fed funds direction
    const fedRate = getLatest(data, 'FEDFUNDS');
    if (fedRate !== null) {
      const fedTrend = getTrend(data, 'FEDFUNDS');
      if (fedTrend === 'down') {
        signals.push({
          metric: 'Fed Policy',
          currentValue: fedRate,
          sentiment: 'positive',
          interpretation: `The Fed funds rate is trending down (${fedRate.toFixed(2)}%). Rate cuts typically flow through to lower mortgage rates within weeks.`,
        });
      } else if (fedTrend === 'up') {
        signals.push({
          metric: 'Fed Policy',
          currentValue: fedRate,
          sentiment: 'negative',
          interpretation: `The Fed funds rate is trending up (${fedRate.toFixed(2)}%). This usually means mortgage rates will rise or stay elevated.`,
        });
      } else {
        signals.push({
          metric: 'Fed Policy',
          currentValue: fedRate,
          sentiment: 'neutral',
          interpretation: `The Fed funds rate is holding steady at ${fedRate.toFixed(2)}%. No immediate changes expected for mortgage rates.`,
        });
      }
    }

    // Charleston inventory
    const activeListings = getLatest(data, 'ACTLISCOU45019');
    if (activeListings !== null) {
      const listingTrend = getTrend(data, 'ACTLISCOU45019');
      if (listingTrend === 'up') {
        signals.push({
          metric: 'Charleston Inventory',
          currentValue: activeListings,
          sentiment: 'positive',
          interpretation: `Active listings in Charleston County are rising (${Math.round(activeListings).toLocaleString()} homes). More inventory means more choices and negotiating power for you.`,
        });
      } else if (listingTrend === 'down') {
        signals.push({
          metric: 'Charleston Inventory',
          currentValue: activeListings,
          sentiment: 'negative',
          interpretation: `Active listings in Charleston County are falling (${Math.round(activeListings).toLocaleString()} homes). Tightening inventory means more competition among buyers.`,
        });
      } else {
        signals.push({
          metric: 'Charleston Inventory',
          currentValue: activeListings,
          sentiment: 'neutral',
          interpretation: `Charleston County has ${Math.round(activeListings).toLocaleString()} active listings, roughly stable.`,
        });
      }
    }

    // Days on market
    const dom = getLatest(data, 'MEDDAYONMAR16700');
    if (dom !== null) {
      if (dom > 40) {
        signals.push({
          metric: 'Market Pace',
          currentValue: dom,
          sentiment: 'positive',
          interpretation: `Homes in Charleston are sitting for ${Math.round(dom)} days on average. That's slower than usual — you have more time to decide and room to negotiate.`,
        });
      } else if (dom < 20) {
        signals.push({
          metric: 'Market Pace',
          currentValue: dom,
          sentiment: 'negative',
          interpretation: `Homes in Charleston are selling in just ${Math.round(dom)} days. The market is moving fast — be ready to act quickly on homes you like.`,
        });
      } else {
        signals.push({
          metric: 'Market Pace',
          currentValue: dom,
          sentiment: 'neutral',
          interpretation: `Charleston homes are spending ${Math.round(dom)} days on market — a healthy pace that gives you time without excessive competition.`,
        });
      }
    }

    // Consumer sentiment
    const sentiment = getLatest(data, 'UMCSENT');
    if (sentiment !== null) {
      if (sentiment < 60) {
        signals.push({
          metric: 'Consumer Confidence',
          currentValue: sentiment,
          sentiment: 'neutral',
          interpretation: `Consumer sentiment is low (${sentiment.toFixed(1)}). When people feel pessimistic, fewer jump into home buying — which can ease price pressure.`,
        });
      } else if (sentiment > 80) {
        signals.push({
          metric: 'Consumer Confidence',
          currentValue: sentiment,
          sentiment: 'neutral',
          interpretation: `Consumer sentiment is strong (${sentiment.toFixed(1)}). Confidence drives big purchases like homes — expect healthy demand.`,
        });
      }
    }

    return signals;
  }, [data]);
}

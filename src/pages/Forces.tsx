import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import PaymentCalculator from '../components/PaymentCalculator';
import { useFredData } from '../contexts/FredContext';
import { useFredSeries } from '../hooks/fred/useFredSeries';
import METRIC_DESCRIPTIONS from '../config/metricDescriptions';
import { ChartData } from '../types/common';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Merge two single-dataset chart series into one overlay chart */
function mergeChartData(primary: ChartData, secondary: ChartData, secondaryLabel: string): ChartData {
  if (primary.labels.length === 0) return secondary;
  if (secondary.labels.length === 0) return primary;

  // Use the shorter date range (intersection)
  const startDate = primary.labels[0] > secondary.labels[0] ? primary.labels[0] : secondary.labels[0];
  const endDate = primary.labels[primary.labels.length - 1] < secondary.labels[secondary.labels.length - 1]
    ? primary.labels[primary.labels.length - 1]
    : secondary.labels[secondary.labels.length - 1];

  // Build a map of secondary values by date
  const secondaryMap = new Map<string, number>();
  secondary.labels.forEach((label, i) => {
    if (secondary.datasets[0]) {
      secondaryMap.set(label, secondary.datasets[0].data[i]);
    }
  });

  // Filter primary to date range and align secondary
  const labels: string[] = [];
  const primaryValues: number[] = [];
  const secondaryValues: number[] = [];

  primary.labels.forEach((label, i) => {
    if (label >= startDate && label <= endDate && secondaryMap.has(label)) {
      labels.push(label);
      primaryValues.push(primary.datasets[0]?.data[i] ?? 0);
      secondaryValues.push(secondaryMap.get(label) ?? 0);
    }
  });

  return {
    labels,
    datasets: [
      { label: primary.datasets[0]?.label || 'Primary', data: primaryValues },
      { label: secondaryLabel, data: secondaryValues },
    ],
  };
}

const Forces: React.FC = () => {
  const { data, loading, error } = useFredData();

  const mortgage = useFredSeries(data, 'MORTGAGE30US');
  const fedFunds = useFredSeries(data, 'FEDFUNDS');
  const cpi = useFredSeries(data, 'CPIAUCSL');
  const sentiment = useFredSeries(data, 'UMCSENT');
  const unemployment = useFredSeries(data, 'UNRATE');
  const permitsNational = useFredSeries(data, 'PERMIT');
  const permitsLocal = useFredSeries(data, 'BPPRIV045019');
  const gdp = useFredSeries(data, 'A191RL1Q225SBEA');

  if (loading) {
    return <LoadingSpinner message="loading economic data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent-400 mb-4">Error Loading Data</h1>
          <p className="text-forest-200">{error}</p>
        </div>
      </div>
    );
  }

  const fedDesc = METRIC_DESCRIPTIONS['FEDFUNDS'];
  const mortgageDesc = METRIC_DESCRIPTIONS['MORTGAGE30US'];
  const cpiDesc = METRIC_DESCRIPTIONS['CPIAUCSL'];
  const sentimentDesc = METRIC_DESCRIPTIONS['UMCSENT'];
  const unrateDesc = METRIC_DESCRIPTIONS['UNRATE'];
  const permitDesc = METRIC_DESCRIPTIONS['PERMIT'];
  const gdpDesc = METRIC_DESCRIPTIONS['A191RL1Q225SBEA'];

  // Overlay chart: mortgage rate + fed funds rate
  const ratesOverlay = mergeChartData(mortgage.timeSeries, fedFunds.timeSeries, 'Fed Funds Rate');

  return (
    <div className="space-y-10">
      {/* Intro */}
      <div className="bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg">
        <h2 className="text-xl font-bold text-accent-400 mb-2">Forces That Move the Housing Market</h2>
        <p className="text-forest-200 leading-relaxed">
          Housing prices and mortgage rates don't move randomly — they're driven by a chain of economic forces.
          This page walks through that chain from top to bottom: the Fed sets the tone, rates hit your wallet,
          and supply and demand determine prices.
        </p>
      </div>

      {/* ═══════════════ TIER 1: The Fed Sets the Tone ═══════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent-400 rounded"></div>
          <h2 className="text-xl font-bold text-forest-100">Tier 1: The Fed Sets the Tone</h2>
        </div>

        <div className="bg-forest-800/50 p-5 rounded-lg border border-forest-700">
          <p className="text-forest-200 leading-relaxed">
            The Federal Reserve controls the federal funds rate — the base rate for the entire economy.
            When inflation runs too hot, the Fed raises rates to cool spending. When the economy weakens,
            they cut rates to stimulate it. <strong className="text-forest-100">Mortgage rates follow the Fed's lead,
            usually within weeks of a change.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="Federal Funds Rate"
            value={fedFunds.latest ? Math.round(fedFunds.latest.value * 100) / 100 : null}
            unit="%"
            trend={fedFunds.trend}
            trends={fedFunds.trends}
            timePeriod={fedFunds.latest ? formatDate(fedFunds.latest.date) : ''}
            hoverDescription={fedDesc?.whatIsIt}
            howToRead={fedDesc?.howToRead}
          />
          <StatCard
            label="Real GDP Growth"
            value={gdp.latest ? Math.round(gdp.latest.value * 10) / 10 : null}
            unit="%"
            trend={gdp.trend}
            trends={gdp.trends}
            timePeriod={gdp.latest ? formatDate(gdp.latest.date) : ''}
            hoverDescription={gdpDesc?.whatIsIt}
            howToRead={gdpDesc?.howToRead}
            interpretation={
              gdp.latest
                ? gdp.latest.value < 0 ? 'Economy contracting' : gdp.latest.value > 3 ? 'Strong growth' : 'Moderate growth'
                : undefined
            }
          />
        </div>

        <LineChart
          data={fedFunds.timeSeries}
          title="Federal Funds Rate Over Time"
          yAxisLabel="Rate (%)"
          unit="%"
        />
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="text-forest-400 text-2xl">&#9660;</div>
      </div>

      {/* ═══════════════ TIER 2: Rates Hit Your Wallet ═══════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent-400 rounded"></div>
          <h2 className="text-xl font-bold text-forest-100">Tier 2: Rates Hit Your Wallet</h2>
        </div>

        <div className="bg-forest-800/50 p-5 rounded-lg border border-forest-700">
          <p className="text-forest-200 leading-relaxed">
            The 30-year fixed mortgage rate is what determines your monthly payment.
            It loosely tracks the Fed funds rate but also responds to inflation expectations
            and bond market movements. <strong className="text-forest-100">Every 0.5% rate increase
            adds roughly $150/month to a $480K mortgage.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            label="30-Year Mortgage Rate"
            value={mortgage.latest ? Math.round(mortgage.latest.value * 100) / 100 : null}
            unit="%"
            trend={mortgage.trend}
            trends={mortgage.trends}
            timePeriod={mortgage.latest ? formatDate(mortgage.latest.date) : ''}
            hoverDescription={mortgageDesc?.whatIsIt}
            howToRead={mortgageDesc?.howToRead}
          />
          <StatCard
            label="Consumer Price Index"
            value={cpi.latest ? Math.round(cpi.latest.value * 10) / 10 : null}
            unit=""
            trend={cpi.trend}
            trends={cpi.trends}
            timePeriod={cpi.latest ? formatDate(cpi.latest.date) : ''}
            hoverDescription={cpiDesc?.whatIsIt}
            howToRead={cpiDesc?.howToRead}
          />
        </div>

        <LineChart
          data={ratesOverlay}
          title="Mortgage Rate vs. Fed Funds Rate"
          yAxisLabel="Rate (%)"
          unit="%"
        />

        <PaymentCalculator currentRate={mortgage.latest?.value ?? null} />
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="text-forest-400 text-2xl">&#9660;</div>
      </div>

      {/* ═══════════════ TIER 3: Supply, Demand & Prices ═══════════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent-400 rounded"></div>
          <h2 className="text-xl font-bold text-forest-100">Tier 3: Supply, Demand & Prices</h2>
        </div>

        <div className="bg-forest-800/50 p-5 rounded-lg border border-forest-700">
          <p className="text-forest-200 leading-relaxed">
            At the ground level, home prices are driven by supply (how many homes are available)
            and demand (how many people are buying). Consumer confidence drives demand.
            Building permits signal future supply. <strong className="text-forest-100">Unemployment is
            the wildcard — rising joblessness kills demand and historically leads to rate cuts.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <StatCard
            label="Consumer Sentiment"
            value={sentiment.latest ? Math.round(sentiment.latest.value * 10) / 10 : null}
            unit=""
            trend={sentiment.trend}
            trends={sentiment.trends}
            timePeriod={sentiment.latest ? formatDate(sentiment.latest.date) : ''}
            hoverDescription={sentimentDesc?.whatIsIt}
            howToRead={sentimentDesc?.howToRead}
            interpretation={
              sentiment.latest
                ? sentiment.latest.value < 60 ? 'Low confidence — less buying pressure'
                  : sentiment.latest.value > 80 ? 'Strong confidence — expect demand'
                  : 'Moderate confidence'
                : undefined
            }
          />
          <StatCard
            label="Unemployment Rate"
            value={unemployment.latest ? Math.round(unemployment.latest.value * 10) / 10 : null}
            unit="%"
            trend={unemployment.trend}
            trends={unemployment.trends}
            timePeriod={unemployment.latest ? formatDate(unemployment.latest.date) : ''}
            hoverDescription={unrateDesc?.whatIsIt}
            howToRead={unrateDesc?.howToRead}
            interpretation={
              unemployment.latest
                ? unemployment.latest.value < 4 ? 'Strong job market — supports demand'
                  : unemployment.latest.value > 6 ? 'Weak — expect rate cuts'
                  : 'Moderate job market'
                : undefined
            }
          />
          <StatCard
            label="Building Permits (National)"
            value={permitsNational.latest ? Math.round(permitsNational.latest.value) : null}
            unit="K"
            trend={permitsNational.trend}
            trends={permitsNational.trends}
            timePeriod={permitsNational.latest ? formatDate(permitsNational.latest.date) : ''}
            hoverDescription={permitDesc?.whatIsIt}
            howToRead={permitDesc?.howToRead}
            comparisonLabel="Charleston County"
            comparisonValue={permitsLocal.latest ? Math.round(permitsLocal.latest.value) : null}
            comparisonUnit=""
          />
        </div>

        <LineChart
          data={sentiment.timeSeries}
          title="Consumer Sentiment Index"
          yAxisLabel="Index (1966 = 100)"
          unit=""
        />

        <LineChart
          data={unemployment.timeSeries}
          title="U.S. Unemployment Rate"
          yAxisLabel="Rate (%)"
          unit="%"
        />

        <LineChart
          data={permitsNational.timeSeries}
          title="National Building Permits (Seasonally Adjusted Annual Rate)"
          yAxisLabel="Thousands"
          unit="K"
        />
      </div>
    </div>
  );
};

export default Forces;

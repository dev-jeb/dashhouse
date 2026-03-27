import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import { useFredData } from '../contexts/FredContext';
import { useFredSeries } from '../hooks/fred/useFredSeries';
import METRIC_DESCRIPTIONS from '../config/metricDescriptions';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const Briefing: React.FC = () => {
  const { data, loading, error } = useFredData();

  const mortgage = useFredSeries(data, 'MORTGAGE30US');
  const fedFunds = useFredSeries(data, 'FEDFUNDS');
  const activeListings = useFredSeries(data, 'ACTLISCOU45019');
  const daysOnMarket = useFredSeries(data, 'MEDDAYONMAR16700');
  const charlestonHPI = useFredSeries(data, 'ATNHPIUS16700Q');
  const caseShiller = useFredSeries(data, 'CSUSHPISA');

  if (loading) {
    return <LoadingSpinner message="fetching market data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent-400 mb-4">Error Loading FRED Data</h1>
          <p className="text-forest-200 mb-4">{error}</p>
          <p className="text-sm text-forest-300">
            Make sure you have a valid FRED API key in your .env file (VITE_FRED_API_KEY)
          </p>
        </div>
      </div>
    );
  }

  const mortgageDesc = METRIC_DESCRIPTIONS['MORTGAGE30US'];
  const fedDesc = METRIC_DESCRIPTIONS['FEDFUNDS'];
  const activeListingsDesc = METRIC_DESCRIPTIONS['ACTLISCOU45019'];
  const domDesc = METRIC_DESCRIPTIONS['MEDDAYONMAR16700'];
  const charlestonHPIDesc = METRIC_DESCRIPTIONS['ATNHPIUS16700Q'];
  const caseShillerDesc = METRIC_DESCRIPTIONS['CSUSHPISA'];

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div>
        <h2 className="text-xl font-bold text-accent-400 mb-4">Key Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
            label="Fed Funds Rate"
            value={fedFunds.latest ? Math.round(fedFunds.latest.value * 100) / 100 : null}
            unit="%"
            trend={fedFunds.trend}
            trends={fedFunds.trends}
            timePeriod={fedFunds.latest ? formatDate(fedFunds.latest.date) : ''}
            hoverDescription={fedDesc?.whatIsIt}
            howToRead={fedDesc?.howToRead}
          />
          <StatCard
            label="Active Listings (Charleston)"
            value={activeListings.latest ? Math.round(activeListings.latest.value) : null}
            unit=""
            trend={activeListings.trend}
            trends={activeListings.trends}
            timePeriod={activeListings.latest ? formatDate(activeListings.latest.date) : ''}
            hoverDescription={activeListingsDesc?.whatIsIt}
            howToRead={activeListingsDesc?.howToRead}
          />
          <StatCard
            label="Days on Market (Charleston)"
            value={daysOnMarket.latest ? Math.round(daysOnMarket.latest.value) : null}
            unit=" days"
            trend={daysOnMarket.trend}
            trends={daysOnMarket.trends}
            timePeriod={daysOnMarket.latest ? formatDate(daysOnMarket.latest.date) : ''}
            hoverDescription={domDesc?.whatIsIt}
            howToRead={domDesc?.howToRead}
          />
          <StatCard
            label="Charleston Home Prices"
            value={charlestonHPI.trends.find(t => t.period === 'YoY')
              ? Math.round(charlestonHPI.trends.find(t => t.period === 'YoY')!.changePercent * 10) / 10
              : null}
            unit="% YoY"
            timePeriod={charlestonHPI.latest ? formatDate(charlestonHPI.latest.date) : ''}
            hoverDescription="Year-over-year percent change in the FHFA All-Transactions House Price Index for the Charleston-North Charleston MSA."
            howToRead="Above 5% = fast appreciation (prices running away). 2-5% = healthy growth. Below 0% = prices falling. Compare to the national rate to see if Charleston is outpacing the country."
          />
          <StatCard
            label="National Home Prices"
            value={caseShiller.trends.find(t => t.period === 'YoY')
              ? Math.round(caseShiller.trends.find(t => t.period === 'YoY')!.changePercent * 10) / 10
              : null}
            unit="% YoY"
            timePeriod={caseShiller.latest ? formatDate(caseShiller.latest.date) : ''}
            hoverDescription="Year-over-year percent change in the S&P CoreLogic Case-Shiller U.S. National Home Price Index."
            howToRead="Above 5% = fast appreciation nationally. 2-5% = healthy. Below 0% = prices falling. Compare to Charleston to see if you're in a hotter or cooler local market."
          />
        </div>
      </div>

      {/* Mortgage Rate Chart */}
      <LineChart
        data={mortgage.timeSeries}
        title="30-Year Fixed Mortgage Rate"
        yAxisLabel="Rate (%)"
        unit="%"
      />
    </div>
  );
};

export default Briefing;

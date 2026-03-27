import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import { useFredData } from '../contexts/FredContext';
import { useFredSeries } from '../hooks/fred/useFredSeries';
import { usePendingRatio } from '../hooks/fred/usePendingRatio';
import METRIC_DESCRIPTIONS from '../config/metricDescriptions';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CharlestonLocal: React.FC = () => {
  const { data, loading, error } = useFredData();

  const activeListings = useFredSeries(data, 'ACTLISCOU45019');
  const totalListings = useFredSeries(data, 'TOTLISCOU45019');
  const daysOnMarket = useFredSeries(data, 'MEDDAYONMAR16700');
  const charlestonHPI = useFredSeries(data, 'ATNHPIUS16700Q');
  const caseShiller = useFredSeries(data, 'CSUSHPISA');

  if (loading) {
    return <LoadingSpinner message="fetching Charleston market data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent-400 mb-4">Error Loading Data</h1>
          <p className="text-forest-200 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const pending = usePendingRatio(data);

  const activeDesc = METRIC_DESCRIPTIONS['ACTLISCOU45019'];
  const domDesc = METRIC_DESCRIPTIONS['MEDDAYONMAR16700'];

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div>
        <h2 className="text-xl font-bold text-accent-400 mb-2">Charleston County Market Snapshot</h2>
        <p className="text-sm text-forest-300 mb-4">
          Local housing data for the Charleston-North Charleston metro and Charleston County, SC.
          Compare to national benchmarks to see how the local market stacks up.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <StatCard
            label="Active Listings"
            value={activeListings.latest ? Math.round(activeListings.latest.value) : null}
            unit=""
            trend={activeListings.trend}
            trends={activeListings.trends}
            timePeriod={activeListings.latest ? formatDate(activeListings.latest.date) : ''}
            hoverDescription={activeDesc?.whatIsIt}
            howToRead={activeDesc?.howToRead}
          />
          <StatCard
            label="Total Listings"
            value={totalListings.latest ? Math.round(totalListings.latest.value) : null}
            unit=""
            trend={totalListings.trend}
            trends={totalListings.trends}
            timePeriod={totalListings.latest ? formatDate(totalListings.latest.date) : ''}
            hoverDescription="Total listing count in Charleston County, including homes under contract (pending)."
            howToRead="Compare to active listings — a big gap means many homes are going under contract quickly. A narrowing gap means the market is slowing."
          />
          <StatCard
            label="Pending Rate"
            value={pending.pendingPercent}
            unit="%"
            trend={pending.trend}
            trends={pending.trends}
            timePeriod={pending.date ? formatDate(pending.date) : ''}
            hoverDescription="Percentage of all listed homes that are under contract (pending). Calculated as (Total - Active) / Total."
            howToRead="High pending rate (above 40%) = homes are flying off the market. Low rate (below 20%) = homes are sitting. This strips out seasonal inventory swings and shows pure demand pressure."
            interpretation={pending.pendingCount !== null ? `${pending.pendingCount} homes under contract` : undefined}
          />
          <StatCard
            label="Median Days on Market"
            value={daysOnMarket.latest ? Math.round(daysOnMarket.latest.value) : null}
            unit=" days"
            trend={daysOnMarket.trend}
            trends={daysOnMarket.trends}
            timePeriod={daysOnMarket.latest ? formatDate(daysOnMarket.latest.date) : ''}
            hoverDescription={domDesc?.whatIsIt}
            howToRead={domDesc?.howToRead}
            interpretation={
              daysOnMarket.latest
                ? daysOnMarket.latest.value > 40 ? 'Slower market — more leverage'
                  : daysOnMarket.latest.value < 20 ? 'Fast market — be ready to act'
                  : 'Healthy pace'
                : undefined
            }
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
            comparisonLabel="National (Case-Shiller YoY)"
            comparisonValue={caseShiller.trends.find(t => t.period === 'YoY')
              ? Math.round(caseShiller.trends.find(t => t.period === 'YoY')!.changePercent * 10) / 10
              : null}
            comparisonUnit="% YoY"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-accent-400">Charleston Trends</h2>

        <LineChart
          data={activeListings.timeSeries}
          title="Active Listings — Charleston County"
          yAxisLabel="Listings"
          unit=""
        />

        <LineChart
          data={daysOnMarket.timeSeries}
          title="Median Days on Market — Charleston MSA"
          yAxisLabel="Days"
          unit=" days"
        />

        <LineChart
          data={charlestonHPI.timeSeries}
          title="House Price Index — Charleston MSA"
          yAxisLabel="Index"
          unit=""
        />

      </div>
    </div>
  );
};

export default CharlestonLocal;

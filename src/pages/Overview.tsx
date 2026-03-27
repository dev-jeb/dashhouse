import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCensusData } from '../contexts/CensusContext';
import { useLatestMetric } from '../hooks/economicIndicators/housingVacancyAndOwnership/useLatestMetric';
import { useTimeSeriesData } from '../hooks/economicIndicators/housingVacancyAndOwnership/useTimeSeriesData';
import { DataTypeCode, RegionCode } from '../types/census/economicIndicators/housingVacancyAndOwnership';
import {
  CategoryCode as ResConCategoryCode,
  DataTypeCode as ResConDataTypeCode,
  RegionCode as ResConRegionCode
} from '../types/census/economicIndicators/residentialConstruction';
import { useLatestMetric as useLatestResConMetric } from '../hooks/economicIndicators/residentialConstruction/useLatestMetric';
import { useTimeSeriesData as useResConTimeSeriesData } from '../hooks/economicIndicators/residentialConstruction/useTimeSeriesData';
import {
  CategoryCode as ResSalesCategoryCode,
  DataTypeCode as ResSalesDataTypeCode,
  RegionCode as ResSalesRegionCode
} from '../types/census/economicIndicators/residentialSales';
import { useLatestMetric as useLatestResSalesMetric } from '../hooks/economicIndicators/residentialSales/useLatestMetric';
import { useTimeSeriesData as useResSalesTimeSeriesData } from '../hooks/economicIndicators/residentialSales/useTimeSeriesData';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';

const Overview: React.FC = () => {
  const { data, loading, error, fetchEconomicIndicatorsHousingVacancyAndOwnershipData, fetchEconomicIndicatorsResidentialConstructionData, fetchEconomicIndicatorsResidentialSalesData } = useCensusData();

  // Chart selection state for housing vacancy
  const [selectedChart, setSelectedChart] = useState<DataTypeCode>(DataTypeCode.HOR);

  // Chart selection state for residential construction
  const [selectedResConChart, setSelectedResConChart] = useState<{
    category: ResConCategoryCode;
    dataType: ResConDataTypeCode;
  }>({
    category: ResConCategoryCode.STARTS,
    dataType: ResConDataTypeCode.TOTAL
  });

  // Chart selection state for residential sales
  const [selectedResSalesChart, setSelectedResSalesChart] = useState<{
    category: ResSalesCategoryCode;
    dataType: ResSalesDataTypeCode;
  }>({
    category: ResSalesCategoryCode.SOLD,
    dataType: ResSalesDataTypeCode.MEDIAN
  });

  const usHomeownership = useLatestMetric(data.economicIndicators.housingVacancyAndOwnership, RegionCode.US, DataTypeCode.SAHOR);
  const usVacancyRate = useLatestMetric(data.economicIndicators.housingVacancyAndOwnership, RegionCode.US, DataTypeCode.HVR);
  const usRentalVacancy = useLatestMetric(data.economicIndicators.housingVacancyAndOwnership, RegionCode.US, DataTypeCode.RVR);

  // Extract time series data for selected chart
  const selectedTimeSeries = useTimeSeriesData(data.economicIndicators.housingVacancyAndOwnership, selectedChart);

  // Chart options for dropdown
  const chartOptions = [
    { value: DataTypeCode.HOR, label: 'Homeownership Rate', yAxisLabel: 'Homeownership Rate (%)' },
    { value: DataTypeCode.HVR, label: 'Housing Vacancy Rate', yAxisLabel: 'Vacancy Rate (%)' },
    { value: DataTypeCode.RVR, label: 'Rental Vacancy Rate', yAxisLabel: 'Rental Vacancy Rate (%)' }
  ];

  const selectedChartConfig = chartOptions.find(option => option.value === selectedChart);

  // Residential construction metrics
  const usMonthlyStarts = useLatestResConMetric(data.economicIndicators.residentialConstruction, ResConRegionCode.US, ResConCategoryCode.STARTS, ResConDataTypeCode.TOTAL);
  const usMonthlyCompletions = useLatestResConMetric(data.economicIndicators.residentialConstruction, ResConRegionCode.US, ResConCategoryCode.COMPLETIONS, ResConDataTypeCode.TOTAL);
  const usStartsSingle = useLatestResConMetric(data.economicIndicators.residentialConstruction, ResConRegionCode.US, ResConCategoryCode.STARTS, ResConDataTypeCode.SINGLE);

  // Time series data for selected residential construction chart
  const selectedResConTimeSeries = useResConTimeSeriesData(
    data.economicIndicators.residentialConstruction,
    selectedResConChart.category,
    selectedResConChart.dataType
  );

  // Residential sales metrics
  const usMedianPrice = useLatestResSalesMetric(data.economicIndicators.residentialSales, ResSalesRegionCode.US, ResSalesCategoryCode.SOLD, ResSalesDataTypeCode.MEDIAN);
  const usMonthsSupply = useLatestResSalesMetric(data.economicIndicators.residentialSales, ResSalesRegionCode.US, ResSalesCategoryCode.FORSALE, ResSalesDataTypeCode.MMTHS);
  const usSalesVolume = useLatestResSalesMetric(data.economicIndicators.residentialSales, ResSalesRegionCode.US, ResSalesCategoryCode.SOLD, ResSalesDataTypeCode.TOTAL);

  // Time series data for selected residential sales chart
  const selectedResSalesTimeSeries = useResSalesTimeSeriesData(
    data.economicIndicators.residentialSales,
    selectedResSalesChart.category,
    selectedResSalesChart.dataType
  );

  // Residential construction chart options
  const resConChartOptions = [
    {
      category: ResConCategoryCode.STARTS,
      dataType: ResConDataTypeCode.TOTAL,
      label: 'Monthly Housing Starts (Total)',
      yAxisLabel: 'Monthly Starts (Thousands)'
    },
    {
      category: ResConCategoryCode.STARTS,
      dataType: ResConDataTypeCode.SINGLE,
      label: 'Monthly Housing Starts (Single-Family)',
      yAxisLabel: 'Monthly Starts (Thousands)'
    },
    {
      category: ResConCategoryCode.STARTS,
      dataType: ResConDataTypeCode.MULTI,
      label: 'Monthly Housing Starts (Multi-Family)',
      yAxisLabel: 'Monthly Starts (Thousands)'
    },
    {
      category: ResConCategoryCode.COMPLETIONS,
      dataType: ResConDataTypeCode.TOTAL,
      label: 'Monthly Housing Completions (Total)',
      yAxisLabel: 'Monthly Completions (Thousands)'
    },
    {
      category: ResConCategoryCode.COMPLETIONS,
      dataType: ResConDataTypeCode.SINGLE,
      label: 'Monthly Housing Completions (Single-Family)',
      yAxisLabel: 'Monthly Completions (Thousands)'
    },
    {
      category: ResConCategoryCode.COMPLETIONS,
      dataType: ResConDataTypeCode.MULTI,
      label: 'Monthly Housing Completions (Multi-Family)',
      yAxisLabel: 'Monthly Completions (Thousands)'
    }
  ];

  const selectedResConChartConfig = resConChartOptions.find(option =>
    option.category === selectedResConChart.category && option.dataType === selectedResConChart.dataType
  );

  // Residential sales chart options
  const resSalesChartOptions = [
    {
      category: ResSalesCategoryCode.SOLD,
      dataType: ResSalesDataTypeCode.MEDIAN,
      label: 'Median Home Price',
      yAxisLabel: 'Median Price ($)',
      unit: '$'
    },
    {
      category: ResSalesCategoryCode.SOLD,
      dataType: ResSalesDataTypeCode.AVERAG,
      label: 'Average Home Price',
      yAxisLabel: 'Average Price ($)',
      unit: '$'
    },
    {
      category: ResSalesCategoryCode.FORSALE,
      dataType: ResSalesDataTypeCode.MMTHS,
      label: 'Months of Immediate Supply',
      yAxisLabel: 'Months of Supply',
      unit: ' months'
    },
    {
      category: ResSalesCategoryCode.FORSALE,
      dataType: ResSalesDataTypeCode.MONSUP,
      label: 'Months of Total Supply (Pipeline)',
      yAxisLabel: 'Months of Supply',
      unit: ' months'
    },
    {
      category: ResSalesCategoryCode.SOLD,
      dataType: ResSalesDataTypeCode.TOTAL,
      label: 'Monthly Sales Volume',
      yAxisLabel: 'Sales Volume (Thousands)',
      unit: 'K'
    },
    {
      category: ResSalesCategoryCode.FORSALE,
      dataType: ResSalesDataTypeCode.TOTAL,
      label: 'Homes for Sale Inventory',
      yAxisLabel: 'Inventory (Thousands)',
      unit: 'K'
    }
  ];

  const selectedResSalesChartConfig = resSalesChartOptions.find(option =>
    option.category === selectedResSalesChart.category && option.dataType === selectedResSalesChart.dataType
  );

  useEffect(() => {
    fetchEconomicIndicatorsHousingVacancyAndOwnershipData();
    fetchEconomicIndicatorsResidentialConstructionData();
    fetchEconomicIndicatorsResidentialSalesData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="building your overview..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent-400 mb-4">Error Loading Data</h1>
          <p className="text-forest-200 mb-4">{error}</p>
          <p className="text-sm text-forest-300">
            Make sure you have a valid Census API key in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Housing Vacancy & Ownership Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-accent-400">Housing Vacancy & Ownership</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <StatCard
            label="US Homeownership Rate"
            value={usHomeownership?.value || null}
            hoverDescription={usHomeownership?.description || ''}
            timePeriod={`${usHomeownership?.timePeriod.year}-Q${usHomeownership?.timePeriod.quarter}`}
          />
          <StatCard
            label="US Housing Vacancy Rate"
            value={usVacancyRate?.value || null}
            hoverDescription={usVacancyRate?.description || ''}
            timePeriod={`${usVacancyRate?.timePeriod.year}-Q${usVacancyRate?.timePeriod.quarter}`}
          />
          <StatCard
            label="US Rental Vacancy Rate"
            value={usRentalVacancy?.value || null}
            hoverDescription={usRentalVacancy?.description || ''}
            timePeriod={`${usRentalVacancy?.timePeriod.year}-Q${usRentalVacancy?.timePeriod.quarter}`}
          />
        </div>

        {/* Chart Selection and Display */}
        <div className="space-y-4">
          {/* Chart Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-forest-200">
              Chart View:
            </label>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as DataTypeCode)}
              className="bg-forest-700 border border-forest-600 text-forest-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-colors"
            >
              {chartOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Chart */}
          {selectedChartConfig && (
            <LineChart
              data={selectedTimeSeries}
              title={`${selectedChartConfig.label} by Region`}
              yAxisLabel={selectedChartConfig.yAxisLabel}
              unit="%"
            />
          )}
        </div>
      </div>

      {/* Residential Construction Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-accent-400">Residential Construction</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <StatCard
            label="US Monthly Housing Starts"
            value={usMonthlyStarts}
            unit="K"
            hoverDescription="Monthly housing construction starts in thousands of units"
          />
          <StatCard
            label="US Monthly Housing Completions"
            value={usMonthlyCompletions}
            unit="K"
            hoverDescription="Monthly housing construction completions in thousands of units"
          />
          <StatCard
            label="US Single-Family Starts"
            value={usStartsSingle}
            unit="K"
            hoverDescription="Monthly single-family housing starts in thousands of units"
          />
        </div>

        {/* Chart Selection and Display */}
        <div className="space-y-4">
          {/* Chart Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-forest-200">
              Construction Chart:
            </label>
            <select
              value={`${selectedResConChart.category}-${selectedResConChart.dataType}`}
              onChange={(e) => {
                const [category, dataType] = e.target.value.split('-');
                setSelectedResConChart({
                  category: category as ResConCategoryCode,
                  dataType: dataType as ResConDataTypeCode
                });
              }}
              className="bg-forest-700 border border-forest-600 text-forest-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-colors"
            >
              {resConChartOptions.map(option => (
                <option key={`${option.category}-${option.dataType}`} value={`${option.category}-${option.dataType}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Chart */}
          {selectedResConChartConfig && (
            <LineChart
              data={selectedResConTimeSeries}
              title={`${selectedResConChartConfig.label} by Region`}
              yAxisLabel={selectedResConChartConfig.yAxisLabel}
              unit="K"
            />
          )}
        </div>
      </div>

      {/* Residential Sales Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-accent-400">Residential Sales & Market</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <StatCard
            label="US Median Home Price"
            value={usMedianPrice}
            unit="$"
            hoverDescription="Median home sale price in dollars - most reliable price indicator"
          />
          <StatCard
            label="US Months of Supply"
            value={usMonthsSupply}
            unit=" months"
            hoverDescription="Months to sell current inventory - key market health indicator"
          />
          <StatCard
            label="US Monthly Sales Volume"
            value={usSalesVolume}
            unit="K"
            hoverDescription="Monthly home sales volume in thousands of units"
          />
        </div>

        {/* Chart Selection and Display */}
        <div className="space-y-4">
          {/* Chart Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-forest-200">
              Sales Chart:
            </label>
            <select
              value={`${selectedResSalesChart.category}-${selectedResSalesChart.dataType}`}
              onChange={(e) => {
                const [category, dataType] = e.target.value.split('-');
                setSelectedResSalesChart({
                  category: category as ResSalesCategoryCode,
                  dataType: dataType as ResSalesDataTypeCode
                });
              }}
              className="bg-forest-700 border border-forest-600 text-forest-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-colors"
            >
              {resSalesChartOptions.map(option => (
                <option key={`${option.category}-${option.dataType}`} value={`${option.category}-${option.dataType}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Chart */}
          {selectedResSalesChartConfig && (
            <LineChart
              data={selectedResSalesTimeSeries}
              title={`${selectedResSalesChartConfig.label} by Region`}
              yAxisLabel={selectedResSalesChartConfig.yAxisLabel}
              unit={selectedResSalesChartConfig.unit}
            />
          )}
        </div>
      </div>
    </div>
  )
};

export default Overview;
import { useMemo } from 'react';
import { 
  ResidentialSalesSeries, 
  CategoryCode, 
  DataTypeCode,
  RegionCode 
} from '../../../types/census/economicIndicators/residentialSales';
import { ChartData, ChartDataset } from '../../../components/LineChart';

export interface ResSalesTimeSeriesDataset extends ChartDataset {
  regionCode: RegionCode;
}

export interface ResSalesTimeSeriesData extends ChartData {
  datasets: ResSalesTimeSeriesDataset[];
}

export function useTimeSeriesData(
  data: ResidentialSalesSeries | null,
  category: CategoryCode,
  dataType: DataTypeCode
): ResSalesTimeSeriesData {
  return useMemo(() => {
    if (!data || data.steps.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Create labels from time periods
    const labels = data.steps.map(step => 
      `${step.timePeriod.year}-${step.timePeriod.month.toString().padStart(2, '0')}`
    );

    // Create dataset for each region
    const datasets: ResSalesTimeSeriesDataset[] = Object.values(RegionCode).map(regionCode => {
      const regionData = data.steps.map(step => {
        const metric = step.metrics[regionCode]?.[category]?.[dataType];
        return metric || 0;
      });

      const regionNames = {
        [RegionCode.US]: 'United States',
        [RegionCode.MW]: 'Midwest', 
        [RegionCode.NO]: 'Northeast',
        [RegionCode.SO]: 'South',
        [RegionCode.WE]: 'West'
      };

      return {
        label: regionNames[regionCode],
        data: regionData,
        regionCode
      };
    }).filter(dataset => dataset.data.some(value => value !== 0)); // Only include regions with data

    return { labels, datasets };
  }, [data, category, dataType]);
}
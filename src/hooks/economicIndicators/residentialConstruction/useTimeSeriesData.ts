import { useMemo } from 'react';
import {
  ResidentialConstructionSeries,
  CategoryCode,
  DataTypeCode,
  RegionCode
} from '../../../types/census/economicIndicators/residentialConstruction';
import { ChartData, ChartDataset } from '../../../components/LineChart';
import { REGION_DISPLAY_NAMES } from '../../../types/census/regions';

export interface ResConstructionTimeSeriesDataset extends ChartDataset {
  regionCode: RegionCode;
}

export interface ResConstructionTimeSeriesData extends ChartData {
  datasets: ResConstructionTimeSeriesDataset[];
}

export function useTimeSeriesData(
  data: ResidentialConstructionSeries | null,
  category: CategoryCode,
  dataType: DataTypeCode
): ResConstructionTimeSeriesData {
  return useMemo(() => {
    if (!data || data.steps.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Create labels from time periods
    const labels = data.steps.map(step => 
      `${step.timePeriod.year}-${step.timePeriod.month.toString().padStart(2, '0')}`
    );

    // Create dataset for each region
    const datasets: ResConstructionTimeSeriesDataset[] = Object.values(RegionCode).map(regionCode => {
      const regionData = data.steps.map(step => {
        const metric = step.metrics[regionCode]?.[category]?.[dataType];
        return metric || 0;
      });

      return {
        label: REGION_DISPLAY_NAMES[regionCode] || regionCode,
        data: regionData,
        regionCode
      };
    }).filter(dataset => dataset.data.some(value => value !== 0)); // Only include regions with data

    return { labels, datasets };
  }, [data, category, dataType]);
}
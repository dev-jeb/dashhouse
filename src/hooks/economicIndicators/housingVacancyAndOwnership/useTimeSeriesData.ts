import { useMemo } from 'react';
import {
  HousingVacancyAndOwnershipSeries,
  DataTypeCode,
  RegionCode
} from '../../../types/census/economicIndicators/housingVacancyAndOwnership';
import { ChartData, ChartDataset } from '../../../components/LineChart';
import { REGION_DISPLAY_NAMES } from '../../../types/census/regions';

export interface TimeSeriesDataset extends ChartDataset {
  regionCode: RegionCode;
}

export interface TimeSeriesData extends ChartData {
  datasets: TimeSeriesDataset[];
}

export function useTimeSeriesData(
  data: HousingVacancyAndOwnershipSeries | null,
  metric: DataTypeCode
): TimeSeriesData {
  return useMemo(() => {
    if (!data || data.steps.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Create labels from time periods
    const labels = data.steps.map(step => 
      `${step.timePeriod.year}-Q${step.timePeriod.quarter}`
    );

    // Create dataset for each region
    const datasets: TimeSeriesDataset[] = Object.values(RegionCode).map(regionCode => {
      const regionData = data.steps.map(step => 
        step.metrics[regionCode][metric] || 0
      );

      return {
        label: REGION_DISPLAY_NAMES[regionCode] || regionCode,
        data: regionData,
        regionCode
      };
    });

    return { labels, datasets };
  }, [data, metric]);
}
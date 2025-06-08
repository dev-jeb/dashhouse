import { useMemo } from 'react';
import {
  HousingVacancyAndOwnershipSeries,
  DataTypeCode,
  RegionCode,
  TimePeriod,
  DataTypeCodeDescription
} from '../../../types/census/economicIndicators/housingVacancyAndOwnership';


export interface LatestMetricOutput {
  value: number | null;
  timePeriod: TimePeriod;
  description: string;
}

export function useLatestMetric(
  data: HousingVacancyAndOwnershipSeries | null,
  region: RegionCode,
  metric: DataTypeCode
): LatestMetricOutput | null {
  return useMemo(() => {
    if (!data || data.steps.length === 0) {
      return null;
    }

    const latestStep = data.steps[data.steps.length - 1];

    return {
      value: latestStep.metrics[region][metric] || null,
      timePeriod: latestStep.timePeriod,
      description: DataTypeCodeDescription[metric]
    };
  }, [data, region, metric]);
}
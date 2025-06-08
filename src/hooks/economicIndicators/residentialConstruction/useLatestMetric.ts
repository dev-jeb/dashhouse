import { useMemo } from 'react';
import { 
  ResidentialConstructionSeries, 
  CategoryCode, 
  DataTypeCode,
  RegionCode 
} from '../../../types/census/economicIndicators/residentialConstruction';

export function useLatestMetric(
  data: ResidentialConstructionSeries | null,
  region: RegionCode,
  category: CategoryCode,
  dataType: DataTypeCode
): number | null {
  return useMemo(() => {
    if (!data || data.steps.length === 0) {
      return null;
    }

    // Get the latest time step
    const latestStep = data.steps[data.steps.length - 1];
    
    // Return the metric value for the specified region, category, and data type
    const metric = latestStep.metrics[region]?.[category]?.[dataType];
    return metric || null;
  }, [data, region, category, dataType]);
}
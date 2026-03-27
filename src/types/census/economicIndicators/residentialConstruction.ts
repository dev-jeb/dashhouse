export enum CategoryCode {
  COMPLETIONS = 'COMPLETIONS',    // Monthly Completions
  STARTS = 'STARTS'               // Monthly Starts
}

export enum CategoryCodeDescription {
  COMPLETIONS = 'Monthly Completions - Housing units completed (thousands)',
  STARTS = 'Monthly Starts - Construction starts (thousands)'
}

export enum DataTypeCode {
  SINGLE = 'SINGLE',  // Single-family units
  MULTI = 'MULTI',    // Multi-family units
  TOTAL = 'TOTAL'     // Total (Single + Multi)
}

export enum DataTypeCodeDescription {
  SINGLE = 'Single-Family Units - Detached homes designed for one family',
  MULTI = 'Multi-Family Units - Buildings with 2 or more housing units',
  TOTAL = 'Total Units - Combined single-family and multi-family units'
}

export enum RegionCode {
  US = 'US',    // United States (National)
  MW = 'MW',    // Midwest
  NE = 'NE',    // Northeast  
  NO = 'NO',    // Northeast (alternative code)
  SO = 'SO',    // South
  WE = 'WE'     // West
}

export interface TimePeriod {
  year: number;
  month: number;
}

export interface ResidentialConstructionDataPoint {
  categoryCode: CategoryCode;
  dataTypeCode: DataTypeCode;
  value: number;
  regionCode: RegionCode;
  seasonallyAdjusted: boolean;
}

export interface ResidentialConstructionTimeStep {
  timePeriod: TimePeriod;
  metrics: Record<RegionCode, Record<CategoryCode, Record<DataTypeCode, number>>>;
}

export interface ResidentialConstructionSeries {
  steps: ResidentialConstructionTimeStep[];
}

export function parseTimePeriod(timeStr: string): TimePeriod {
  const [year, month] = timeStr.split('-');
  return {
    year: parseInt(year),
    month: parseInt(month)
  };
}

export function parseResidentialConstructionData(data: any[][]): ResidentialConstructionSeries {
  if (!data || data.length < 2) {
    return { steps: [] };
  }

  const [_, ...rows] = data;

  // Group by time period
  const timeSteps = new Map<string, ResidentialConstructionTimeStep>();

  // Initialize empty metrics for a region
  const createEmptyMetrics = (): Record<CategoryCode, Record<DataTypeCode, number>> => {
    const result = {} as Record<CategoryCode, Record<DataTypeCode, number>>;
    Object.values(CategoryCode).forEach(category => {
      result[category] = {} as Record<DataTypeCode, number>;
      Object.values(DataTypeCode).forEach(dataType => {
        result[category][dataType] = 0;
      });
    });
    return result;
  };

  rows.forEach(row => {
    const dataTypeCode = row[2] as DataTypeCode;
    const value = parseFloat(row[3]);
    const regionCode = row[4] as RegionCode;
    const timeStr = row[6]; // time
    const categoryCode = row[9] as CategoryCode;
    const timePeriod = parseTimePeriod(timeStr);

    // Skip if not a known code
    if (!Object.values(CategoryCode).includes(categoryCode) ||
      !Object.values(DataTypeCode).includes(dataTypeCode) ||
      !Object.values(RegionCode).includes(regionCode)) {
      return;
    }

    if (!timeSteps.has(timeStr)) {
      timeSteps.set(timeStr, {
        timePeriod,
        metrics: {
          [RegionCode.US]: createEmptyMetrics(),
          [RegionCode.MW]: createEmptyMetrics(),
          [RegionCode.NE]: createEmptyMetrics(),
          [RegionCode.NO]: createEmptyMetrics(),
          [RegionCode.SO]: createEmptyMetrics(),
          [RegionCode.WE]: createEmptyMetrics()
        }
      });
    }

    const step = timeSteps.get(timeStr)!;
    step.metrics[regionCode][categoryCode][dataTypeCode] = value;
  });

  return {
    steps: Array.from(timeSteps.values()).sort((a, b) => {
      // Sort by year, then month
      if (a.timePeriod.year !== b.timePeriod.year) {
        return a.timePeriod.year - b.timePeriod.year;
      }
      return a.timePeriod.month - b.timePeriod.month;
    })
  };
}
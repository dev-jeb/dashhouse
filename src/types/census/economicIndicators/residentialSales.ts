export enum CategoryCode {
  FORSALE = 'FORSALE',    // Homes for sale inventory
  SOLD = 'SOLD'           // Homes sold metrics
}

export enum CategoryCodeDescription {
  FORSALE = 'For Sale - Homes currently on the market',
  SOLD = 'Sold - Recently sold homes metrics'
}

export enum DataTypeCode {
  MMTHS = 'MMTHS',        // Months of immediate supply
  MONSUP = 'MONSUP',      // Months of total supply (including pipeline)
  MEDIAN = 'MEDIAN',      // Median home price
  AVERAG = 'AVERAG',      // Average home price
  TOTAL = 'TOTAL'         // Total sales volume or inventory count
}

export enum DataTypeCodeDescription {
  MMTHS = 'Months of Immediate Supply - Time to sell current ready inventory',
  MONSUP = 'Months of Total Supply - Time to sell all inventory including pipeline',
  MEDIAN = 'Median Home Price - Middle price point',
  AVERAG = 'Average Home Price - Mean price including luxury outliers',
  TOTAL = 'Total Count - Sales volume or inventory count'
}

export enum RegionCode {
  US = 'US',    // United States (National)
  MW = 'MW',    // Midwest
  NO = 'NO',    // Northeast
  SO = 'SO',    // South
  WE = 'WE'     // West
}

export interface TimePeriod {
  year: number;
  month: number;
}

export interface ResidentialSalesDataPoint {
  categoryCode: CategoryCode;
  dataTypeCode: DataTypeCode;
  value: number;
  regionCode: RegionCode;
}

export interface ResidentialSalesTimeStep {
  timePeriod: TimePeriod;
  metrics: Record<RegionCode, Record<CategoryCode, Record<DataTypeCode, number>>>;
}

export interface ResidentialSalesSeries {
  steps: ResidentialSalesTimeStep[];
}

export function parseTimePeriod(timeStr: string): TimePeriod {
  const [year, month] = timeStr.split('-');
  return {
    year: parseInt(year),
    month: parseInt(month)
  };
}

export function parseResidentialSalesData(data: any[][]): ResidentialSalesSeries {
  if (!data || data.length < 2) {
    return { steps: [] };
  }

  const [header, ...rows] = data;
  
  // Group by time period
  const timeSteps = new Map<string, ResidentialSalesTimeStep>();

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
    const value = parseFloat(row[2]);
    const regionCode = row[3] as RegionCode;
    const timeStr = row[4]; // time
    const categoryCode = row[7] as CategoryCode;
    const dataTypeCode = row[8] as DataTypeCode;
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
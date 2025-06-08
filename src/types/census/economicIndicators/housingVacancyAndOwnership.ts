export enum DataTypeCode {
  HOR = 'HOR',           // Homeownership Rate
  HVR = 'HVR',          // Housing Vacancy Rate
  RVR = 'RVR',          // Rental Vacancy Rate
  SAHOR = 'SAHOR'       // Seasonally Adjusted Homeownership Rate
}

export enum DataTypeCodeDescription {
  HOR = 'Homeownership Rate - The percentage of housing units that are owner-occupied. Calculated as (owner-occupied units / total occupied units) × 100',
  HVR = 'Housing Vacancy Rate - The percentage of all housing units that are vacant and available for sale or rent. Calculated as (vacant units / total units) × 100',
  RVR = 'Rental Vacancy Rate - The percentage of rental units that are vacant and available for rent. Calculated as (vacant rental units / total rental units) × 100',
  SAHOR = 'Seasonally Adjusted Homeownership Rate - The homeownership rate adjusted for seasonal variations in the housing market, providing a more accurate picture of long-term trends'
}

export enum RegionCode {
  US = 'US',            // United States (National)
  MW = 'MW',           // Midwest (IL, IN, MI, OH, WI, IA, KS, MN, MO, NE, ND, SD)
  NE = 'NE',           // Northeast (CT, ME, MA, NH, RI, VT, NJ, NY, PA)
  SO = 'SO',           // South (DE, DC, FL, GA, MD, NC, SC, VA, WV, AL, KY, MS, TN, AR, LA, OK, TX)
  WE = 'WE'            // West (AZ, CO, ID, MT, NV, NM, UT, WY, AK, CA, HI, OR, WA)
}

export interface TimePeriod {
  year: number;
  quarter: number;
}

export interface HousingVacancyAndOwnershipDataPoint {
  dataTypeCode: DataTypeCode;
  value: number;
  regionCode: RegionCode;
}

export interface HousingVacancyAndOwnershipTimeStep {
  timePeriod: TimePeriod;
  metrics: Record<RegionCode, Record<DataTypeCode, number>>;
}

export interface HousingVacancyAndOwnershipSeries {
  steps: HousingVacancyAndOwnershipTimeStep[];
}

export function parseTimePeriod(timeStr: string): TimePeriod {
  const [year, quarter] = timeStr.split('-Q');
  return {
    year: parseInt(year),
    quarter: parseInt(quarter)
  };
}

export function parseHousingVacancyAndOwnershipData(data: any[][]): HousingVacancyAndOwnershipSeries {
  if (!data || data.length < 2) {
    return { steps: [] };
  }

  const [, ...rows] = data;

  // Group by time period
  const timeSteps = new Map<string, HousingVacancyAndOwnershipTimeStep>();

  // Initialize empty metrics for a region
  const createEmptyMetrics = (): Record<DataTypeCode, number> => ({
    [DataTypeCode.HOR]: 0,
    [DataTypeCode.HVR]: 0,
    [DataTypeCode.RVR]: 0,
    [DataTypeCode.SAHOR]: 0
  });

  rows.forEach(row => {
    const timeStr = row[6];
    const timePeriod = parseTimePeriod(timeStr);
    const dataType = row[2] as DataTypeCode;
    const region = row[5] as RegionCode;
    const value = parseFloat(row[4]); // cell_value

    // Skip if not a known data type or region
    if (!Object.values(DataTypeCode).includes(dataType) || !Object.values(RegionCode).includes(region)) {
      return;
    }

    if (!timeSteps.has(timeStr)) {
      timeSteps.set(timeStr, {
        timePeriod,
        metrics: {
          [RegionCode.US]: createEmptyMetrics(),
          [RegionCode.MW]: createEmptyMetrics(),
          [RegionCode.NE]: createEmptyMetrics(),
          [RegionCode.SO]: createEmptyMetrics(),
          [RegionCode.WE]: createEmptyMetrics()
        }
      });
    }

    const step = timeSteps.get(timeStr)!;
    step.metrics[region][dataType] = value;
  });

  return {
    steps: Array.from(timeSteps.values()).sort((a, b) => {
      // Sort by year, then quarter
      if (a.timePeriod.year !== b.timePeriod.year) {
        return a.timePeriod.year - b.timePeriod.year;
      }
      return a.timePeriod.quarter - b.timePeriod.quarter;
    })
  };
}
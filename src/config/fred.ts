const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY as string | undefined;

// Use Vite proxy in dev to avoid CORS, direct URL in production
const FRED_BASE_URL = import.meta.env.DEV
  ? '/api/fred/fred/series/observations'
  : 'https://api.stlouisfed.org/fred/series/observations';

if (!FRED_API_KEY) {
  console.warn('[FRED] No API key found. Set VITE_FRED_API_KEY in your .env file and restart the dev server.');
}

export interface FredSeriesMeta {
  name: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  description: string;
  seasonal?: boolean; // if true, trend compares year-over-year instead of 3 months
}

export const FRED_SERIES: Record<string, FredSeriesMeta> = {
  // Rates
  MORTGAGE30US: {
    name: '30-Year Fixed Mortgage Rate',
    unit: '%',
    frequency: 'weekly',
    description: 'Average 30-year fixed mortgage rate from Freddie Mac Primary Mortgage Market Survey.',
  },
  FEDFUNDS: {
    name: 'Federal Funds Effective Rate',
    unit: '%',
    frequency: 'daily',
    description: 'The interest rate at which banks lend reserves to each other overnight. Set by the Federal Reserve.',
  },

  // National price indices
  CSUSHPISA: {
    name: 'Case-Shiller Home Price Index',
    unit: 'index',
    frequency: 'monthly',
    description: 'S&P CoreLogic Case-Shiller U.S. National Home Price Index, seasonally adjusted.',
  },

  // Charleston-specific
  ACTLISCOU45019: {
    name: 'Active Listings (Charleston County)',
    unit: 'listings',
    frequency: 'monthly',
    seasonal: true,
    description: 'Number of active home listings in Charleston County, SC.',
  },
  TOTLISCOU45019: {
    name: 'Total Listings (Charleston County)',
    unit: 'listings',
    frequency: 'monthly',
    seasonal: true,
    description: 'Total listing count including pending in Charleston County, SC.',
  },
  MEDDAYONMAR16700: {
    name: 'Median Days on Market (Charleston MSA)',
    unit: 'days',
    frequency: 'monthly',
    seasonal: true,
    description: 'Median number of days homes stay on the market before going under contract in the Charleston-North Charleston MSA.',
  },
  ATNHPIUS16700Q: {
    name: 'House Price Index (Charleston MSA)',
    unit: 'index',
    frequency: 'quarterly',
    description: 'All-Transactions House Price Index for the Charleston-North Charleston MSA from FHFA.',
  },
  BPPRIV045019: {
    name: 'Building Permits (Charleston County)',
    unit: 'permits',
    frequency: 'monthly',
    seasonal: true,
    description: 'New privately-owned housing units authorized by building permits in Charleston County.',
  },

  // Macro indicators
  CPIAUCSL: {
    name: 'Consumer Price Index (CPI)',
    unit: 'index',
    frequency: 'monthly',
    description: 'Consumer Price Index for All Urban Consumers, seasonally adjusted. Primary measure of inflation.',
  },
  UMCSENT: {
    name: 'Consumer Sentiment',
    unit: 'index',
    frequency: 'monthly',
    description: 'University of Michigan Consumer Sentiment Index. Measures consumer confidence about the economy.',
  },
  UNRATE: {
    name: 'Unemployment Rate',
    unit: '%',
    frequency: 'monthly',
    description: 'U.S. civilian unemployment rate, seasonally adjusted.',
  },
  PERMIT: {
    name: 'Building Permits (National)',
    unit: 'thousands',
    frequency: 'monthly',
    description: 'New privately-owned housing units authorized by building permits nationally, seasonally adjusted annual rate.',
  },
  A191RL1Q225SBEA: {
    name: 'Real GDP Growth',
    unit: '%',
    frequency: 'quarterly',
    description: 'Real Gross Domestic Product, percent change from preceding period, seasonally adjusted annual rate.',
  },
};

export function buildFredUrl(seriesId: string, observationStart?: string): string {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: 'json',
    sort_order: 'asc',
  });
  if (observationStart) {
    params.set('observation_start', observationStart);
  }
  return `${FRED_BASE_URL}?${params.toString()}`;
}

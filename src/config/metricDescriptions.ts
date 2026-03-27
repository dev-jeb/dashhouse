export interface MetricDescription {
  whatIsIt: string;
  howToRead: string;
}

const METRIC_DESCRIPTIONS: Record<string, MetricDescription> = {
  // Rates
  MORTGAGE30US: {
    whatIsIt: 'The average rate on a 30-year fixed mortgage, updated weekly by Freddie Mac.',
    howToRead: 'Below 6% is historically affordable. Above 7% significantly reduces purchasing power. Each 1% increase on a $480K loan adds ~$300/mo to your payment.',
  },
  FEDFUNDS: {
    whatIsIt: 'The interest rate banks charge each other for overnight loans, set by the Federal Reserve.',
    howToRead: 'When the Fed raises this rate, mortgage rates tend to follow within weeks. When they cut, mortgage rates usually drop. Watch Fed meeting announcements for direction.',
  },

  // Price indices
  CSUSHPISA: {
    whatIsIt: 'The S&P CoreLogic Case-Shiller U.S. National Home Price Index — the most respected measure of home price trends.',
    howToRead: 'A rising index means national home prices are increasing. Compare the rate of increase year-over-year: above 5% is fast appreciation, below 2% is slowing.',
  },
  ATNHPIUS16700Q: {
    whatIsIt: 'The FHFA All-Transactions House Price Index for the Charleston-North Charleston metro area.',
    howToRead: 'Tracks how Charleston home values change over time relative to a baseline. Compare growth rate to the national Case-Shiller to see if Charleston is outpacing or lagging the country.',
  },

  // Charleston local
  ACTLISCOU45019: {
    whatIsIt: 'The number of homes actively listed for sale in Charleston County right now.',
    howToRead: 'More listings = more choices and negotiating power for buyers. Watch for sustained increases — that signals the market shifting in your favor.',
  },
  TOTLISCOU45019: {
    whatIsIt: 'Total listing count in Charleston County, including homes under contract (pending).',
    howToRead: 'Compare to active listings — a big gap means many homes are going under contract quickly. A narrowing gap means the market is slowing.',
  },
  MEDDAYONMAR16700: {
    whatIsIt: 'The median number of days homes stay listed before going under contract in the Charleston metro.',
    howToRead: 'Under 20 days = very hot market (homes sell fast, less room to negotiate). 20-40 days = healthy pace. Over 40 days = homes are sitting, giving you leverage.',
  },
  BPPRIV045019: {
    whatIsIt: 'New housing building permits issued in Charleston County — a forward-looking indicator of future supply.',
    howToRead: 'More permits today means more homes available in 6-18 months. Rising permits can help ease price pressure over time.',
  },

  // Macro
  CPIAUCSL: {
    whatIsIt: 'The Consumer Price Index measures the average change in prices paid by urban consumers for goods and services — the primary measure of inflation.',
    howToRead: 'The Fed targets 2% annual inflation. When CPI runs hot (above 3-4%), the Fed raises rates to cool it down, which pushes mortgage rates up.',
  },
  UMCSENT: {
    whatIsIt: 'The University of Michigan Consumer Sentiment Index — measures how confident Americans feel about the economy.',
    howToRead: 'Above 80 = consumers feel good (more likely to make big purchases like homes). Below 60 = pessimism (demand drops, which can slow price growth). Baseline is 100 (1966).',
  },
  UNRATE: {
    whatIsIt: 'The percentage of the U.S. labor force that is unemployed and actively seeking work.',
    howToRead: 'Below 4% = very strong job market (supports housing demand). Above 6% = weakening economy (less demand, potential price relief). Rising unemployment historically leads to rate cuts.',
  },
  PERMIT: {
    whatIsIt: 'New housing building permits authorized nationally, reported as a seasonally adjusted annual rate in thousands of units.',
    howToRead: 'More permits = more future housing supply. The long-run average is ~1.4M. Below 1M signals an underbuilding problem that could push prices up.',
  },
  A191RL1Q225SBEA: {
    whatIsIt: 'Real GDP growth — the quarterly percent change in total U.S. economic output, adjusted for inflation.',
    howToRead: 'Positive growth = expanding economy (supports housing demand). Negative growth for 2+ quarters = recession (typically leads to rate cuts and potential price drops).',
  },

  // Census-based (existing)
  homeownershipRate: {
    whatIsIt: 'The percentage of occupied housing units that are owner-occupied.',
    howToRead: 'A rising rate means more people are buying (strong demand). The long-run average is ~65%. Below 63% can signal affordability problems.',
  },
  housingVacancyRate: {
    whatIsIt: 'The percentage of housing units that are vacant and available for sale.',
    howToRead: 'Below 1.5% = very tight inventory (seller\'s market). Above 2.5% = more available homes (buyer\'s market). Current levels reflect the national housing shortage.',
  },
  rentalVacancyRate: {
    whatIsIt: 'The percentage of rental units that are vacant and available for rent.',
    howToRead: 'Low rental vacancy pushes rents up, which motivates more people to consider buying. High vacancy eases rent pressure, making renting more attractive vs. buying.',
  },
  monthsOfSupply: {
    whatIsIt: 'How many months it would take to sell all homes currently for sale at the current pace of sales.',
    howToRead: 'Below 4 months = seller\'s market (expect bidding wars). 4-6 months = balanced. Above 6 months = buyer\'s market (more negotiating power).',
  },
  medianHomePrice: {
    whatIsIt: 'The middle price point of all homes sold — half sold for more, half for less. More reliable than average because it isn\'t skewed by luxury outliers.',
    howToRead: 'Compare month-over-month and year-over-year. Sustained drops of 2%+ YoY signal a cooling market. In your $600K range, watch for the median to approach your budget.',
  },
  averageHomePrice: {
    whatIsIt: 'The mean sale price of all homes sold. Includes luxury properties, so it runs higher than median.',
    howToRead: 'When average diverges significantly from median, it means the high end is moving differently than the middle market. Focus on median for your price range.',
  },
  housingStarts: {
    whatIsIt: 'The number of new residential construction projects that began during the period, in thousands of units.',
    howToRead: 'More starts = more future supply. The long-run average is ~1.5M annually. Below 1M signals underbuilding.',
  },
  housingCompletions: {
    whatIsIt: 'The number of new residential construction projects completed during the period, in thousands of units.',
    howToRead: 'Completions lag starts by 6-12 months. Rising completions mean new supply is actually hitting the market, which helps ease price pressure.',
  },
};

export function getMetricDescription(key: string): MetricDescription | undefined {
  return METRIC_DESCRIPTIONS[key];
}

export default METRIC_DESCRIPTIONS;

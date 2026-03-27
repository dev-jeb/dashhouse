# Dashhouse

Personal housing market + economic dashboard focused on Charleston, SC. Pulls data from the Census Bureau, Federal Reserve (FRED), and displays it across four pages: Briefing, Charleston, National, and Forces.

## Getting Started

```bash
cp .env.example .env       # add your FRED API key
npm install
npm run dev                # starts on http://localhost:3000
npm run build              # production build
```

Requires a free FRED API key from https://fred.stlouisfed.org (set `VITE_FRED_API_KEY` in `.env`).

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS v4 (dark forest-green theme defined in `src/index.css`)
- Custom SVG line charts (no charting library)

## Architecture

```
Data Sources → Contexts (fetch + parse) → Hooks (transform) → Pages + Components
```

### Data Contexts (src/contexts/)
- **CensusContext** — fetches 3 Census Bureau endpoints (housing vacancy, construction, sales)
- **FredContext** — fetches 13 FRED series on mount (rates, Charleston local, macro indicators)

### Types + Parsers
- **`src/types/census/economicIndicators/`** — Census data types, enums, parsers
- **`src/types/fred/series.ts`** — FRED observation types + parser
- **`src/types/common.ts`** — Shared `ChartData` and `ChartDataset` interfaces
- **`src/types/census/regions.ts`** — Shared region display names + chart colors

### Config (src/config/)
- **`fred.ts`** — FRED API key loader, base URL builder, series metadata registry
- **`metricDescriptions.ts`** — Centralized tooltip text for every metric (whatIsIt + howToRead)

### Hooks (src/hooks/)
- **`economicIndicators/`** — Census hooks: `useLatestMetric`, `useTimeSeriesData` (per data source)
- **`fred/useFredSeries.ts`** — Generic hook for any FRED series → latest value, chart data, trend
- **`fred/useBriefingSignals.ts`** — Rule-based engine that generates plain-English market signals

### Pages (src/pages/)
- **Briefing** — Monthly market briefing with signals + key StatCards
- **CharlestonLocal** — Charleston County/MSA metrics (listings, DOM, HPI, permits)
- **Overview** — National Census data (vacancy, construction, sales by region)
- **Forces** — 3-tier explainer: Fed → Rates → Supply/Demand/Prices

### Components (src/components/)
- **LineChart** — Custom SVG chart with zoom, scroll, legend toggle, tooltips
- **StatCard** — Metric card with trend arrows, interpretation text, two-part hover tooltip, comparison values
- **PaymentCalculator** — Interactive mortgage payment calculator with rate scenarios
- **NavTabs** — Tab navigation (Briefing, Charleston, National, Forces)
- **DataFreshness** — Small "last updated" badge
- **LoadingSpinner** — Full-screen loading state

## Data Sources

### FRED (Federal Reserve Economic Data)
Series are registered in `src/config/fred.ts`. Key series:

| Series ID | What | Frequency |
|---|---|---|
| MORTGAGE30US | 30-year mortgage rate | Weekly |
| FEDFUNDS | Fed funds rate | Daily |
| CSUSHPISA | Case-Shiller Home Price Index | Monthly |
| ACTLISCOU45019 | Active listings, Charleston County | Monthly |
| MEDDAYONMAR16700 | Days on market, Charleston MSA | Monthly |
| ATNHPIUS16700A | House price index, Charleston MSA | Quarterly |
| CPIAUCSL | CPI (inflation) | Monthly |
| UMCSENT | Consumer sentiment | Monthly |
| UNRATE | Unemployment rate | Monthly |

### Census Bureau
Endpoints from `https://api.census.gov/data/timeseries/eits/`:

| Endpoint | Data | Frequency |
|---|---|---|
| `hv` | Housing Vacancy & Ownership | Quarterly |
| `resconst` | Residential Construction | Monthly |
| `ressales` | Residential Sales | Monthly |

## Adding a New FRED Series

1. Add the series ID + metadata to `FRED_SERIES` in `src/config/fred.ts`
2. Add it to `INITIAL_SERIES` in `src/contexts/FredContext.tsx`
3. Add tooltip text in `src/config/metricDescriptions.ts`
4. Use `useFredSeries(data, 'SERIES_ID')` in your component

## Region Codes

The Census API uses `NE` for Northeast in some endpoints, `NO` in others. The shared mapping in `src/types/census/regions.ts` handles both.

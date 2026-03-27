import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FredSeriesData, parseFredResponse } from '../types/fred/series';
import { buildFredUrl } from '../config/fred';

interface FredContextType {
  data: Record<string, FredSeriesData>;
  loading: boolean;
  error: string | null;
}

const FredContext = createContext<FredContextType | undefined>(undefined);

// Series to fetch on mount, grouped by priority
const INITIAL_SERIES = [
  // Rates (most important for a buyer)
  'MORTGAGE30US',
  'FEDFUNDS',
  // Charleston local
  'ACTLISCOU45019',
  'MEDDAYONMAR16700',
  'ATNHPIUS16700Q',
  'TOTLISCOU45019',
  'BPPRIV045019',
  // National indices
  'CSUSHPISA',
  // Macro
  'CPIAUCSL',
  'UMCSENT',
  'UNRATE',
  'PERMIT',
  'A191RL1Q225SBEA',
];

export function FredProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, FredSeriesData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = useCallback(async (seriesId: string, observationStart?: string): Promise<FredSeriesData | null> => {
    try {
      const url = buildFredUrl(seriesId, observationStart);
      console.log(`[FRED] Fetching ${seriesId}...`);
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        console.error(`[FRED] ${seriesId} failed with ${response.status}:`, text.slice(0, 200));
        if (response.status === 429) {
          // Rate limited — wait and retry once
          await new Promise(resolve => setTimeout(resolve, 3000));
          const retryResponse = await fetch(url);
          if (!retryResponse.ok) return null;
          const retryData = await retryResponse.json();
          return parseFredResponse(seriesId, retryData);
        }
        return null;
      }

      const apiData = await response.json();
      console.log(`[FRED] ${seriesId} OK — ${apiData.observations?.length ?? 0} observations`);
      return parseFredResponse(seriesId, apiData);
    } catch (err) {
      console.error(`[FRED] ${seriesId} fetch error:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const newData: Record<string, FredSeriesData> = {};
        let hasData = false;

        // Fetch in batches of 4 to avoid rate limiting
        const batchSize = 4;
        for (let i = 0; i < INITIAL_SERIES.length; i += batchSize) {
          const batch = INITIAL_SERIES.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(id => fetchSeries(id, '2000-01-01'))
          );

          results.forEach(result => {
            if (result) {
              newData[result.seriesId] = result;
              hasData = true;
            }
          });

          // Small delay between batches
          if (i + batchSize < INITIAL_SERIES.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!hasData) {
          setError('Failed to fetch FRED data. Check your API key in .env');
        }

        setData(newData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch FRED data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [fetchSeries]);

  return (
    <FredContext.Provider value={{ data, loading, error }}>
      {children}
    </FredContext.Provider>
  );
}

export function useFredData() {
  const context = useContext(FredContext);
  if (!context) {
    throw new Error('useFredData must be used within FredProvider');
  }
  return context;
}

export interface FredObservation {
  date: string;
  value: number;
}

export interface FredSeriesData {
  seriesId: string;
  observations: FredObservation[];
}

interface FredApiObservation {
  date: string;
  value: string;
}

interface FredApiResponse {
  observations: FredApiObservation[];
}

export function parseFredResponse(seriesId: string, raw: FredApiResponse): FredSeriesData {
  const observations = raw.observations
    .filter(obs => obs.value !== '.')
    .map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }))
    .filter(obs => !isNaN(obs.value))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { seriesId, observations };
}

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  HousingVacancyAndOwnershipSeries,
  parseHousingVacancyAndOwnershipData
} from '../types/census/economicIndicators/housingVacancyAndOwnership';
import {
  ResidentialConstructionSeries,
  parseResidentialConstructionData
} from '../types/census/economicIndicators/residentialConstruction';
import {
  ResidentialSalesSeries,
  parseResidentialSalesData
} from '../types/census/economicIndicators/residentialSales';

interface CensusData {
  economicIndicators: {
    housingVacancyAndOwnership: HousingVacancyAndOwnershipSeries | null;
    residentialConstruction: ResidentialConstructionSeries | null;
    residentialSales: ResidentialSalesSeries | null;
  };
}

interface CensusContextType {
  data: CensusData;
  loading: boolean;
  error: string | null;
  fetchEconomicIndicatorsHousingVacancyAndOwnershipData: () => Promise<void>;
  fetchEconomicIndicatorsResidentialConstructionData: () => Promise<void>;
  fetchEconomicIndicatorsResidentialSalesData: () => Promise<void>;
}

const CensusContext = createContext<CensusContextType | undefined>(undefined);

export function CensusProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CensusData>({
    economicIndicators: {
      housingVacancyAndOwnership: null,
      residentialConstruction: null,
      residentialSales: null
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEconomicIndicatorsHousingVacancyAndOwnershipData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://api.census.gov/data/timeseries/eits/hv?get=time_slot_id,program_code,data_type_code,seasonally_adj,cell_value,geo_level_code&time=from+2000&category_code=RATE&error_data=no'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch housing vacancy and ownership data');
      }

      const apiData = await response.json();
      const housingVacancyAndOwnershipSeries = parseHousingVacancyAndOwnershipData(apiData);

      setData(prev => ({
        ...prev,
        economicIndicators: {
          ...prev.economicIndicators,
          housingVacancyAndOwnership: housingVacancyAndOwnershipSeries
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEconomicIndicatorsResidentialConstructionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://api.census.gov/data/timeseries/eits/resconst?get=time_slot_id,program_code,data_type_code,cell_value,geo_level_code,error_data&time=from+2000&error_data=no&seasonally_adj=no&category_code=STARTS&category_code=COMPLETIONS'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch residential construction data');
      }

      const apiData = await response.json();
      const residentialConstructionSeries = parseResidentialConstructionData(apiData);

      setData(prev => ({
        ...prev,
        economicIndicators: {
          ...prev.economicIndicators,
          residentialConstruction: residentialConstructionSeries
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEconomicIndicatorsResidentialSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://api.census.gov/data/timeseries/eits/ressales?get=time_slot_id,program_code,cell_value,geo_level_code&time=from+2000&error_data=no&seasonally_adj=no&category_code=FORSALE&category_code=SOLD&data_type_code=MMTHS&data_type_code=MONSUP&data_type_code=MEDIAN&data_type_code=AVERAG&data_type_code=TOTAL'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch residential sales data');
      }

      const apiData = await response.json();
      const residentialSalesSeries = parseResidentialSalesData(apiData);

      setData(prev => ({
        ...prev,
        economicIndicators: {
          ...prev.economicIndicators,
          residentialSales: residentialSalesSeries
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CensusContext.Provider value={{
      data,
      loading,
      error,
      fetchEconomicIndicatorsHousingVacancyAndOwnershipData,
      fetchEconomicIndicatorsResidentialConstructionData,
      fetchEconomicIndicatorsResidentialSalesData
    }}>
      {children}
    </CensusContext.Provider>
  );
}

export function useCensusData() {
  const context = useContext(CensusContext);
  if (!context) {
    throw new Error('useCensusData must be used within CensusProvider');
  }
  return context;
}
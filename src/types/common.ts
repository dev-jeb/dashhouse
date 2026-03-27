export interface ChartDataset {
  label: string;
  data: number[];
  regionCode?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

import { BubbleDataPoint, ChartDataset, ChartType, Point } from "chart.js";

// Тип для данных, которые могут быть в datasets
export type ChartDataPointType = number | string | Point | BubbleDataPoint | [number, number] | null;

// Тип для данных графика, который можно использовать во всем приложении
// export type ChartDataType = ChartData<ChartType>;
export type ChartDataType = {
  labels: string[];
  datasets: ChartDataset<ChartType, ChartDataPointType[]>[];
};

// Тип для набора данных
export interface DatasetType {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  yAxisID?: string;
  type?: string;
  // Другие свойства, которые могут быть у набора данных
}

// Тип для обработанных данных из таблицы
export interface ProcessedSpreadsheetData {
  labels: string[];
  datasets: DatasetType[];
}

import { ReactNode } from "react";

// Enum для типов графиков
export enum ChartTypeEnum {
  LINE = 'line',
  BAR = 'bar',
  RADAR = 'radar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  POLAR_AREA = 'polarArea',
  BUBBLE = 'bubble',
  SCATTER = 'scatter'
}

// Enum для наборов данных
export enum DatasetEnum {
  SALES = 'sales',
  USERS = 'users',
  PERFORMANCE = 'performance',
  REVENUE = 'revenue',
  DEMOGRAPHICS = 'demographics',
  COMPARISON = 'comparison',
  TIME_DATA = 'timeData'
}

// Enum для позиций легенды
export enum LegendPositionEnum {
  TOP = 'top',
  LEFT = 'left',
  BOTTOM = 'bottom',
  RIGHT = 'right'
}

// Тип для элементов массива типов графиков
export interface ChartTypeItem {
  id: ChartTypeEnum;
  label: string;
}

export interface TabItem {
  key: string;
  label: string;
  children: ReactNode;
}

export interface ChartJSComponentProps {
  fontSize?: number;
  fontFamily?: string;
};


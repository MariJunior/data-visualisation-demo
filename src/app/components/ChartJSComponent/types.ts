import { ChartDataType } from "@/app/types/chart";
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

// Enum для типов действий
export enum ChartActionTypes {
  SET_DATASET = 'SET_DATASET',
  SET_CHART_TYPE = 'SET_CHART_TYPE',
  SET_COMPATIBLE_TYPES = 'SET_COMPATIBLE_TYPES',
  SET_COLOR_SCHEME = 'SET_COLOR_SCHEME',
  TOGGLE_LEGEND = 'TOGGLE_LEGEND',
  SET_LEGEND_POSITION = 'SET_LEGEND_POSITION',
  SET_LEGEND_COLOR = 'SET_LEGEND_COLOR',
  SET_BORDER_WIDTH = 'SET_BORDER_WIDTH',
  SET_TENSION = 'SET_TENSION',
  SET_ASPECT_RATIO = 'SET_ASPECT_RATIO',
  TOGGLE_TITLE = 'TOGGLE_TITLE',
  SET_TITLE = 'SET_TITLE',
  SET_TITLE_COLOR = 'SET_TITLE_COLOR',
  TOGGLE_SUBTITLE = 'TOGGLE_SUBTITLE',
  SET_SUBTITLE = 'SET_SUBTITLE',
  SET_SUBTITLE_COLOR = 'SET_SUBTITLE_COLOR',
  SET_ANIMATION_DURATION = 'SET_ANIMATION_DURATION',
  SET_ANIMATION_TYPE = 'SET_ANIMATION_TYPE',
  SET_ANIMATION_DELAY = 'SET_ANIMATION_DELAY',
  SET_ANIMATION_PLAYING = 'SET_ANIMATION_PLAYING',
  UPDATE_CHART_OPTIONS = 'UPDATE_CHART_OPTIONS'
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
  customData?: ChartDataType | null; // Добавляем поддержку пользовательских данных
};


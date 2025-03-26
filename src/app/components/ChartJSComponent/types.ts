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

export enum PointStyleEnum {
  CIRCLE = "circle",
  CROSS = "cross",
  CROSS_ROT = "crossRot",
  DASH = "dash",
  LINE = "line",
  RECT = "rect",
  RECT_ROUNDED = "rectRounded",
  RECT_ROT = "rectRot",
  STAR = "star",
  TRIANGLE = "triangle"
}

export enum LineStyleEnum {
  SOLID = "solid",
  DASHED = "dashed",
  DOTTED = "dotted"
}

export enum TooltipModeEnum {
  INDEX = "index",
  POINT = "point",
  NEAREST = "nearest",
  DATASET = "dataset",
  X = "x",
  Y = "y"
}

export const easingOptions = [
  'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
  'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
  'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
  'easeInQuint', 'easeOutQuint', 'easeInOutQuint',
  'easeInSine', 'easeOutSine', 'easeInOutSine',
  'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
  'easeInCirc', 'easeOutCirc', 'easeInOutCirc',
  'easeInElastic', 'easeOutElastic', 'easeInOutElastic',
  'easeInBack', 'easeOutBack', 'easeInOutBack',
  'easeInBounce', 'easeOutBounce', 'easeInOutBounce',
] as const;

export type EasingFunction = (typeof easingOptions)[number];

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

export interface ChartConfig {
  title: {
    text: string;
    color: string;
    display: boolean;
  };
  subtitle: {
    text: string;
    color: string;
    display: boolean;
  };
  legend: {
    display: boolean;
    position: LegendPositionEnum;
    color: string;
    useHtmlLegend: boolean;
  };
  tooltip: {
    enabled: boolean;
    backgroundColor: string;
    borderColor: string;
    mode: TooltipModeEnum;
    intersect: boolean;
    padding: number;
  };
  point: {
    style: PointStyleEnum;
    radius: number;
    hoverRadius: number;
    borderWidth: number;
    backgroundColor: string;
    borderColor: string;
  };
  line: {
    style: LineStyleEnum;
    tension: number;
    borderWidth: number;
    borderColor: string;
    fill: boolean;
    segment: {
      enabled: boolean;
      borderColor: string;
      borderWidth: number;
    };
  };
  animation: {
    duration: number;
    type: EasingFunction;
    delay: number;
  };
  appearance: {
    borderWidth: number;
    aspectRatio: number;
    colorScheme: string;
    useCustomColors: boolean;
  };
  plugins: {
    zoom: {
      enabled: boolean;
      mode: string;
      sensitivity: number;
    };
    dragData: {
      enabled: boolean;
      round: number;
    };
    crosshair: {
      enabled: boolean;
      color: string;
      width: number;
    };
    outlabels: {
      enabled: boolean;
      text: string;
      color: string;
      backgroundColor: string;
    };
  };
}

export interface ColorScheme {
  id: string;
  name: string;
  colors: string[];
}

export interface DragDataOptions {
  round: boolean;
  showTooltip: boolean;
  onDragStart: (e: MouseEvent, datasetIndex: number, index: number, value: number) => void;
  onDrag: (e: MouseEvent, datasetIndex: number, index: number, value: number) => void;
  onDragEnd: (e: MouseEvent, datasetIndex: number, index: number, value: number) => void;
}
import { ChartOptions, ChartType, Color, EasingFunction } from "chart.js";
import { defaultOptions } from "./constants";
import { ChartActionTypes, ChartTypeEnum, DatasetEnum, LegendPositionEnum } from "./types";

// Структура состояния, организованная в логические группы
export interface ChartState {
  // Настройки данных и типа графика
  dataConfig: {
    selectedDataset: DatasetEnum;
    selectedChartType: ChartTypeEnum;
    compatibleChartTypes: ChartTypeEnum[];
  };
  
  // Настройки внешнего вида
  appearance: {
    colorScheme: string;
    showLegend: boolean;
    legendPosition: LegendPositionEnum;
    legendColor: Color;
    borderWidth: number;
    tension: number;
    aspectRatio: number;
  };
  
  // Настройки заголовков
  titleConfig: {
    showTitle: boolean;
    chartTitle: string;
    titleColor: Color;
    showSubtitle: boolean;
    subtitle: string;
    subtitleColor: Color;
  };
  
  // Настройки анимации
  animation: {
    animationDuration: number;
    animationType: EasingFunction;
    animationDelay: number;
    animationPlaying: string;
  };
  
  // Результирующие опции графика
  chartOptions: ChartOptions<ChartType>;
}

// Типы действий для обновления состояния
export type ChartAction =
  | { type: ChartActionTypes.SET_DATASET; payload: DatasetEnum }
  | { type: ChartActionTypes.SET_CHART_TYPE; payload: ChartTypeEnum }
  | { type: ChartActionTypes.SET_COMPATIBLE_TYPES; payload: ChartTypeEnum[] } 
  | { type: ChartActionTypes.SET_COLOR_SCHEME; payload: string }
  | { type: ChartActionTypes.TOGGLE_LEGEND; payload: boolean }
  | { type: ChartActionTypes.SET_LEGEND_POSITION; payload: LegendPositionEnum }
  | { type: ChartActionTypes.SET_LEGEND_COLOR; payload: Color }
  | { type: ChartActionTypes.SET_BORDER_WIDTH; payload: number }
  | { type: ChartActionTypes.SET_TENSION; payload: number }
  | { type: ChartActionTypes.SET_ASPECT_RATIO; payload: number }
  | { type: ChartActionTypes.TOGGLE_TITLE; payload: boolean }
  | { type: ChartActionTypes.SET_TITLE; payload: string }
  | { type: ChartActionTypes.SET_TITLE_COLOR; payload: Color }
  | { type: ChartActionTypes.TOGGLE_SUBTITLE; payload: boolean }
  | { type: ChartActionTypes.SET_SUBTITLE; payload: string }
  | { type: ChartActionTypes.SET_SUBTITLE_COLOR; payload: Color }
  | { type: ChartActionTypes.SET_ANIMATION_DURATION; payload: number }
  | { type: ChartActionTypes.SET_ANIMATION_TYPE; payload: EasingFunction }
  | { type: ChartActionTypes.SET_ANIMATION_DELAY; payload: number }
  | { type: ChartActionTypes.SET_ANIMATION_PLAYING; payload: string }
  | { type: ChartActionTypes.UPDATE_CHART_OPTIONS; payload: ChartOptions<ChartType> };

// Начальное состояние
export const initialChartState: ChartState = {
  dataConfig: {
    selectedDataset: DatasetEnum.SALES,
    selectedChartType: ChartTypeEnum.LINE,
    compatibleChartTypes: [],
  },
  appearance: {
    colorScheme: "default",
    showLegend: true,
    legendPosition: LegendPositionEnum.TOP,
    legendColor: "#000000",
    borderWidth: 1,
    tension: 0.4,
    aspectRatio: 2,
  },
  titleConfig: {
    showTitle: true,
    chartTitle: "Chart.js Demo",
    titleColor: "#000000",
    showSubtitle: false,
    subtitle: "Chart Subtitle",
    subtitleColor: "#666666",
  },
  animation: {
    animationDuration: 1000,
    animationType: "easeInOutQuad",
    animationDelay: 0,
    animationPlaying: "once",
  },
  chartOptions: defaultOptions,
};

// Reducer функция для обработки действий
export function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case 'SET_DATASET':
      return {
        ...state,
        dataConfig: {
          ...state.dataConfig,
          selectedDataset: action.payload,
        },
      };
    
    case 'SET_CHART_TYPE':
      return {
        ...state,
        dataConfig: {
          ...state.dataConfig,
          selectedChartType: action.payload,
        },
      };
    
    case 'SET_COMPATIBLE_TYPES':
      return {
        ...state,
        dataConfig: {
          ...state.dataConfig,
          compatibleChartTypes: action.payload,
        },
      };
    
    case 'SET_COLOR_SCHEME':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          colorScheme: action.payload,
        },
      };
    
    case 'TOGGLE_LEGEND':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          showLegend: action.payload,
        },
      };
    
    case 'SET_LEGEND_POSITION':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          legendPosition: action.payload,
        },
      };
    
    case 'SET_LEGEND_COLOR':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          legendColor: action.payload,
        },
      };
    
    case 'SET_BORDER_WIDTH':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          borderWidth: action.payload,
        },
      };
    
    case 'SET_TENSION':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          tension: action.payload,
        },
      };
    
    case 'SET_ASPECT_RATIO':
      return {
        ...state,
        appearance: {
          ...state.appearance,
          aspectRatio: action.payload,
        },
      };
    
    case 'TOGGLE_TITLE':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          showTitle: action.payload,
        },
      };
    
    case 'SET_TITLE':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          chartTitle: action.payload,
        },
      };
    
    case 'SET_TITLE_COLOR':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          titleColor: action.payload,
        },
      };
    
    case 'TOGGLE_SUBTITLE':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          showSubtitle: action.payload,
        },
      };
    
    case 'SET_SUBTITLE':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          subtitle: action.payload,
        },
      };
    
    case 'SET_SUBTITLE_COLOR':
      return {
        ...state,
        titleConfig: {
          ...state.titleConfig,
          subtitleColor: action.payload,
        },
      };
    
    case 'SET_ANIMATION_DURATION':
      return {
        ...state,
        animation: {
          ...state.animation,
          animationDuration: action.payload,
        },
      };
    
    case 'SET_ANIMATION_TYPE':
      return {
        ...state,
        animation: {
          ...state.animation,
          animationType: action.payload,
        },
      };
    
    case 'SET_ANIMATION_DELAY':
      return {
        ...state,
        animation: {
          ...state.animation,
          animationDelay: action.payload,
        },
      };
    
    case 'SET_ANIMATION_PLAYING':
      return {
        ...state,
        animation: {
          ...state.animation,
          animationPlaying: action.payload,
        },
      };
    
    case 'UPDATE_CHART_OPTIONS':
      return {
        ...state,
        chartOptions: action.payload,
      };
    
    default:
      return state;
  }
}

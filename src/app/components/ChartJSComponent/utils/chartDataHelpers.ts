import { ChartDataType } from "@/app/types/chart";
import { ChartDataset, ChartType, RadarControllerDatasetOptions } from "chart.js";
import { mockDatasets } from "../datasets";
import { ChartTypeEnum, DatasetEnum } from "../types";

/**
 * Получает данные для графика в зависимости от выбранного типа и датасета
 * @param selectedDataset - Выбранный датасет
 * @param selectedChartType - Выбранный тип графика
 * @param customData - Пользовательские данные (если есть)
 * @returns Данные для графика
 */
export const getChartData = (
  selectedDataset: DatasetEnum,
  selectedChartType: ChartTypeEnum,
  customData: ChartDataType | null
): ChartDataType => {
  // Если есть пользовательские данные, используем их
  if (customData && customData.labels && customData.datasets) {
    return {
      labels: Array.isArray(customData.labels) ? [...customData.labels] : [],
      datasets: Array.isArray(customData.datasets)
        ? customData.datasets.map(dataset => ({
            label: dataset.label || "",
            data: Array.isArray(dataset.data) ? [...dataset.data] : []
          }))
        : []
    };
  }

  // Иначе используем моковые данные в зависимости от типа графика
  if (selectedChartType === ChartTypeEnum.BUBBLE) {
    return cloneDataset(mockDatasets.bubbleData as ChartDataType);
  } else if (selectedChartType === ChartTypeEnum.SCATTER) {
    return cloneDataset(mockDatasets.scatterData as ChartDataType);
  } else if (selectedDataset === DatasetEnum.DEMOGRAPHICS) {
    return cloneDataset(mockDatasets.demographics as ChartDataType);
  } else if (selectedDataset === DatasetEnum.PERFORMANCE) {
    return cloneDataset(mockDatasets.performance as ChartDataType);
  } else if (selectedDataset === DatasetEnum.TIME_DATA) {
    return cloneDataset(mockDatasets.timeData as ChartDataType);
  } else {
    return cloneDataset(mockDatasets[selectedDataset] as ChartDataType);
  }
};

/**
 * Создает глубокую копию датасета
 * @param sourceData - Исходные данные
 * @returns Копия данных
 */
const cloneDataset = (sourceData: ChartDataType): ChartDataType => {
  if (!sourceData || !Array.isArray(sourceData.labels) || !Array.isArray(sourceData.datasets)) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: [...sourceData.labels],
    datasets: sourceData.datasets.map(dataset => ({
      label: dataset.label,
      data: [...dataset.data]
    }))
  };
};

/**
 * Применяет цветовую схему к датасетам графика
 * @param datasets - Датасеты графика
 * @param chartType - Тип графика
 * @param schemeColors - Цвета из выбранной схемы
 * @param borderWidth - Ширина границы
 * @returns Обновленные датасеты с примененными цветами
 */
export const applyColorScheme = (
  datasets: ChartDataset<ChartType, unknown[]>[],
  chartType: ChartTypeEnum,
  schemeColors: string[],
  borderWidth: number
): ChartDataset<ChartType, unknown[]>[] => {
  return datasets.map((dataset, index) => {
    const color = schemeColors[index % schemeColors.length];
    const newDataset = { ...dataset };

    if (chartType === ChartTypeEnum.LINE) {
      Object.assign(newDataset, {
        borderColor: color,
        backgroundColor: color + "33",
        fill: false,
        borderWidth: borderWidth
      });
    } else if (chartType === ChartTypeEnum.BAR) {
      Object.assign(newDataset, {
        backgroundColor: color,
        borderColor: color,
        borderWidth: borderWidth
      });
    } else if (chartType === ChartTypeEnum.PIE || chartType === ChartTypeEnum.DOUGHNUT) {
      Object.assign(newDataset, {
        backgroundColor: schemeColors,
        borderWidth: borderWidth
      });
    } else if (chartType === ChartTypeEnum.RADAR) {
      // Для радарных графиков каждый датасет должен иметь ОДИН цвет
      const radarDataset = newDataset as ChartDataset<"radar", number[]> & RadarControllerDatasetOptions;

      Object.assign(radarDataset, {
        type: "radar",
        fill: true,
        backgroundColor: color + "33",
        borderColor: color,
        borderWidth: borderWidth,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: color,
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0,
        spanGaps: false,
      });
    } else if (chartType === ChartTypeEnum.POLAR_AREA) {
      Object.assign(newDataset, {
        backgroundColor: schemeColors.map(c => c + "77"),
        borderColor: schemeColors,
        borderWidth: borderWidth
      });
    } else {
      Object.assign(newDataset, {
        backgroundColor: color,
        borderColor: color,
        borderWidth: borderWidth
      });
    }

    return newDataset;
  });
};

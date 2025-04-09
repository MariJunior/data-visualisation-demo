import { JsonPathInfo } from "@/app/components/DataUploader/types";
import { ChartDataPointType, ChartDataType } from "@/app/types/chart";
import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { ChartDataset, ChartType } from "chart.js";
import { useState } from "react";

/**
 * Хук для работы с JSON данными
 * Обрабатывает JSON, анализирует его структуру и создает данные для графика
 */
export const useJsonData = () => {
  const [jsonText, setJsonText] = useState("");
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);
  const [jsonPathsInfo, setJsonPathsInfo] = useState<JsonPathInfo[]>([]);
  const [selectedJsonPaths, setSelectedJsonPaths] = useState<string[]>([]);

  /**
   * Проверяет структуру данных на соответствие формату ChartDataType
   */
  const validateChartData = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return false;

    const chartData = data as Partial<ChartDataType>;

    if (!Array.isArray(chartData.labels)) return false;
    if (!Array.isArray(chartData.datasets)) return false;
    if (chartData.datasets.length === 0) return false;
    
    // Проверка каждого датасета
    for (const dataset of chartData.datasets) {
      if (!dataset.label || !Array.isArray(dataset.data)) return false;
    }
    
    return true;
  };

  /**
   * Получает все пути в JSON объекте
   */
  const getJsonPaths = (obj: Record<string, unknown>, prefix = ''): string[] => {
    let paths: string[] = [];
    
    for (const key in obj) {
      const newPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Рекурсивно обходим вложенные объекты
        paths = [...paths, ...getJsonPaths(obj[key] as Record<string, unknown>, newPath)];
      } else if (Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] !== 'object') {
        // Добавляем путь для массивов примитивных значений
        paths.push(newPath);
      } else if (typeof obj[key] !== 'object') {
        // Добавляем путь для примитивных значений
        paths.push(newPath);
      }
    }
    
    return paths;
  };

  /**
   * Получает значение по пути в объекте
   */
  const getValueByPath = (obj: Record<string, unknown>, path: string): unknown => {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part] as Record<string, unknown>;
    }
    
    return current;
  };

  /**
   * Анализирует структуру JSON и находит общие пути
   */
  const analyzeJsonStructure = (data: unknown): JsonPathInfo[] => {
    // Если это не массив объектов, просто возвращаем пути как раньше
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
      // Старая логика получения всех путей
      return getJsonPaths(data as Record<string, unknown>).map(path => ({
        path,
        isArray: false,
        isNumeric: false,
        commonAcrossAll: true,
        sampleValue: String(getValueByPath(data as Record<string, unknown>, path)).substring(0, 20)
      }));
    }

    // Если это массив объектов, находим общие свойства
    const allObjects = data as Record<string, unknown>[];
    const allPaths = new Set<string>();
    const pathsCount = new Map<string, number>();
    
    // Собираем все пути из всех объектов
    allObjects.forEach(obj => {
      const objPaths = getJsonPaths(obj);
      objPaths.forEach(path => {
        allPaths.add(path);
        pathsCount.set(path, (pathsCount.get(path) || 0) + 1);
      });
    });
    
    // Анализируем каждый путь
    const result: JsonPathInfo[] = [];
    allPaths.forEach(path => {
      const count = pathsCount.get(path) || 0;
      const isCommon = count === allObjects.length;
      
      // Получаем значение из первого объекта для примера
      const firstValue = getValueByPath(allObjects[0], path);
      const isArray = Array.isArray(firstValue);
      const isNumeric = typeof firstValue === 'number';
      
      result.push({
        path,
        isArray,
        isNumeric,
        commonAcrossAll: isCommon,
        sampleValue: String(firstValue).substring(0, 20) + (String(firstValue).length > 20 ? '...' : '')
      });
    });
    
    // Сортируем: сначала общие свойства, затем по алфавиту
    result.sort((a, b) => {
      if (a.commonAcrossAll !== b.commonAcrossAll) {
        return a.commonAcrossAll ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });
    
    return result;
  };

  /**
   * Создает данные для графика из выбранных JSON путей
   */
  const createChartDataFromJsonPaths = (): ChartDataType | null => {
    if (!jsonData || selectedJsonPaths.length === 0) return null;
    
    // Получаем значение первого выбранного пути
    const rawLabels = getValueByPath(jsonData, selectedJsonPaths[0]);
    let labels: string[];
  
    // Преобразуем значение в массив, если оно не является массивом
    if (!Array.isArray(rawLabels)) {
      // Если это JSON-массив объектов, создадим метки из индексов
      if (Array.isArray(jsonData)) {
        labels = Array.from({ length: jsonData.length }, (_, i) => i.toString());
      } else {
        // Если это одиночное значение, создадим массив с одним элементом
        labels = [String(rawLabels)];
      }
    } else {
      labels = rawLabels.map(String);
    }
    
    // Остальные пути используем как наборы данных
    const datasets: ChartDataset<ChartType, ChartDataPointType[]>[] = [];
    
    for (let i = 1; i < selectedJsonPaths.length; i++) {
      const path = selectedJsonPaths[i];
      let data = getValueByPath(jsonData, path);
    
      // Преобразуем данные в массив, если они не являются массивом
      if (!Array.isArray(data)) {
        if (Array.isArray(jsonData)) {
          // Собираем данные по этому пути из всех объектов массива
          data = jsonData.map(item => {
            const parts = path.split('.');
            let value = item;
            for (const part of parts) {
              if (value && typeof value === 'object' && part in value) {
                value = value[part];
              } else {
                return null;
              }
            }
            return value;
          });
        } else {
          data = [data];
        }
      }
      
      datasets.push({
        label: path,
        data: data as ChartDataPointType[],
        backgroundColor: generateRandomColor(),
        borderColor: generateRandomColor(),
      });
    }
    
    if (datasets.length === 0) {
      return null;
    }
    
    const chartData: ChartDataType = {
      labels,
      datasets
    };
    
    if (validateChartData(chartData)) {
      return chartData;
    }
    
    return null;
  };

  /**
   * Обрабатывает JSON из текстового поля или файла
   */
  const processJsonData = (jsonContent: string | Record<string, unknown>): {
    parsedData: Record<string, unknown> | null;
    pathsInfo: JsonPathInfo[];
    defaultSelected: string[];
    isValidChartData: boolean;
  } => {
    let parsedData: Record<string, unknown>;
    
    // Если передана строка, парсим её
    if (typeof jsonContent === 'string') {
      try {
        parsedData = JSON.parse(jsonContent);
      } catch (e) {
        throw new Error(`Ошибка парсинга JSON: ${(e as Error).message}`);
      }
    } else {
      parsedData = jsonContent;
    }
    
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error("JSON должен быть объектом");
    }
    
    // Анализируем структуру JSON
    const pathsInfo = analyzeJsonStructure(parsedData);
    
    // Получаем список путей
    const paths = pathsInfo.map(info => info.path);
    
    // По умолчанию выбираем первые несколько путей (если они есть)
    const defaultSelected = paths.filter(path => {
      const info = pathsInfo.find(i => i.path === path);
      return info && info.commonAcrossAll && info.isNumeric;
    }).slice(0, Math.min(5, paths.length));
    
    // Проверяем, соответствует ли JSON формату для Chart.js
    const isValidChartData = validateChartData(parsedData);
    
    return {
      parsedData,
      pathsInfo,
      defaultSelected: defaultSelected.length > 0 ? defaultSelected : paths.slice(0, Math.min(5, paths.length)),
      isValidChartData
    };
  };

  return {
    jsonText,
    setJsonText,
    jsonData,
    setJsonData,
    jsonPaths,
    setJsonPaths,
    jsonPathsInfo,
    setJsonPathsInfo,
    selectedJsonPaths,
    setSelectedJsonPaths,
    validateChartData,
    getValueByPath,
    createChartDataFromJsonPaths,
    processJsonData
  };
};

import { ChartDataPointType, ChartDataType } from "@/app/types/chart";
import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { CheckCircleOutlined, ExclamationCircleOutlined, FileExcelOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, message, Select, Space, Tabs, Tag, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import { ChartDataset, ChartType } from "chart.js";
import { FC, useState } from "react";
import * as XLSX from "xlsx";

const { TextArea } = Input;
const { Option } = Select;
const { useMessage } = message;

// Константа для максимального размера файла (например, 15 МБ)
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 МБ в байтах

interface FileInfoDisplayProps {
  uploadedFile: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null
}

const FileInfoDisplay: FC<FileInfoDisplayProps> = ({ uploadedFile }) => {
  if (!uploadedFile) return null;
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const fileDate = new Date(uploadedFile.lastModified).toLocaleString();
  
  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h4 className="font-medium text-blue-700 dark:text-blue-300">Загруженный файл:</h4>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div className="text-gray-600 dark:text-gray-300">Имя файла:</div>
        <div className="font-medium">{uploadedFile.name}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Размер:</div>
        <div>{formatFileSize(uploadedFile.size)}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Тип:</div>
        <div>{uploadedFile.type || 'Неизвестный'}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Дата изменения:</div>
        <div>{fileDate}</div>
      </div>
    </div>
  );
};

interface JsonPathInfo {
  path: string;
  isArray: boolean;
  isNumeric: boolean;
  commonAcrossAll: boolean;
  sampleValue: string;
}

interface DataUploaderProps {
  onDataLoaded: (data: ChartDataType | null) => void;
}

export const DataUploader: FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null>(null);

  // Состояния для работы с Excel/CSV
  const [excelWorkbook, setExcelWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<unknown[][]>([]);
  
  // Состояния для работы с колонками (и для Excel, и для JSON)
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  
  // Состояние для хранения JSON данных
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);
  const [jsonPathsInfo, setJsonPathsInfo] = useState<JsonPathInfo[]>([]);
  const [selectedJsonPaths, setSelectedJsonPaths] = useState<string[]>([]);

  const [messageApi, contextHolder] = useMessage();

  const resetData = () => {
    setUploadedFile(null);
    setJsonText("");
    setExcelWorkbook(null);
    setAvailableSheets([]);
    setSelectedSheet("");
    setSheetData([]);
    setAvailableColumns([]);
    setSelectedColumns([]);
    setJsonData(null);
    setJsonPaths([]);
    setSelectedJsonPaths([]);
    onDataLoaded(null);
  };
  
  // Функция для проверки структуры данных
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

  // Функция для получения всех путей в JSON объекте
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

  // Функция для получения значения по пути в объекте
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

  // Функция для анализа структуры JSON и нахождения общих путей
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

  // Обработка JSON из текстового поля
  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      
      if (typeof parsedData === 'object' && parsedData !== null) {
        // Сохраняем исходные данные
        setJsonData(parsedData);
        
        // Анализируем структуру JSON
        const pathsInfo = analyzeJsonStructure(parsedData);
        setJsonPathsInfo(pathsInfo);
        
        // Получаем список путей (для обратной совместимости)
        const paths = pathsInfo.map(info => info.path);
        setJsonPaths(paths);
        
        // По умолчанию выбираем первые несколько путей (если они есть)
        const defaultSelected = paths.slice(0, Math.min(5, paths.length));
        setSelectedJsonPaths(defaultSelected);
        
        // Если JSON уже в формате для Chart.js, загружаем его напрямую
        if (validateChartData(parsedData)) {
          onDataLoaded(parsedData as ChartDataType);
          messageApi.success({
            content: "JSON данные успешно загружены",
            duration: 3,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          });
        } else {
          // Иначе показываем UI для выбора путей
          messageApi.info({
            content: "Выберите данные для отображения на графике",
            duration: 4
          });
        }
      } else {
        throw new Error("JSON должен быть объектом");
      }
    } catch (error) {
      messageApi.error({
        content: "Ошибка при парсинге JSON: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  // Создание данных для графика из выбранных JSON путей
  const createChartDataFromJsonPaths = () => {
    if (!jsonData || selectedJsonPaths.length === 0) return;
    
    try {
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
        throw new Error("Не удалось создать наборы данных из выбранных путей");
      }
      
      const chartData: ChartDataType = {
        labels,
        datasets
      };
      
      if (validateChartData(chartData)) {
        onDataLoaded(chartData);
        messageApi.success({
          content: "Данные успешно загружены",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
      } else {
        throw new Error("Не удалось создать корректные данные для графика");
      }
    } catch (error) {
      messageApi.error({
        content: "Ошибка при создании данных для графика: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  // Обработка загрузки JSON файла
  const handleJsonFileUpload = (file: RcFile) => {
    console.log("Начало загрузки JSON файла:", file.name, "размер:", file.size);

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      messageApi.error({
        content: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)} МБ`,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      return Upload.LIST_IGNORE; // Предотвращает загрузку
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log("Файл успешно прочитан");
        const content = e.target?.result as string;

        console.log("Попытка парсинга JSON содержимого");
        let parsedData;
        try {
          parsedData = JSON.parse(content);
          console.log("JSON успешно распарсен:", parsedData);
        } catch (parseError) {
          console.error("Ошибка парсинга JSON:", parseError);
          throw new Error(`Ошибка парсинга JSON: ${(parseError as Error).message}`);
        }
        
        // Сохраняем файл
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        
        // Сохраняем исходные JSON данные
        setJsonData(parsedData);
        
        // Анализируем структуру JSON
        console.log("Анализируем структуру JSON...");
        const pathsInfo = analyzeJsonStructure(parsedData);
        console.log("Найдено путей:", pathsInfo.length);
        setJsonPathsInfo(pathsInfo);
        
        // Получаем список путей (для обратной совместимости)
        const paths = pathsInfo.map(info => info.path);
        setJsonPaths(paths);
        
        // По умолчанию выбираем первые несколько путей (если они есть)
        const defaultSelected = paths.filter(path => {
          const info = pathsInfo.find(i => i.path === path);
          return info && info.commonAcrossAll && info.isNumeric;
        }).slice(0, Math.min(5, paths.length));
        
        setSelectedJsonPaths(defaultSelected.length > 0 ? defaultSelected : paths.slice(0, Math.min(5, paths.length)));
        
        // Если JSON уже в формате для Chart.js, загружаем его напрямую
        if (validateChartData(parsedData)) {
          console.log("JSON уже в формате для Chart.js");
          onDataLoaded(parsedData as ChartDataType);
          messageApi.success({
            content: "JSON файл успешно загружен",
            duration: 3,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          });
        } else {
          console.log("JSON требует дополнительной обработки");
          // Иначе показываем UI для выбора путей
          messageApi.info({
            content: "Выберите данные для отображения на графике",
            duration: 4
          });
        }
      } catch (error) {
        console.error("Ошибка при обработке файла:", error);
        messageApi.error({
          content: "Ошибка при парсинге JSON файла: " + (error as Error).message,
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = (e) => {
      console.error("Ошибка при чтении файла:", e);
      messageApi.error({
        content: "Ошибка при чтении файла",
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      setLoading(false);
    };
    
    reader.readAsText(file);
    return false; // Предотвращаем автоматическую загрузку файла
  };

  // Обработка загрузки Excel/CSV файла
  const handleSpreadsheetUpload = (file: RcFile) => {
    if (file.size > MAX_FILE_SIZE) {
      messageApi.error({
        content: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)} МБ`,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      return Upload.LIST_IGNORE;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Получаем список листов
        const sheetNames = workbook.SheetNames;
        setAvailableSheets(sheetNames);
        
        // По умолчанию выбираем первый лист
        const firstSheetName = sheetNames[0];
        setSelectedSheet(firstSheetName);
        
        // Получаем заголовки колонок из первого листа
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        
        // Преобразуем данные в формат, подходящий для Chart.js
        const processedData = processSpreadsheetData(jsonData);
        if (!validateChartData(processedData)) {
          messageApi.error({
            content: "Неверный формат данных для графика в Excel/CSV файле",
            duration: 5,
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          });
          setLoading(false);
          return;
        }
        onDataLoaded(processedData);

        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });

        // Сохраняем workbook для последующего использования
        setExcelWorkbook(workbook);
        
        // Сохраняем данные текущего листа
        setSheetData(jsonData);
        
        // Получаем заголовки колонок
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setAvailableColumns(headers);
          setSelectedColumns([...headers]); // По умолчанию выбираем все колонки
        }
        
        messageApi.success({
          content: "Таблица успешно загружена",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
      } catch (error) {
        messageApi.error({
          content: "Ошибка при обработке таблицы: " + (error as Error).message,
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      messageApi.error({
        content: "Ошибка при чтении файла",
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
    return false; // Предотвращаем автоматическую загрузку файла
  };

  // Обработчик изменения выбранного листа
  const handleSheetChange = (sheetName: string) => {
    if (!excelWorkbook) return;
    
    setSelectedSheet(sheetName);
    
    // Загружаем данные выбранного листа
    const worksheet = excelWorkbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
    
    setSheetData(jsonData);
    
    // Обновляем доступные колонки
    if (jsonData.length > 0) {
      const headers = jsonData[0] as string[];
      setAvailableColumns(headers);
      setSelectedColumns([...headers]); // По умолчанию выбираем все колонки
    } else {
      setAvailableColumns([]);
      setSelectedColumns([]);
    }
  };

  // Обработчик применения выбранных колонок для Excel/CSV
  const applySelectedExcelColumns = () => {
    if (!sheetData || sheetData.length < 2 || selectedColumns.length < 2) {
      messageApi.error({
        content: "Недостаточно данных или выбранных колонок",
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      return;
    }
    
    try {
      // Получаем индексы выбранных колонок
      const headers = sheetData[0] as string[];
      const selectedIndices = selectedColumns.map(col => headers.indexOf(col)).filter(idx => idx !== -1);
      
      // Создаем новый массив данных только с выбранными колонками
      const filteredData = sheetData.map(row => 
        selectedIndices.map(idx => row[idx])
      );
      
      // Преобразуем данные в формат для Chart.js
      const processedData = processSpreadsheetData(filteredData);
      if (!validateChartData(processedData)) {
        throw new Error("Не удалось создать корректные данные для графика");
      }
      
      onDataLoaded(processedData);
      
      messageApi.success({
        content: "Данные успешно обновлены",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      messageApi.error({
        content: "Ошибка при обработке выбранных колонок: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  // Преобразование данных из таблицы в формат для Chart.js
  const processSpreadsheetData = (data: unknown[][]): ChartDataType => {
    if (!data || data.length < 2) {
      throw new Error("Недостаточно данных в таблице");
    }

    const headers = data[0] as string[];
    const values = data.slice(1) as ChartDataPointType[][];

    // Предполагаем, что первый столбец - это метки (labels)
    const labels = values.map(row => String(row[0]));
    
    // Остальные столбцы - это наборы данных
    const datasets: ChartDataset<ChartType, ChartDataPointType[]>[] = [];
    
    for (let i = 1; i < headers.length; i++) {
      datasets.push({
        label: String(headers[i] || `Dataset ${i}`),
        data: values.map(row => row[i] || 0),
        backgroundColor: generateRandomColor(),
        borderColor: generateRandomColor(),
      });
    }

    return {
      labels,
      datasets
    };
  };

  // Рендеринг селектора листов и колонок для Excel/CSV
  const renderExcelSheetSelector = () => {
    if (!uploadedFile || !excelWorkbook || availableSheets.length === 0) return null;
    
    return (
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-medium text-blue-700 dark:text-blue-300">Настройка данных:</h4>
        
        <div className="mt-2">
          <div className="mb-2">Выберите лист:</div>
          <Select
            style={{ width: '100%' }}
            value={selectedSheet}
            onChange={handleSheetChange}
            className="mb-3"
          >
            {availableSheets.map(sheet => (
              <Option key={sheet} value={sheet}>{sheet}</Option>
            ))}
          </Select>
          
          <div className="mb-2">Выберите колонки для отображения:</div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            value={selectedColumns}
            onChange={setSelectedColumns}
            className="mb-3"
            placeholder="Выберите хотя бы 2 колонки"
          >
            {availableColumns.map(col => (
              <Option key={col} value={col}>{col}</Option>
            ))}
          </Select>
          
          <Button 
            type="primary" 
            onClick={applySelectedExcelColumns}
            disabled={selectedColumns.length < 2}
          >
            Применить выбор
          </Button>
        </div>
      </div>
    );
  };

  // Рендеринг селектора путей для JSON
  const renderJsonPathSelector = () => {
    if (!uploadedFile || !jsonPaths.length || !jsonPathsInfo.length) return null;
    
    return (
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-medium text-blue-700 dark:text-blue-300">Настройка данных:</h4>
        
        <div className="mt-2">
          <Divider orientation="left">Выберите свойства для отображения</Divider>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Первое выбранное свойство будет использовано как метки по оси X, остальные - как наборы данных.
            <br/>
            <span className="font-medium">Подсказка:</span> Выбирайте свойства, которые есть во всех объектах (помечены как „Общие“).
          </p>
          
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            value={selectedJsonPaths}
            onChange={setSelectedJsonPaths}
            className="mb-3"
            placeholder="Выберите хотя бы 2 свойства"
            optionFilterProp="children"
            optionLabelProp="label"
          >
            {jsonPathsInfo.map(info => (
              <Option 
                key={info.path} 
                value={info.path}
                label={info.path}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{info.path}</span>
                  <span className="text-xs">
                    {info.commonAcrossAll ? 
                      <Tag color="green">Общее</Tag> : 
                      <Tag color="orange">Частичное</Tag>
                    }
                    {info.isArray && <Tag color="blue">Массив</Tag>}
                    {info.isNumeric && <Tag color="purple">Число</Tag>}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Пример: {info.sampleValue}
                </div>
              </Option>
            ))}
          </Select>
          
          <Button 
            type="primary" 
            onClick={createChartDataFromJsonPaths}
            disabled={selectedJsonPaths.length < 2}
          >
            Применить выбор
          </Button>
        </div>
      </div>
    );
  };

  // Определяем элементы вкладок в новом формате
  const tabItems = [
    {
      key: "json-text",
      label: (
        <span>
          <FileTextOutlined /> JSON текст
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: "100%" }}>
          <TextArea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`Введите JSON в формате:
              {
                "labels": ["Январь", "Февраль", "Март"],
                "datasets": [
                  {
                    "label": "Продажи",
                    "data": [12, 19, 3]
                  }
                ]
              }`
            }
          />
          <Button 
            type="primary" 
            onClick={handleJsonSubmit}
            disabled={!jsonText.trim()}
            loading={loading}
          >
            Загрузить JSON
          </Button>

          {jsonData && jsonPaths.length > 0 && renderJsonPathSelector()}
        </Space>
      )
    },
    {
      key: "json-file",
      label: (
        <span>
          <UploadOutlined /> JSON файл
        </span>
      ),
      children: (
        <>
          <Upload.Dragger
            name="file"
            accept=".json"
            beforeUpload={handleJsonFileUpload}
            showUploadList={false}
            disabled={loading || !!uploadedFile}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Нажмите или перетащите JSON файл</p>
            <p className="ant-upload-hint">
              Поддерживаются только файлы в формате JSON
            </p>
          </Upload.Dragger>
          {uploadedFile && (
            <>
              <FileInfoDisplay uploadedFile={uploadedFile} />

              {jsonData && jsonPaths.length > 0 && renderJsonPathSelector()}

              <Button type="default" onClick={resetData} className="mt-2">
                Сбросить данные
              </Button>
            </>
          )}
        </>
      )
    },
    {
      key: "spreadsheet",
      label: (
        <span>
          <FileExcelOutlined /> Excel/CSV
        </span>
      ),
      children: (
        <>
          <Upload.Dragger
            name="file"
            accept=".xlsx,.xls,.csv"
            beforeUpload={handleSpreadsheetUpload}
            showUploadList={false}
            disabled={loading || !!uploadedFile}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined />
            </p>
            <p className="ant-upload-text">Нажмите или перетащите Excel или CSV файл</p>
            <p className="ant-upload-hint">
              Первая строка должна содержать заголовки, первый столбец - метки данных
            </p>
          </Upload.Dragger>
          {uploadedFile && (
            <>
              <FileInfoDisplay uploadedFile={uploadedFile} />

              {renderExcelSheetSelector()}

              <Button type="default" onClick={resetData} className="mt-2">
                Сбросить данные
              </Button>
            </>
          )}
        </>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <Card 
        title="Загрузка данных" 
        className="mb-6 shadow-md"
        style={{ borderRadius: "12px" }}
        >
        <Tabs defaultActiveKey="json-text" items={tabItems} />
      </Card>
    </>
  );
};

export default DataUploader;

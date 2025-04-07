import { ChartDataPointType, ChartDataType } from "@/app/types/chart";
import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { CheckCircleOutlined, ExclamationCircleOutlined, FileExcelOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Space, Tabs, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import { ChartDataset, ChartType } from "chart.js";
import { FC, useState } from "react";
import * as XLSX from "xlsx";

const { TextArea } = Input;
const { useMessage } = message;

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

  const [messageApi, contextHolder] = useMessage();

  const resetData = () => {
    setUploadedFile(null);
    setJsonText("");
    onDataLoaded(null); // Нужно модифицировать интерфейс, чтобы принимать null
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

  // Обработка JSON из текстового поля
  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonText) as ChartDataType;
      if (!validateChartData(parsedData)) {
        messageApi.error({
          content: "Неверный формат данных для графика в JSON данных",
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
        return;
      }
      onDataLoaded(parsedData);
      messageApi.success({
        content: "JSON данные успешно загружены",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      messageApi.error({
        content: "Ошибка при парсинге JSON: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  };

  // Обработка загрузки JSON файла
  const handleJsonFileUpload = (file: RcFile) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (!validateChartData(parsedData)) {
          messageApi.error({
            content: "Неверный формат данных для графика в JSON-файле",
            duration: 5,
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          });
          setLoading(false);
          return;
        }
        onDataLoaded(parsedData);
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        messageApi.success({
          content: "JSON файл успешно загружен",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
      } catch (error) {
        messageApi.error({
          content: "Ошибка при парсинге JSON файла: " + (error as Error).message,
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
    
    reader.readAsText(file);
    return false; // Предотвращаем автоматическую загрузку файла
  };

  // Обработка загрузки Excel/CSV файла
  const handleSpreadsheetUpload = (file: RcFile) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Берем первый лист
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Конвертируем в JSON
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
            disabled={loading}
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
            disabled={loading}
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

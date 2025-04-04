import { ChartDataPointType, ChartDataType } from "@/app/types/chart";
import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { FileExcelOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Space, Tabs, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import { ChartDataset, ChartType } from "chart.js";
import { FC, useState } from "react";
import * as XLSX from "xlsx";

const { TextArea } = Input;

interface DataUploaderProps {
  onDataLoaded: (data: ChartDataType) => void;
}

export const DataUploader: FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);

  // Обработка JSON из текстового поля
  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonText) as ChartDataType;
      onDataLoaded(parsedData);
      message.success("JSON данные успешно загружены");
    } catch (error) {
      message.error("Ошибка при парсинге JSON: " + (error as Error).message);
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
        onDataLoaded(parsedData);
        message.success("JSON файл успешно загружен");
      } catch (error) {
        message.error("Ошибка при парсинге JSON файла: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      message.error("Ошибка при чтении файла");
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
        onDataLoaded(processedData);
        
        message.success("Таблица успешно загружена");
      } catch (error) {
        message.error("Ошибка при обработке таблицы: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      message.error("Ошибка при чтении файла");
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
            rows={6}
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
      )
    }
  ];

  return (
    <Card 
      title="Загрузка данных" 
      className="mb-6 shadow-md"
      style={{ borderRadius: "12px" }}
    >
      <Tabs defaultActiveKey="json-text" items={tabItems} />
    </Card>
  );
};

export default DataUploader;

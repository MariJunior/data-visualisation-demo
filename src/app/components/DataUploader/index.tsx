import { ChartDataType } from "@/app/types/chart";
import { CheckCircleOutlined, ExclamationCircleOutlined, FileExcelOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Card, Tabs, message } from "antd";
import Upload, { RcFile } from "antd/es/upload";
import { FC, useCallback } from "react";
import { ExcelFileTab } from "./components/ExcelFileTab";
import { JsonFileTab } from "./components/JsonFileTab";
import { JsonTextTab } from "./components/JsonTextTab";
import { useExcelData } from "./hooks/useExcelData";
import { useFileUpload } from "./hooks/useFileUpload";
import { useJsonData } from "./hooks/useJsonData";
import { BeforeUploadResult, DataUploaderProps } from "./types";

/**
 * Компонент для загрузки данных в различных форматах
 */
export const DataUploader: FC<DataUploaderProps> = ({ onDataLoaded }) => {
  // Используем кастомные хуки
  const {
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
    createChartDataFromJsonPaths,
    processJsonData
  } = useJsonData();

  const {
    excelWorkbook,
    setExcelWorkbook,
    availableSheets,
    setAvailableSheets,
    selectedSheet,
    setSelectedSheet,
    setSheetData,
    availableColumns,
    setAvailableColumns,
    selectedColumns,
    setSelectedColumns,
    handleSheetChange,
    createChartDataFromSelectedColumns,
    processExcelFile
  } = useExcelData();

  const {
    uploadedFile,
    loading,
    setLoading,
    validateFileSize,
    saveFileInfo,
    resetFileData
  } = useFileUpload();

  const [messageApi, contextHolder] = message.useMessage();

  /**
   * Сбрасывает все данные
   */
  const resetData = useCallback(() => {
    resetFileData();
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
  }, [
    resetFileData, setJsonText, setExcelWorkbook, setAvailableSheets, 
    setSelectedSheet, setSheetData, setAvailableColumns, setSelectedColumns,
    setJsonData, setJsonPaths, setSelectedJsonPaths, onDataLoaded
  ]);

  /**
   * Обрабатывает JSON из текстового поля
   */
  const handleJsonSubmit = useCallback(() => {
    try {
      const { parsedData, pathsInfo, defaultSelected, isValidChartData } = processJsonData(jsonText);
      
      // Сохраняем исходные данные
      setJsonData(parsedData);
      
      // Сохраняем информацию о путях
      setJsonPathsInfo(pathsInfo);
      setJsonPaths(pathsInfo.map(info => info.path));
      setSelectedJsonPaths(defaultSelected);
      
      // Если JSON уже в формате для Chart.js, загружаем его напрямую
      if (isValidChartData) {
        onDataLoaded(parsedData as unknown as ChartDataType);
        messageApi.success({
          content: "JSON data loaded successfully",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
      } else {
        // Иначе показываем UI для выбора путей
        messageApi.info({
          content: "Select data to display on the chart",
          duration: 4
        });
      }
    } catch (error) {
      messageApi.error({
        content: "Error parsing JSON: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  }, [jsonText, processJsonData, setJsonData, setJsonPathsInfo, setJsonPaths, setSelectedJsonPaths, onDataLoaded, messageApi]);

  /**
   * Применяет выбранные JSON пути для создания данных графика
   */
  const applySelectedJsonPaths = useCallback(() => {
    try {
      const chartData = createChartDataFromJsonPaths();
      
      if (!chartData) {
        throw new Error("Failed to create valid chart data");
      }
      
      onDataLoaded(chartData);
      messageApi.success({
        content: "Data loaded successfully",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      messageApi.error({
        content: "Error creating chart data: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  }, [createChartDataFromJsonPaths, onDataLoaded, messageApi]);

  /**
   * Обрабатывает загрузку JSON файла
   */
  const handleJsonFileUpload = useCallback((file: RcFile): BeforeUploadResult => {
    // Проверка размера файла
    if (!validateFileSize(file)) {
      return Upload.LIST_IGNORE;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { parsedData, pathsInfo, defaultSelected, isValidChartData } = processJsonData(content);
        
        // Сохраняем файл
        saveFileInfo(file);
        
        // Сохраняем исходные JSON данные
        setJsonData(parsedData);
        
        // Сохраняем информацию о путях
        setJsonPathsInfo(pathsInfo);
        setJsonPaths(pathsInfo.map(info => info.path));
        setSelectedJsonPaths(defaultSelected);
        
        // Если JSON уже в формате для Chart.js, загружаем его напрямую
        if (isValidChartData) {
          onDataLoaded(parsedData as unknown as ChartDataType);
          messageApi.success({
            content: "JSON file loaded successfully",
            duration: 3,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          });
        } else {
          // Иначе показываем UI для выбора путей
          messageApi.info({
            content: "Select data to display on the chart",
            duration: 4
          });
        }
      } catch (error) {
        messageApi.error({
          content: "Error parsing JSON file: " + (error as Error).message,
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      messageApi.error({
        content: "Error reading file",
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      setLoading(false);
    };
    
    reader.readAsText(file);
    return false; // Предотвращаем автоматическую загрузку файла
  }, [validateFileSize, setLoading, processJsonData, saveFileInfo, setJsonData, setJsonPathsInfo, setJsonPaths, setSelectedJsonPaths, onDataLoaded, messageApi]);

  /**
   * Обрабатывает загрузку Excel/CSV файла
   */
  const handleExcelFileUpload = useCallback((file: RcFile): BeforeUploadResult => {
    // Проверка размера файла
    if (!validateFileSize(file)) {
      return Upload.LIST_IGNORE;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const { 
          workbook, 
          sheets, 
          firstSheetName, 
          firstSheetData, 
          headers, 
          chartData 
        } = processExcelFile(data);
        
        // Сохраняем файл
        saveFileInfo(file);
        
        // Сохраняем данные Excel
        setExcelWorkbook(workbook);
        setAvailableSheets(sheets);
        setSelectedSheet(firstSheetName);
        setSheetData(firstSheetData);
        
        // Сохраняем заголовки колонок
        setAvailableColumns(headers);
        setSelectedColumns([...headers]);
        
        // Если удалось создать данные для графика, загружаем их
        if (chartData && validateChartData(chartData)) {
          onDataLoaded(chartData);
          messageApi.success({
            content: "Spreadsheet loaded successfully",
            duration: 3,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
          });
        } else {
          messageApi.error({
            content: "Invalid data format for chart in Excel/CSV file",
            duration: 5,
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          });
        }
      } catch (error) {
        messageApi.error({
          content: "Error processing spreadsheet: " + (error as Error).message,
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        });
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      messageApi.error({
        content: "Error reading file",
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
    return false; // Предотвращаем автоматическую загрузку файла
  }, [validateFileSize, setLoading, processExcelFile, saveFileInfo, setExcelWorkbook, setAvailableSheets, setSelectedSheet, setSheetData, setAvailableColumns, setSelectedColumns, validateChartData, onDataLoaded, messageApi]);

  /**
   * Применяет выбранные колонки Excel для создания данных графика
   */
  const applySelectedExcelColumns = useCallback(() => {
    try {
      const chartData = createChartDataFromSelectedColumns();
      
      if (!chartData) {
        throw new Error("Failed to create valid chart data");
      }
      
      onDataLoaded(chartData);
      messageApi.success({
        content: "Data updated successfully",
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      messageApi.error({
        content: "Error processing selected columns: " + (error as Error).message,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    }
  }, [createChartDataFromSelectedColumns, onDataLoaded, messageApi]);

  // Определяем элементы вкладок
  const tabItems = [
    {
      key: "json-text",
      label: (
        <span>
          <FileTextOutlined /> JSON text
        </span>
      ),
      children: (
        <JsonTextTab
          jsonText={jsonText}
          setJsonText={setJsonText}
          loading={loading}
          onSubmit={handleJsonSubmit}
          jsonPathsInfo={jsonPathsInfo}
          selectedJsonPaths={selectedJsonPaths}
          setSelectedJsonPaths={setSelectedJsonPaths}
          onApplyPaths={applySelectedJsonPaths}
          showPathSelector={!!jsonData && jsonPaths.length > 0}
        />
      )
    },
    {
      key: "json-file",
      label: (
        <span>
          <UploadOutlined /> JSON file
        </span>
      ),
      children: (
        <JsonFileTab
          onFileUpload={handleJsonFileUpload}
          loading={loading}
          uploadedFile={uploadedFile}
          jsonPathsInfo={jsonPathsInfo}
          selectedJsonPaths={selectedJsonPaths}
          setSelectedJsonPaths={setSelectedJsonPaths}
          onApplyPaths={applySelectedJsonPaths}
          onReset={resetData}
          showPathSelector={!!jsonData && jsonPaths.length > 0}
        />
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
        <ExcelFileTab
          onFileUpload={handleExcelFileUpload}
          loading={loading}
          uploadedFile={uploadedFile}
          availableSheets={availableSheets}
          selectedSheet={selectedSheet}
          onSheetChange={handleSheetChange}
          availableColumns={availableColumns}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          onApplyColumns={applySelectedExcelColumns}
          onReset={resetData}
          showSheetSelector={!!excelWorkbook && availableSheets.length > 0}
        />
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <Card 
        title="Data Upload" 
        className="mb-6 shadow-md"
        style={{ borderRadius: "12px" }}
      >
        <Tabs defaultActiveKey="json-text" items={tabItems} />
      </Card>
    </>
  );
};

export default DataUploader;

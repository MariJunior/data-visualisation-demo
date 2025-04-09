import { ChartDataPointType, ChartDataType } from "@/app/types/chart";
import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { ChartDataset, ChartType } from "chart.js";
import { useState } from "react";
import * as XLSX from "xlsx";

/**
 * Хук для работы с Excel/CSV данными
 * Обрабатывает таблицы, анализирует их структуру и создает данные для графика
 */
export const useExcelData = () => {
  const [excelWorkbook, setExcelWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<unknown[][]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  /**
   * Преобразует данные из таблицы в формат для Chart.js
   */
  const processSpreadsheetData = (data: unknown[][]): ChartDataType | null => {
    if (!data || data.length < 2) {
      return null;
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

  /**
   * Обрабатывает изменение выбранного листа
   */
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

  /**
   * Создает данные для графика из выбранных колонок Excel/CSV
   */
  const createChartDataFromSelectedColumns = (): ChartDataType | null => {
    if (!sheetData || sheetData.length < 2 || selectedColumns.length < 2) {
      return null;
    }
    
    // Получаем индексы выбранных колонок
    const headers = sheetData[0] as string[];
    const selectedIndices = selectedColumns.map(col => headers.indexOf(col)).filter(idx => idx !== -1);
    
    // Создаем новый массив данных только с выбранными колонками
    const filteredData = sheetData.map(row => 
      selectedIndices.map(idx => row[idx])
    );
    
    // Преобразуем данные в формат для Chart.js
    return processSpreadsheetData(filteredData);
  };

  /**
   * Обрабатывает загруженный Excel/CSV файл
   */
  const processExcelFile = (data: ArrayBuffer): {
    workbook: XLSX.WorkBook;
    sheets: string[];
    firstSheetName: string;
    firstSheetData: unknown[][];
    headers: string[];
    chartData: ChartDataType | null;
  } => {
    const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
    
    // Получаем список листов
    const sheets = workbook.SheetNames;
    
    // По умолчанию выбираем первый лист
    const firstSheetName = sheets[0];
    
    // Получаем данные из первого листа
    const worksheet = workbook.Sheets[firstSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
    
    // Получаем заголовки колонок
    const headers = sheetData.length > 0 ? sheetData[0] as string[] : [];
    
    // Преобразуем данные в формат для Chart.js
    const chartData = processSpreadsheetData(sheetData);
    
    return {
      workbook,
      sheets,
      firstSheetName,
      firstSheetData: sheetData,
      headers,
      chartData
    };
  };

  return {
    excelWorkbook,
    setExcelWorkbook,
    availableSheets,
    setAvailableSheets,
    selectedSheet,
    setSelectedSheet,
    sheetData,
    setSheetData,
    availableColumns,
    setAvailableColumns,
    selectedColumns,
    setSelectedColumns,
    handleSheetChange,
    createChartDataFromSelectedColumns,
    processExcelFile,
    processSpreadsheetData
  };
};

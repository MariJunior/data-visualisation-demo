import { ChartDataType } from "@/app/types/chart";
import { RcFile } from "antd/es/upload";

/**
 * Тип для возвращаемого значения функции beforeUpload в компоненте Upload
 * Согласно документации Ant Design, функция может возвращать:
 * - boolean: true для продолжения загрузки, false для остановки
 * - Promise<File>: для преобразования файла перед загрузкой
 * - Upload.LIST_IGNORE: специальная константа для игнорирования файла
 */
export type BeforeUploadResult = boolean | Promise<File | Blob | void> | void | string;

/**
 * Тип для функции обработки загрузки файла
 */
export type FileUploadHandler = (file: RcFile) => BeforeUploadResult;

/**
 * Информация о загруженном файле
 */
export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

// Информация о загруженном файле
export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

// Информация о пути в JSON структуре
export interface JsonPathInfo {
  path: string;
  isArray: boolean;
  isNumeric: boolean;
  commonAcrossAll: boolean;
  sampleValue: string;
}

// Свойства для компонента загрузки данных
export interface DataUploaderProps {
  onDataLoaded: (data: ChartDataType | null) => void;
}

// Свойства для отображения информации о файле
export interface FileInfoDisplayProps {
  uploadedFile: UploadedFileInfo | null;
}

// Свойства для компонента выбора JSON путей
export interface JsonPathSelectorProps {
  jsonPathsInfo: JsonPathInfo[];
  selectedJsonPaths: string[];
  setSelectedJsonPaths: (paths: string[]) => void;
  onApply: () => void;
}

// Свойства для компонента выбора листа Excel
export interface ExcelSheetSelectorProps {
  availableSheets: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
  availableColumns: string[];
  selectedColumns: string[];
  setSelectedColumns: (columns: string[]) => void;
  onApply: () => void;
}

// Константа для максимального размера файла (например, 15 МБ)
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 МБ в байтах
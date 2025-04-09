import { FileInfoDisplayProps } from "@/app/components/DataUploader/types";
import { FC } from "react";

/**
 * Компонент для отображения информации о загруженном файле
 */
export const FileInfoDisplay: FC<FileInfoDisplayProps> = ({ uploadedFile }) => {
  if (!uploadedFile) return null;
  
  /**
   * Форматирует размер файла в читаемый вид
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const fileDate = new Date(uploadedFile.lastModified).toLocaleString();
  
  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
      <h4 className="font-medium text-blue-700 dark:text-blue-300">Uploaded file:</h4>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div className="text-gray-600 dark:text-gray-300">File name:</div>
        <div className="font-medium">{uploadedFile.name}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Size:</div>
        <div>{formatFileSize(uploadedFile.size)}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Type:</div>
        <div>{uploadedFile.type || 'Unknown'}</div>
        
        <div className="text-gray-600 dark:text-gray-300">Modified date:</div>
        <div>{fileDate}</div>
      </div>
    </div>
  );
};

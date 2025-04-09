import { useState } from "react";
import { UploadedFileInfo, MAX_FILE_SIZE } from "@/app/components/DataUploader/types";
import { message } from "antd";
import { RcFile } from "antd/es/upload";
import { ExclamationCircleOutlined } from "@ant-design/icons";

/**
 * Хук для работы с загрузкой файлов
 * Обрабатывает загрузку файлов и проверяет их размер
 */
export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi] = message.useMessage();

  /**
   * Проверяет размер файла перед загрузкой
   */
  const validateFileSize = (file: RcFile) => {
    if (file.size > MAX_FILE_SIZE) {
      messageApi.error({
        content: `File is too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        duration: 5,
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      });
      return false;
    }
    return true;
  };

  /**
   * Сохраняет информацию о загруженном файле
   */
  const saveFileInfo = (file: RcFile) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
  };

  /**
   * Сбрасывает данные о загруженном файле
   */
  const resetFileData = () => {
    setUploadedFile(null);
  };

  return {
    uploadedFile,
    setUploadedFile,
    loading,
    setLoading,
    validateFileSize,
    saveFileInfo,
    resetFileData
  };
};

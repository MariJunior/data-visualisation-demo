"use client";

import { useIsDarkMode } from "@/app/hooks/useIsDarkMode";
import { ConfigProvider, theme } from "antd";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const isDarkMode = useIsDarkMode();

  // Настройки темы Ant Design
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        // Здесь можно добавить дополнительные настройки темы
        token: {
          // Настройка основных цветов
          colorPrimary: "#6366f1",
          borderRadius: 8,
        },
        components: {
          Card: {
            colorBgContainer: isDarkMode ? "rgba(30, 30, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
          },
          Typography: {
            // Настройка цвета текста для Typography компонентов
            colorText: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
            colorTextSecondary: isDarkMode ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)",
          },
          // Можно добавить настройки для других компонентов
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;

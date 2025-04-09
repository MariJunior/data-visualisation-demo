import { ChartOptions, ChartType, Color } from "chart.js";

/**
 * Создает базовые опции графика с учетом темной темы
 * @param isDarkMode - Флаг темной темы
 * @param fontFamily - Семейство шрифтов
 * @param fontSize - Размер шрифта
 * @returns Базовые опции графика
 */
export const createBaseOptions = (
  isDarkMode: boolean,
  fontFamily: string,
  fontSize: number
): ChartOptions<ChartType> => {
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";

  return {
    responsive: true,
    font: {
      family: fontFamily,
      size: fontSize,
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: fontFamily,
            size: fontSize,
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: fontFamily,
            size: fontSize,
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            family: fontFamily,
            size: fontSize,
          },
          color: textColor,
        },
      },
      tooltip: {
        titleFont: {
          family: fontFamily,
          size: fontSize,
        },
        bodyFont: {
          family: fontFamily,
          size: fontSize - 1,
        },
      },
    },
  };
};

/**
 * Создает опции для радарного графика
 * @param baseOptions - Базовые опции графика
 * @param isDarkMode - Флаг темной темы
 * @param fontFamily - Семейство шрифтов
 * @param fontSize - Размер шрифта
 * @param legendColor - Цвет легенды
 * @returns Опции для радарного графика
 */
export const createRadarOptions = (
  baseOptions: ChartOptions<ChartType>,
  isDarkMode: boolean,
  fontFamily: string,
  fontSize: number,
  legendColor: Color
): ChartOptions<ChartType> => {
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return {
    ...baseOptions,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          backdropColor: "transparent",
          font: {
            family: fontFamily,
            size: fontSize,
          },
          color: legendColor,
        },
        grid: {
          color: gridColor,
          lineWidth: 2,
          circular: true,
        },
        angleLines: {
          color: gridColor,
          lineWidth: 2,
          display: true,
        },
        pointLabels: {
          color: legendColor,
          font: {
            family: fontFamily,
            size: fontSize,
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0, // Для радаров лучше использовать 0
        fill: true, // Включаем заливку на уровне элементов
      },
      point: {
        radius: 3,
        borderWidth: 2,
        hoverRadius: 5,
        hoverBorderWidth: 2
      }
    },
  };
};

/**
 * Создает опции для графика с двумя осями Y
 * @param baseOptions - Базовые опции графика
 * @param isDarkMode - Флаг темной темы
 * @param fontFamily - Семейство шрифтов
 * @param fontSize - Размер шрифта
 * @param legendColor - Цвет легенды
 * @param secondAxisTitle - Заголовок второй оси
 * @returns Опции для графика с двумя осями Y
 */
export const createDualAxisOptions = (
  baseOptions: ChartOptions<ChartType>,
  isDarkMode: boolean,
  fontFamily: string,
  fontSize: number,
  legendColor: Color,
  secondAxisTitle: string
): ChartOptions<ChartType> => {
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  return {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: secondAxisTitle,
          font: {
            family: fontFamily,
            size: fontSize,
          },
          color: legendColor,
        },
        grid: {
          drawOnChartArea: false,
          color: gridColor,
        },
        ticks: {
          font: {
            family: fontFamily,
            size: fontSize,
          },
          color: legendColor,
        }
      }
    }
  };
};

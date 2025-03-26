import { generateRandomColor } from "@/app/utils/generateRandomColor";
import { generateRandomData } from "@/app/utils/generateRandomData";
import { BubbleDataPoint, ChartData, ScatterDataPoint } from "chart.js";

type DatasetMocksTypes = {
  sales: ChartData<"line" | "bar">;
  users: ChartData<"line" | "bar">;
  performance: ChartData<"radar" | "polarArea">;
  revenue: ChartData<"line" | "bar">;
  demographics: ChartData<"pie" | "doughnut">;
  comparison: ChartData<"bar">;
  bubbleData: ChartData<"bubble", BubbleDataPoint[]>;
  scatterData: ChartData<"scatter", ScatterDataPoint[]>;
  timeData: ChartData<"line">;
};

export const mockDatasets: DatasetMocksTypes = {
  // Данные о продажах по месяцам за два года
  sales: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Sales 2023",
        data: generateRandomData(12, 40, 180),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
      {
        label: "Sales 2022",
        data: generateRandomData(12, 20, 90),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
      }
    ],
  },
  
  // Статистика пользователей по кварталам за два года
  users: {
    labels: ["Q1 2022", "Q2 2022", "Q3 2022", "Q4 2022", "Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023"],
    datasets: [
      {
        label: "Active Users",
        data: generateRandomData(8, 1000, 10000),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        type: "line",
        yAxisID: "y",
      },
      {
        label: "New Registrations",
        data: generateRandomData(8, 400, 2000),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.7)",
        type: "bar",
        yAxisID: "y1",
      }
    ],
  },
  
  // Метрики производительности продуктов
  performance: {
    labels: ["Speed", "Reliability", "User Experience", "Security", "Efficiency", "Scalability", "Maintainability"],
    datasets: [
      {
        label: "Product A",
        data: generateRandomData(7, 65, 95),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Product B",
        data: generateRandomData(7, 25, 75),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Product C",
        data: generateRandomData(7, 15, 80),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      }
    ],
  },
  
  // Данные о доходах по категориям продуктов
  revenue: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Hardware",
        data: generateRandomData(12, 10000, 25000),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        stack: "stack1",
      },
      {
        label: "Software",
        data: generateRandomData(12, 18000, 35000),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        stack: "stack1",
      },
      {
        label: "Services",
        data: generateRandomData(12, 8000, 14000),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        stack: "stack1",
      }
    ],
  },
  
  // Демографические данные пользователей
  demographics: {
    labels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    datasets: [
      {
        label: "Age Distribution",
        data: generateRandomData(6, 1, 45),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 205, 86, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(255, 159, 64)",
        ],
        borderWidth: 1,
      }
    ],
  },
  
  // Сравнение показателей по регионам
  comparison: {
    labels: ["North America", "Europe", "Asia", "South America", "Africa", "Australia"],
    datasets: [
      {
        label: "Sales",
        data: generateRandomData(6, 9000, 41000),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
      {
        label: "Profit",
        data: generateRandomData(6, 2000, 18000),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Market Share (%)",
        data: generateRandomData(6, 3, 35),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
      }
    ],
  },
  
  // Данные для пузырьковой диаграммы
  bubbleData: {
    datasets: [
      {
        label: "Product Performance",
        data: Array.from({ length: 15 }, () => ({
          x: Math.random() * 100, // Рыночная доля
          y: Math.random() * 100, // Удовлетворенность клиентов
          r: Math.random() * 15 + 5, // Объем продаж
        })),
        backgroundColor: Array.from({ length: 15 }, () => generateRandomColor(0.7)),
      },
      {
        label: "Competitor Performance",
        data: Array.from({ length: 10 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          r: Math.random() * 15 + 5,
        })),
        backgroundColor: Array.from({ length: 10 }, () => generateRandomColor(0.7)),
      }
    ],
  },
  
  // Данные для точечной диаграммы
  scatterData: {
    datasets: [
      {
        label: "Correlation: Price vs. Rating",
        data: Array.from({ length: 50 }, () => ({
          x: Math.random() * 1000 + 100, // Цена
          y: Math.random() * 5 + 2, // Рейтинг
        })),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
      {
        label: "Correlation: Features vs. Rating",
        data: Array.from({ length: 50 }, () => ({
          x: Math.random() * 20 + 5, // Количество функций
          y: Math.random() * 5 + 2, // Рейтинг
        })),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
      }
    ],
  },
  
  // Временной ряд данных
  timeData: {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Website Traffic",
        data: generateRandomData(24, 25, 500),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Server Load (%)",
        data: generateRandomData(24, 5, 80),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
        fill: true,
        yAxisID: "y1",
      }
    ],
  }
};

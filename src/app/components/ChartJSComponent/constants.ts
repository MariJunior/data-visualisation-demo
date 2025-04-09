import { ChartOptions, ChartType, EasingFunction } from "chart.js";
import { LegendPositionEnum } from "./types";

export const colorSchemes = [
  { id: "default", name: "Default", colors: ["#36a2eb", "#ff6384", "#4bc0c0", "#ff9f40", "#9966ff", "#ffcd56"] },
  { id: "pastel", name: "Pastel", colors: ["#f1c0e8", "#cfbaf0", "#a3c4f3", "#90dbf4", "#8eecf5", "#98f5e1"] },
  { id: "vibrant", name: "Vibrant", colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"] },
  { id: "monochrome", name: "Monochrome", colors: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"] },
  { id: "earth", name: "Earth Tones", colors: ["#5d4037", "#795548", "#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8"] },
];
 
export const easingOptions: EasingFunction[] = [
  "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad",
  "easeInCubic", "easeOutCubic", "easeInOutCubic",
  "easeInQuart", "easeOutQuart", "easeInOutQuart",
  "easeInQuint", "easeOutQuint", "easeInOutQuint",
  "easeInSine", "easeOutSine", "easeInOutSine",
  "easeInExpo", "easeOutExpo", "easeInOutExpo",
  "easeInCirc", "easeOutCirc", "easeInOutCirc",
  "easeInElastic", "easeOutElastic", "easeInOutElastic",
  "easeInBack", "easeOutBack", "easeInOutBack",
  "easeInBounce", "easeOutBounce", "easeInOutBounce",
] as const;

export const defaultOptions: ChartOptions<ChartType> = {
  responsive: true,
  aspectRatio: 2,
  animation: {
    duration: 1000,
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 1,
    },
    point: {
      radius: 4,
      borderWidth: 1,
    },
    bar: {
      borderWidth: 1,
    },
    arc: {
      borderWidth: 1,
    }
  },
  plugins: {
    legend: {
      display: true,
      position: LegendPositionEnum.TOP,
    },
    title: {
      display: true,
      text: "Chart.js Demo",
      font: {
        size: 16,
        weight: "bold",
      },
    },
  },
};

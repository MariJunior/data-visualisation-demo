// Функция для генерации массива случайных чисел
export const generateRandomData = (count: number, min = 0, max = 100) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

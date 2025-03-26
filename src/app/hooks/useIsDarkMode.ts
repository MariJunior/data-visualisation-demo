import { useEffect, useState } from "react";

export const useIsDarkMode = () => {
  // Начальное состояние темы (по умолчанию светлая)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Проверяем предпочтения пользователя при монтировании компонента
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    // Слушаем изменения системной темы
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeQuery.addEventListener("change", handleChange);
    
    // Очистка слушателя при размонтировании
    return () => {
      darkModeQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDarkMode;
}
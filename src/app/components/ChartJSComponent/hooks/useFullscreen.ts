import { RefObject, useCallback, useEffect, useState } from "react";

/**
 * Хук для управления полноэкранным режимом
 * @param containerRef - Ссылка на контейнер, который будет отображаться в полноэкранном режиме
 * @param onFullscreenChange - Функция обратного вызова при изменении состояния полноэкранного режима
 */
export const useFullscreen = (
  containerRef: RefObject<HTMLElement | null>,
  onFullscreenChange?: (isFullscreen: boolean) => void
) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Обработчик изменения состояния полноэкранного режима
  const handleFullscreenChange = useCallback(() => {
    const isFullscreenActive = !!document.fullscreenElement;
    setIsFullscreen(isFullscreenActive);
    
    if (onFullscreenChange) {
      onFullscreenChange(isFullscreenActive);
    }
  }, [onFullscreenChange]);

  // Добавляем слушатель события изменения полноэкранного режима
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Переключение полноэкранного режима
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Ошибка при попытке включить полноэкранный режим: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Ошибка при попытке выйти из полноэкранного режима: ${err.message}`);
      });
    }
  }, [containerRef]);

  return { isFullscreen, toggleFullscreen };
};

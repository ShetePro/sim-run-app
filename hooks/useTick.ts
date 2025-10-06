import { useCallback, useEffect, useRef, useState } from "react";

export function useTick() {
  const TICK_INTERVAL = 100;
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  // 用来保存计时器开始时间的引用 (Unix时间戳，毫秒)
  const startTimeRef = useRef(Date.now());
  const tick = useCallback(() => {
    const now = Date.now();
    const expectedElapsed = now - startTimeRef.current;
    const newSeconds = Math.round(expectedElapsed / 1000);
    setSeconds(newSeconds);

    const nextExpectedTime = (newSeconds + 1) * 1000 + startTimeRef.current;
    const delay = nextExpectedTime - now;
    const nextDelay = Math.max(0, delay);

    timerRef.current = setTimeout(tick, nextDelay);
  }, []); // 依赖为空，确保 tick 函数引用稳定

  // 启动计时器的函数
  const startTimer = () => {
    // 确保在启动前清除任何现有的计时器，防止重复
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 重置状态
    setSeconds(0);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(tick, TICK_INTERVAL);
  };

  // 停止计时器的函数
  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 始终在组件卸载时清除计时器
  useEffect(() => {
    return () => {
      // 在组件卸载时，确保计时器被清除
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return { startTimer, stopTimer, seconds };
}

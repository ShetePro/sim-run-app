import { useCallback, useEffect, useRef, useState } from "react";
import { useRunStore } from "@/store/runStore";

export function useTick() {
  const TICK_INTERVAL = 100;
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const tick = useCallback(() => {
    const now = Date.now();
    const expectedElapsed = now - startTimeRef.current;
    const newSeconds = Math.round(expectedElapsed / 1000);
    setSeconds(newSeconds);
    useRunStore.getState().setDuration(newSeconds);

    const nextExpectedTime = (newSeconds + 1) * 1000 + startTimeRef.current;
    const delay = nextExpectedTime - now;
    const nextDelay = Math.max(0, delay);

    timerRef.current = setTimeout(tick, nextDelay);
  }, []);

  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setSeconds(0);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(tick, TICK_INTERVAL);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return { startTimer, stopTimer, seconds };
}

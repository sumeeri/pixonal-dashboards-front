import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

export const useAnimatedNumber = (targetValue: number, delay: number = 1750): number => {
  const [value, setValue] = useState(0);
  const previousValueRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const updateCounter = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / delay;

    if (elapsed < 1) {
      const progress = easeOutCubic(elapsed);
      setValue(Math.floor(previousValueRef.current + (targetValue - previousValueRef.current) * progress));
      requestRef.current = requestAnimationFrame(updateCounter);
    } else {
      setValue(targetValue);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  };

  useEffect(() => {
    previousValueRef.current = value;
    startTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(updateCounter);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetValue]);

  return value;
};

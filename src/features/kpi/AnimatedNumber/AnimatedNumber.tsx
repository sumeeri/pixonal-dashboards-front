import { useAnimatedNumber } from 'shared/utils/useAnimatedNumber.ts';

export const AnimatedNumber = ({ value }: { value: number }) => {
  const animated = useAnimatedNumber(value ?? 0);

  return <>{value! < 0 ? animated.toLocaleString('en-US') : Math.round(animated).toLocaleString('en-US')}</>;
};

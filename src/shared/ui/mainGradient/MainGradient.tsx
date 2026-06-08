import style from './MainGradient.module.scss';
import { TopGradient } from './TopGradient.tsx';

export const MainGradient = ({ hasGradient }: { hasGradient: boolean }) => {
  return (
    <>
      <div className={style.topGradient}>
        <TopGradient />
      </div>
      {hasGradient && <div className={style.backgroundGradient} />}
    </>
  );
};

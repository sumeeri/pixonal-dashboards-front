import CircularProgress from '@mui/material/CircularProgress';
import cn from 'classnames';

import styles from './Loader.module.scss';

type Props = {
  background?: boolean;
};

export const Loader = ({ background = true }: Props) => {
  return (
    <div className={cn(styles.loaderWrapper, background && styles.background)}>
      <h2 className={styles.loaderText}>Loading...</h2>
      <CircularProgress size={50} sx={{ color: '#9DA3DC' }} />
    </div>
  );
};

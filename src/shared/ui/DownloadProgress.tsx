import { CircularProgress, Fade } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';

export const DownloadProgress = observer(() => {
  const { downloadStore } = useStore();

  return (
    <Fade in={downloadStore.time > 5000}>
      <CircularProgress sx={{ strokeOpacity: 0.75 }} variant="determinate" value={downloadStore.progress * 100} />
    </Fade>
  );
});

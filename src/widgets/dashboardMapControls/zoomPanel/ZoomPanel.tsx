import { ButtonGroup, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { ZoomInIcon } from 'shared/icons/ZoomInIcon.tsx';
import { ZoomOutIcon } from 'shared/icons/ZoomOutIcon.tsx';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';
import style from './ZoomPanel.module.scss';

export const ZoomPanel = observer(() => {
  const { map3DStore } = useStore();

  const zoomIn = () => {
    map3DStore.zoomIn();
  };

  const zoomOut = () => {
    map3DStore.zoomOut();
  };

  return (
    <ButtonGroup
      sx={{
        borderRadius: '40px',
        background: '#00000066',
        backdropFilter: 'blur(30px)',
        border: '1px solid #9DA3DC33',
      }}
      aria-label="Zoom map buttons"
      orientation="vertical"
      id="zoom-panel"
    >
      <IconButton
        sx={{
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          width: '58px',
          height: '58px',
        }}
        onClick={zoomIn}
      >
        <ZoomInIcon />
      </IconButton>
      <span className={style.delimiter} />
      <IconButton
        sx={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          width: '58px',
          height: '58px',
        }}
        onClick={zoomOut}
      >
        <ZoomOutIcon />
      </IconButton>
    </ButtonGroup>
  );
});

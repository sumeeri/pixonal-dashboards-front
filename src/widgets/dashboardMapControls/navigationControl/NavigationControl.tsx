import { IconButton } from '@mui/material';
import { useDrag } from '@use-gesture/react';
import add from 'lodash/add';
import { observer } from 'mobx-react-lite';
import { CompassIcon } from 'shared/icons';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';

export const NavigationControl = observer(() => {
  const { map3DStore } = useStore();

  const moveToInitLocation = () => {
    map3DStore.setDefaultCameraPosition();
  };

  const bind = useDrag(
    ({ active, delta: [dx, dy], distance, elapsedTime }) => {
      if (elapsedTime > 100) {
        map3DStore.dragRotate(dx, dy);
      }
      if (!active && add(...distance) < 15) {
        moveToInitLocation();
      }
    },
    { pointer: { lock: true } }
  );

  return (
    <IconButton
      {...bind()}
      aria-label="back to initial position"
      id="navigation"
      sx={{
        background: '#00000066',
        backdropFilter: 'blur(30px)',
        border: '1px solid #9DA3DC33',
        width: '58px',
        height: '58px',
      }}
    >
      <CompassIcon matrix3d={map3DStore.uiCompassMatrix} />
    </IconButton>
  );
});

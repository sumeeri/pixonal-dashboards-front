import { IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { LayersIcon } from 'shared/icons/LayersIcon.tsx';

import { useStore } from '../../../app/providers/storeProvider/StoreProvider.tsx';

export const Layers = observer(() => {
  const { mapDataValuesStore } = useStore();
  const { isBordersVisible } = mapDataValuesStore;

  const changeVisibility = () => {
    mapDataValuesStore.setIsBordersVisible(!isBordersVisible);
  };

  return (
    <IconButton
      aria-label="Show layers button"
      id="layers-button"
      sx={{
        background: '#00000066',
        backdropFilter: 'blur(30px)',
        border: '1px solid #9DA3DC33',
        width: '58px',
        height: '58px',
      }}
      onClick={changeVisibility}
    >
      <LayersIcon />
    </IconButton>
  );
});

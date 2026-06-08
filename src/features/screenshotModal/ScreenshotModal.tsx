import { Button, CircularProgress, Modal } from '@mui/material';
import { format } from 'date-fns/format';
import mergeImages from 'merge-images';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { CloseIcon } from 'shared/icons/CloseIcon.tsx';
import { MediumArrowIcon } from 'shared/icons/MediumArrowIcon.tsx';
import { download } from 'shared/utils/downloadScreenshot.ts';
import { takeScreenShot } from 'shared/utils/takeScreenShot.tsx';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import style from './ScreenshotModal.module.scss';

const sx = {
  padding: '16px 32px 16px 32px',
  gap: '2rem',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '30px',
};

export const ScreenshotModal = observer(() => {
  const { screenshotStore, map3DStore, slidesStore, locationPanelStore } = useStore();
  const [source, setSource] = useState<string | undefined>(undefined);

  const getVisual = async () => {
    const res = await takeScreenShot();
    const res1 = await map3DStore.takeScreenshot();
    if (res1 && res) {
      mergeImages([res1, res]).then((image: string) => setSource(image));
    }
  };

  const closeModal = () => {
    screenshotStore.setIsModalOpen(false);
  };

  const downloadScreenshot = () => {
    download(source!, {
      name: `${slidesStore.currentSlide} ${locationPanelStore.currentLocation?.location} ${format(Date.now(), 'yyyy-MM-dd hh:mm a')}`,
      extension: 'png',
    });
    closeModal();
  };

  useEffect(() => {
    setSource(undefined);
    getVisual();
  }, []);

  return (
    <Modal open={screenshotStore.isModalOpen} onClose={closeModal}>
      <div className={style.wrapper}>
        <div className={style.header}>
          export screenshot
          <button onClick={closeModal}>
            <CloseIcon />
          </button>
        </div>
        <div className={style.imgWrapper}>
          {source ? (
            <img className={style.img} src={source} alt="screenshot" />
          ) : (
            <CircularProgress size={80} sx={{ color: '#9DA3DC' }} />
          )}
        </div>
        <div className={style.buttons}>
          <Button sx={sx} variant="outlined" onClick={closeModal}>
            cancel
          </Button>
          <Button
            sx={sx}
            color="secondary"
            variant="contained"
            onClick={downloadScreenshot}
            disabled={!source}
            endIcon={<MediumArrowIcon />}
          >
            save to device
          </Button>
        </div>
      </div>
    </Modal>
  );
});

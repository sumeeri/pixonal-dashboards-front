import { Button, IconButton, Modal, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { format } from 'date-fns/format';
import mergeImages from 'merge-images';
import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { CloseIcon, InfoIcon, MediumArrowIcon, ScreenshotIcon, VideoIcon } from 'shared/icons';
// import { Slide } from '../../entities/dashboard/types';
import { download } from 'shared/utils/downloadScreenshot.ts';
import { takeScreenShot } from 'shared/utils/takeScreenShot.tsx';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';
// import { OPTIONS } from '../exploreDataCharts/constants';
import style from './ExportDialogue.module.scss';

type ExportType = 'screenshot' | 'video';

// TODO: Refactor
export const ExportDialogue = observer(({ isOpenModal, onClose }: { isOpenModal: boolean; onClose: () => void }) => {
  const { videoRecordingStore, map3DStore, slidesStore, locationPanelStore } = useStore();

  const [exportType, setExportType] = useState<ExportType>('screenshot');
  // const [timePoints, setTimePoints] = useState('expandTimePoints');
  // const [mapDataWidget, setMapDataWidget] = useState('expandMapDataWidget');
  // TODO: This should NOT be here, exploreDataCharts options are not meant to be used
  // outside exploreDataCharts scope
  // const [gender, setGender] = useState(OPTIONS[Slide.STUDENTS_COUNT][0].name);

  const saveScreenshoot = useCallback(async () => {
    const res = await takeScreenShot();
    const res1 = await map3DStore.takeScreenshot();
    if (res1 && res) {
      mergeImages([res1, res]).then((image: string) => {
        download(image!, {
          name: `${slidesStore.currentSlide} ${locationPanelStore.currentLocation?.location} ${format(Date.now(), 'yyyy-MM-dd hh-mm a')}`,
          extension: 'png',
        });
      });
    }
  }, []);

  const saveVideo = useCallback(async () => {
    videoRecordingStore.recordOneMinuteVideo();
  }, []);

  const doExport = useCallback(async () => {
    onClose();
    switch (exportType) {
      case 'screenshot':
        await saveScreenshoot();
        break;
      case 'video':
        await saveVideo();
        break;
    }
  }, [exportType]);

  // type Setting = {
  //   id: number;
  //   label: string;
  //   isActive: boolean;
  // };

  // const [screenshotSettings, setScreenshotSettings] = useState([
  //   // {
  //   //   id: 0,
  //   //   label: 'Include Timepoints Widget',
  //   //   isActive: false,
  //   // },
  //   // {
  //   //   id: 1,
  //   //   label: 'Include Map Data Widget',
  //   //   isActive: false,
  //   // },
  //   // {
  //   //   id: 2,
  //   //   label: 'Include Export Data',
  //   //   isActive: false,
  //   // },
  //   // {
  //   //   id: 3,
  //   //   label: 'Include Additional Info',
  //   //   isActive: false,
  //   // },
  // ] as Setting[]);

  // const getInfo = (el: any) => {
  //   switch (el.id) {
  //     case 0:
  //     case 1: {
  //       const value = getToggleValue(el);
  //
  //       return (
  //         <div className={style.buttons}>
  //           <ToggleButtonGroup
  //             disabled={!el.isActive}
  //             className={style.toggle}
  //             exclusive
  //             value={el.id === 0 ? timePoints : mapDataWidget}
  //             onChange={(_, newValue) => {
  //               if (newValue) {
  //                 el.id === 0 ? setTimePoints(newValue) : setMapDataWidget(newValue);
  //               }
  //             }}
  //           >
  //             <ToggleButton className={style.button} value={value[0]}>
  //               <span>Expanded</span>
  //             </ToggleButton>
  //             <ToggleButton className={style.button} value={value[1]}>
  //               <span>Collapsed</span>
  //             </ToggleButton>
  //           </ToggleButtonGroup>
  //         </div>
  //       );
  //     }
  //     case 2:
  //       return (
  //         <div>
  //           <Select
  //             disabled={!el.isActive}
  //             className={style.select}
  //             variant="outlined"
  //             IconComponent={CalendarDropdownIcon}
  //             // onChange={(el) => setGender(el.target.value)}
  //             // value={gender}
  //           >
  //             {/* {OPTIONS[Slide.STUDENTS_COUNT].map((el) => ( */}
  //             {/*   <MenuItem key={el.id} value={el.name}> */}
  //             {/*     {el.name} */}
  //             {/*   </MenuItem> */}
  //             {/* ))} */}
  //           </Select>
  //         </div>
  //       );
  //     case 3:
  //       return <span className={style.textInfo}>Additional info includes: Export ID, User ID and Timestamps</span>;
  //   }
  // };

  // const getToggleValue = (el: any): string[] => {
  //   return el.id === 0
  //     ? ['expandTimePoints', 'collapsedTimePoints']
  //     : ['expandMapDataWidget', 'collapsedMapDataWidget'];
  // };

  // const onChangeSettings = (el: any) => {
  //   const foundSetting = screenshotSettings.find((setting) => setting.id === el.id);
  //   if (foundSetting) {
  //     foundSetting.isActive = !foundSetting?.isActive;
  //     setScreenshotSettings([...screenshotSettings]);
  //   }
  // };

  return (
    <Modal open={isOpenModal} onClose={onClose}>
      <div className={style.container}>
        <div className={style.wrapper}>
          <div className={style.top}>
            <span className={style.label}>Export</span>
            <div className={style.delimiter} />
            <IconButton onClick={onClose} className={style.closeButton} aria-label="delete" color="primary">
              <CloseIcon />
            </IconButton>
          </div>

          <div className={style.content}>
            <ToggleButtonGroup
              className={style.toggle}
              exclusive
              value={exportType}
              onChange={(_, newValue) => setExportType(newValue)}
            >
              <ToggleButton className={style.button} value="screenshot" aria-label="screenshot">
                <ScreenshotIcon />
                <span>Screenshot</span>
              </ToggleButton>
              <ToggleButton className={style.button} value="video" aria-label="video">
                <VideoIcon />
                <span>Video</span>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* <ul className={style.list}> */}
            {/*   {screenshotSettings.map((el) => ( */}
            {/*     <li key={el.id} className={style.item}> */}
            {/*       <div className={style.checkbox}> */}
            {/*         <FormControlLabel */}
            {/*           value="" */}
            {/*           control={ */}
            {/*             <Checkbox */}
            {/*               onChange={() => onChangeSettings(el)} */}
            {/*               icon={<CheckboxIcon />} */}
            {/*               checkedIcon={<CheckboxCheckedIcon />} */}
            {/*             /> */}
            {/*           } */}
            {/*           label={el.label} */}
            {/*           labelPlacement="start" */}
            {/*         /> */}
            {/*       </div> */}
            {/*       {getInfo(el)} */}
            {/*     </li> */}
            {/*   ))} */}
            {/* </ul> */}

            <div className={style.fileInfo}>
              <div className={style.fileTitle}>
                <InfoIcon color="#fff" />
                <span>Export File Info</span>
              </div>
              <div className={style.fileContent}>
                <div className={style.fileCollHeader}>
                  <span className={style.fileCollName}>File Type</span>
                  <span className={style.fileCollName}>Resolution</span>
                  {exportType === 'video' && <span className={style.fileCollName}>Duration</span>}
                  <span className={style.fileCollName}>File Size</span>
                </div>

                <div className={style.fileCollBody}>
                  <span className={style.fileColText}>JPEG</span>
                  <span className={style.fileColText}>1920x1080</span>
                  {exportType === 'video' && <span className={style.fileColText}>01:00</span>}
                  {exportType === 'video' ? (
                    <span className={style.fileColText}>20 MB</span>
                  ) : (
                    <span className={style.fileColText}>2 MB</span>
                  )}
                </div>
              </div>
            </div>

            <div className={style.footer}>
              <Button onClick={onClose} className={style.button} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={doExport}
                disabled={videoRecordingStore.isRecording}
                endIcon={<MediumArrowIcon />}
                className={style.button}
                variant="contained"
              >
                Save To Device
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
});

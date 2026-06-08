import { observer } from 'mobx-react-lite';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import style from './Stories.module.scss';

// TODO: unused, refactor and move somewhere else
export const Stories = observer(({ loader }: { loader: boolean }) => {
  const { videoRecordingStore } = useStore();

  return (
    <>
      {loader ? null : (
        <>
          <div className={style.record}>
            {videoRecordingStore.isRecording &&
              `🔴 Recording video, ${videoRecordingStore.seconds} seconds remaining...`}
          </div>
        </>
      )}
    </>
  );
});

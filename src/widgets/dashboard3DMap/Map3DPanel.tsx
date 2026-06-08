import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { useStore } from '../../app/providers/storeProvider/StoreProvider.tsx';
import styles from './Map3D.module.scss';

export const Map3DPanel = observer(() => {
  const { map3DStore, contentLoadStore, locationPanelStore } = useStore();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const secondRender = useRef<boolean>(false);

  useEffect((): void => {
    if (!mapContainer.current) return;
    if (secondRender.current) return;

    const mapRender = async (): Promise<void> => {
      if (!mapContainer.current) return;

      map3DStore.init(mapContainer.current);
      await map3DStore.waitMapStyleLoaded();
      map3DStore.fitToBbox(locationPanelStore.currentLocation.boundingBox, [0, 0], 0);
    };

    mapRender().finally();

    secondRender.current = true;
  }, []);

  useEffect(() => {
    contentLoadStore.setIsContentLoading(true);

    const addLayer = async (): Promise<void> => {
      if (!mapContainer.current) return;

      await map3DStore.waitMapStyleLoaded();
      map3DStore.mapbox?.setFog({
        color: '#040419', // set world background (for aviation)
      });
      map3DStore.addVisualizationLayer();
    };

    addLayer().finally(() => contentLoadStore.setIsContentLoading(false));
  }, []);

  return (
    <>
      <div id="stats" style={{ position: 'absolute', left: 600, top: 2 }} />
      <div className={styles.mapBoxContainer} ref={mapContainer} />
    </>
  );
});

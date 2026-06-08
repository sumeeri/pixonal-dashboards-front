import { observer } from 'mobx-react-lite';

import { useStore } from '../../app/providers/storeProvider/StoreProvider';
import { Mark } from '../../app/stores/infoMarkerStore';
import { MarkerType } from '../../entities/dashboard/types';
import style from './InfoMarker.module.scss';

export const InfoMarker = observer(() => {
  const { infoMarkerStore, locationPanelStore } = useStore();
  const { getMarkPosition } = infoMarkerStore;
  const { currentLocation } = locationPanelStore;

  const getTransform = (el: any): string => {
    const position = getMarkPosition(el.id);

    return `translate(${position.x}px,${position.y - 50}px)  translate(-50%, 0) translate(0, -100%)`;
  };

  const getMarkerSlotByType = (marker: Mark) => {
    switch (marker.type) {
      // TODO: looks like deprecated
      case MarkerType.Top:
        return (
          marker.isShow && (
            <div style={{ left: marker.position[0], top: marker.position[1] }} className={style.topMarker}>
              {/* <StarIcon /> */}
              <span className={style.value}>{marker.value}</span>
              <sup className={style.markSup}>{marker.sup}</sup>
            </div>
          )
        );

      // TODO: looks like not yet used
      case MarkerType.BusStop:
        return (
          marker.isShow && (
            <div
              key={marker.position.join()}
              className={style.busStopMarker}
              style={{ left: marker.position[0], top: marker.position[1] }}
            >
              <span className={style.label}>Entry Point</span>
              <span className={style.value}>{marker.value}</span>
            </div>
          )
        );

      case MarkerType.Location:
        // Note: CSS Capitalize doesn't work on uppercased strings

        const getLocationName = () => {
          let locationName = currentLocation.location;
          if (locationName === 'Western Region') {
            locationName = 'Al Dhafra';
          }

          return locationName;
        };
        const formattedValue = (marker.value ?? getLocationName())?.toLowerCase();
        return (
          marker.isShow && (
            <div
              key={marker.position.join()}
              style={{
                transform: getTransform(marker),
              }}
              className={style.locationMarker}
            >
              {formattedValue}
            </div>
          )
        );
    }
  };

  return infoMarkerStore.data?.map((marker) => getMarkerSlotByType(marker)) ?? [];
});

import { MenuItem } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { transformLocationText } from 'shared/utils/transformLocationText.ts';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import { getLocationTypeDisplayName } from '../../../../app/stores/locationPanelStore.ts';
import { ILocation } from '../../../../entities/locationPanel/types.ts';
import style from './LocationTabContent.module.scss';

const menuItemSx = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginRight: '0.5rem',
  borderRadius: '8px',
  // height: '74px',
  padding: '16px',
  marginBottom: '0',

  '&.Mui-selected': {
    background: '#9DA3DC33',
    border: 'none',
  },
};

const ITEM_HEIGHT = 74; // item height + gap

export const LocationTabContent = observer(
  ({
    data,
    selectLocation,
    type,
  }: {
    data: ILocation[];
    selectLocation: (region: ILocation) => void;
    type: string;
  }) => {
    const { locationPanelStore } = useStore();
    const [selected, setSelected] = useState<string | undefined>(locationPanelStore.locationInPanel?.location);
    const [visibleData, setVisibleData] = useState<ILocation[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = data.length * ITEM_HEIGHT;

    const handleScroll = useCallback(() => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        const endIndex = Math.min(data.length, startIndex + Math.ceil(containerRef.current.clientHeight / ITEM_HEIGHT));
        setVisibleData(data.slice(startIndex, endIndex));
      }
    }, [data]);

    useEffect(() => {
      // Normalize location name for comparison (handle Western Region / Al Dhafra mapping)
      const locationInPanel = locationPanelStore.locationInPanel?.location;
      const normalizedLocationName = locationInPanel === 'Western Region' ? 'Al Dhafra' : locationInPanel;

      setSelected(normalizedLocationName);
      const currentIndex = data.findIndex((item) => item.location === normalizedLocationName);
      containerRef.current?.scrollTo({ top: currentIndex * ITEM_HEIGHT, behavior: 'smooth' });
    }, [locationPanelStore.locationInPanel]);

    useEffect(() => {
      handleScroll();
    }, [handleScroll]);

    const selectItem = (region: ILocation) => {
      selectLocation(region);
    };

    // TODO: visibleData has different data model across location types

    return (
      <>
        <div className={style.suggestionsWrapper} ref={containerRef} onScroll={handleScroll}>
          <span className={style.title}>Suggestions</span>
          <div className={style.menu} style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {visibleData.map((location) => {
              const itemIndex = data.indexOf(location);
              const top = itemIndex * ITEM_HEIGHT;

              return (
                // @ts-expect-error - necessary to load object into value
                <MenuItem
                  key={location.location}
                  onClick={() => selectItem(location)}
                  selected={selected === location.location}
                  value={location}
                  sx={menuItemSx}
                  style={{ top: `${top}px`, width: '95%' }}
                >
                  <div className={style.name}>{transformLocationText(location.location)}</div>
                  <div className={style.type}>{getLocationTypeDisplayName(location) ?? type}</div>
                </MenuItem>
              );
            })}
          </div>
        </div>
      </>
    );
  }
);

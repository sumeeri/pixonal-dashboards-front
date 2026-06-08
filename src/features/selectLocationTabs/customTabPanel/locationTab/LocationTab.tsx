import { Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { SearchInput } from 'shared/ui/searchInput/SearchInput.tsx';

import { useStore } from '../../../../app/providers/storeProvider/StoreProvider.tsx';
import slidesStoreInstance from '../../../../app/stores/slidesStore.ts';
import { accessibleTypesOfLocationForSlide } from '../../../../entities/dashboard/config.ts';
import { ILocation, LocationType } from '../../../../entities/locationPanel/types.ts';
import { LocationTabContent } from '../searchWithItems/LocationTabContent.tsx';
import style from './LocationTab.module.scss';

const FEATURED_LOCATIONS = [
  'Abu Dhabi Island',
  'CBD',
  'AD Island',
  'Khalifa City',
  'Mohamed Bin Zayed City',
  'Musaffah',
  'Al Saadiyat Island',
].map((it) => it.toLowerCase());

export const LocationTab = ({ activeTab }: { activeTab: LocationType }) => {
  const { zones3DStore } = useStore();
  const { locationPanelStore } = useStore();
  const { locationTypeInPanel } = locationPanelStore;
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationsBySearch, setLocationsBySearch] = useState<ILocation[]>([]);

  const selectLocation = (region: ILocation) => {
    if (locationTypeInPanel !== activeTab) {
      locationPanelStore.setLocationTypeInPanel(region.locationType || activeTab);
    }
    locationPanelStore.setLocationInPanel(region);
  };

  const updateSearch = (locations: ILocation[] | undefined) => {
    locations = locations?.map((geometry) => {
      if (geometry.location === 'Western Region') {
        geometry.location = 'Al Dhafra';
      }

      return geometry;
    });

    if (locations) {
      const filteredData = locations.filter((item) => item.location.toLowerCase().includes(search.toLowerCase()));

      if (activeTab === 'district' || activeTab === LocationType.ALL_LOCATIONS) {
        filteredData.sort((itemA, itemB) => {
          const aFeaturedIndex = Number(FEATURED_LOCATIONS.indexOf(itemA.location.toLowerCase()));
          const bFeaturedIndex = Number(FEATURED_LOCATIONS.indexOf(itemB.location.toLowerCase()));
          if (aFeaturedIndex > -1 && bFeaturedIndex > -1) {
            return aFeaturedIndex - bFeaturedIndex;
          } else if (aFeaturedIndex > -1) {
            return -1;
          } else if (bFeaturedIndex > -1) {
            return 1;
          } else {
            return 0;
          }
        });
      } else if (activeTab === 'zone') {
        filteredData.sort((itemA, itemB) => Number(itemA.location) - Number(itemB.location));
      }

      setLocationsBySearch(filteredData);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    let subscribed = true;

    const slide = slidesStoreInstance.currentSlide;

    const typesOfLocation = accessibleTypesOfLocationForSlide(slide!);

    const fun = () =>
      activeTab == LocationType.ALL_LOCATIONS
        ? zones3DStore.getAllLocations(typesOfLocation)
        : zones3DStore.getLocations(activeTab);

    fun()
      .then((locations) => {
        if (subscribed) {
          updateSearch(locations);
          setIsLoading(false);
        }
      })
      .catch(() => setIsLoading(false));

    return () => {
      subscribed = false;
    };
  }, [activeTab, search]);

  return (
    <div className={style.tabPanel}>
      {isLoading ? (
        <>
          <Skeleton variant="rounded" height="50px" />
          <Skeleton variant="rounded" height="50vh" />
        </>
      ) : (
        <>
          <SearchInput value={search} setValue={setSearch} />
          <LocationTabContent data={locationsBySearch} selectLocation={selectLocation} type={activeTab} />
        </>
      )}
    </div>
  );
};

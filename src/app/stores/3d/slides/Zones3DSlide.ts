import { Map as MapBox } from 'mapbox-gl';
import { reaction } from 'mobx';
import { arraysEqual } from 'shared/utils/until.ts';
import { Camera, Group, Raycaster, Scene } from 'three';

import { populationMovementSlides } from '../../../../entities/dashboard/config.ts';
import { LocationType, Zones } from '../../../../entities/locationPanel/types.ts';
import locationPanelStoreInstance from '../../locationPanelStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import zones3DStoreInstance from '../stores/Zones3DStore.ts';
import { ZoneObject3D } from '../ZoneObject3D.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class Zones3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;
  private readonly zonesGroup: Group;

  private hoverZone: ZoneObject3D[] = [];

  private currentLocationType: LocationType = LocationType.EMIRATE;

  private groupCache = new Map<string, Group>();

  private labelsVisible: boolean = true;
  private timeout?: ReturnType<typeof setTimeout>;
  private selectedZone?: ZoneObject3D;

  constructor(private map: MapBox) {
    reaction(
      () => zones3DStoreInstance.zones,
      (zones) => {
        if (zones) this.setZones(zones);
      }
    );

    this.group = new Group();
    this.zonesGroup = new Group();

    this.group.add(this.zonesGroup);
  }
  clearMap(): void {
    // Empty
  }

  onCameraMove(_camera: Camera, zoomLevel: number): void {
    if (!locationPanelStoreInstance.isLocationPanelOpen) {
      let newLocationType = LocationType.EMIRATE;
      if (zoomLevel > 8) {
        newLocationType = LocationType.REGION;
      }
      if (zoomLevel > 10) {
        newLocationType = LocationType.DISTRICT;
      }
      if (zoomLevel > 13) {
        newLocationType = LocationType.ZONE;
      }
      if (newLocationType !== this.currentLocationType) {
        this.currentLocationType = newLocationType;
      }
    }
  }

  raycast(data: SelectData): void {
    if (locationPanelStoreInstance.isLocationPanelOpen) {
      const intersections = data.raycaster.intersectObjects(this.zonesGroup.children.filter((x) => x.visible));

      if (intersections.length > 0) {
        const obj = intersections.find(
          (x) => x.object != this.selectedZone && x.object instanceof ZoneObject3D
        )?.object;
        if (obj instanceof ZoneObject3D) {
          this.selectedZone = obj;
          locationPanelStoreInstance.setLocationInPanel(obj.lacationWithGeometry);
          locationPanelStoreInstance.setLocationTypeInPanel(obj.lacationWithGeometry.locationType);
        }
      }
    }
  }

  deselect(): void {
    // Empty
  }

  async hover(raycaster: Raycaster): Promise<void> {
    if (this.labelsVisible) {
      if (locationPanelStoreInstance.isLocationPanelOpen) {
        const filter: any[] = ['all', true, true];
        if (this.map.getLayer('zone-names-labels')) {
          this.map.setFilter('zone-names-labels', filter);
        }
      } else {
        const selectedId = raycaster.intersectObjects(
          this.zonesGroup.children
            .filter((x) => x.visible)
            .map((x) => x.children)
            .flat(1),
          false
        );

        let newHoverZone: ZoneObject3D[] = [];

        if (selectedId.length > 0) {
          newHoverZone = selectedId
            .map((x) => x.object)
            .filter((x) => x instanceof ZoneObject3D)
            .map((x) => x as ZoneObject3D);
        }

        if (!arraysEqual(this.hoverZone, newHoverZone)) {
          this.hoverZone = newHoverZone;
          if (this.map.getLayer('zone-names-labels')) {
            const filter: any[] =
              this.hoverZone.length > 0
                ? [
                    'match',
                    ['get', 'description'],
                    this.hoverZone.map((x) => x.lacationWithGeometry.location),
                    true,
                    false,
                  ]
                : ['all', true, false];
            this.map.setFilter('zone-names-labels', filter);
          }
        }
      }
    }
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
    this.setLabelsVisible(visible);
  }

  setLabelsVisible(visible: boolean): void {
    this.labelsVisible = visible;
    if (this.map.getLayer('zone-names-labels')) {
      this.map.setLayoutProperty('zone-names-labels', 'visibility', visible ? 'visible' : 'none');
    }
  }

  getKey(locationType: LocationType) {
    const isZoneLocationType = locationType === LocationType.ZONE;

    const keyWordForPMovement =
      isZoneLocationType && zones3DStoreInstance.slide && populationMovementSlides.includes(zones3DStoreInstance.slide)
        ? 'movement'
        : '';

    return locationType + keyWordForPMovement;
  }

  private setZones(zones: Zones) {
    if (zones.locationType === LocationType.CORRIDOR) return;
    this.zonesGroup.children.forEach((x) => (x.visible = false));

    const key = this.getKey(zones.locationType);

    if (this.groupCache.has(key)) {
      this.groupCache.get(key)!.visible = true;
    } else {
      const group = new Group();
      for (const zone of zones.zones) {
        const zoneObject3D = new ZoneObject3D(zone);
        group.add(zoneObject3D);
      }

      this.zonesGroup.add(group);
      this.groupCache.set(key, group);

      if (this.groupCache.size > 6) {
        throw new Error('cache will not grow like this, make sure keys are stable');
      }
    }

    if (this.map.getLayer('zone-names-labels')) this.map.removeLayer('zone-names-labels');
    if (this.map.getSource('zone-names')) this.map.removeSource('zone-names');

    // mapbox updating its cache, without this timeout it will throw errors...
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.map.addSource('zone-names', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: zones.zones.map((x) => ({
            type: 'Feature',
            properties: {
              icon: 'marker',
              description: x.location,
              color: 'white',
            },
            geometry: {
              type: 'Point',
              // TODO: receive center point from json
              coordinates: x.center,
            },
            id: x.location,
          })),
        },
      });

      this.map.addLayer({
        id: 'zone-names-labels',
        type: 'symbol',
        source: 'zone-names',
        minzoom: 5,
        layout: {
          'text-field': ['get', 'description'],
          'text-variable-anchor': ['bottom'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto',
          'icon-image': ['get', 'icon'],
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-width': 2,
          'text-halo-color': '#000536',
        },
      });

      const filter: any[] =
        this.labelsVisible && this.hoverZone.length > 0
          ? ['match', ['get', 'description'], this.hoverZone.map((x) => x.lacationWithGeometry.location), true, false]
          : ['all', true, false];
      this.map.setFilter('zone-names-labels', filter);

      this.map.setLayoutProperty('zone-names-labels', 'visibility', this.labelsVisible ? 'visible' : 'none');
    }, 250);
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);
  }

  uninstall(scene: Scene): void {
    scene.remove(this.group);
  }
}

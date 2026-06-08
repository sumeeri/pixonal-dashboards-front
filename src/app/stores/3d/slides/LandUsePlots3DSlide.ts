import { Map as MapBox } from 'mapbox-gl';
import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Camera, Color, Group, Scene } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import {
  LandUseGeometryBase,
  LandUsePlotData,
  LandUsePlotId,
  LandUseZoneData,
  LandUseZoneId,
} from '../landUse/LandUseDataTypes.ts';
import { LandUseDisplayGroup } from '../landUse/LandUseDisplayGroup.ts';
import { getColorForPlot, getColorForZone } from '../landUse/LandUseObject3D.ts';
import landUsePlots3DStoreInstance from '../stores/LandUsePlots3DStore.ts';
import landUseZones3DStoreInstance from '../stores/LandUseZones3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class LandUsePlots3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;

  private landUseDisplay: LandUseDisplayGroup;

  constructor(
    private mapbox: MapBox,
    private camera: Camera,
    private slide: Slide
  ) {
    reaction(
      () => landUsePlots3DStoreInstance.current,
      (buildings) => {
        if (buildings) this.setBuildings(buildings);
      }
    );

    reaction(
      () => landUseZones3DStoreInstance.current,
      (zones) => {
        if (zones) this.setZones(zones);
      }
    );

    this.group = new Group();

    this.landUseDisplay = new LandUseDisplayGroup();
    this.group.add(this.landUseDisplay);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;

    if (visible) {
      this.deselectAll();
    }
  }

  private setZones(buildings: Map<LandUseZoneId, LandUseZoneData>) {
    const map = new Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>();

    const totalGfa = Array.from(buildings.values()).reduce((sum, b) => sum + (Number(b.gfa) || 0), 0);

    for (const [key, building] of buildings.entries()) {
      map.set(key, [building, getColorForZone(landUsePlots3DStoreInstance.slide!, building, totalGfa)]);
    }

    this.landUseDisplay.setData(map, map, undefined);
  }

  private setBuildings(buildings: Map<LandUsePlotId, LandUsePlotData>) {
    const map = new Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>();

    for (const [key, building] of buildings.entries()) {
      map.set(key, [building, getColorForPlot(landUsePlots3DStoreInstance.slide!, building)]);
    }

    this.landUseDisplay.setData(map, map, undefined);
  }

  async install(scene: Scene): Promise<void> {
    scene.add(this.group);

    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'none');
  }

  uninstall(scene: Scene): void {
    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'visible');

    scene.remove(this.group);
  }

  onCameraMove(): void {
    // Empty
  }

  clearMap(): void {
    this.landUseDisplay.clear();
  }

  raycast(data: SelectData): void {
    const raycastResult = this.landUseDisplay.raycast(data.raycaster);

    if (raycastResult) {
      const [id, intersection] = raycastResult;
      if (landUsePlots3DStoreInstance.dataType == DataType.LAND_USE_TYPE_PLOT) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          const param = landUsePlots3DStoreInstance.current.get(Number(id))!;

          if (landUsePlots3DStoreInstance.slide === Slide.LAND_USE_EDUCATION) {
            infoPopupStoreInstance.data = {
              slideGroup: 'main',
              slide: landUsePlots3DStoreInstance.slide!,
              param: param,
              tooltipData: param,
            };
          } else {
            infoPopupStoreInstance.data = {
              slideGroup: 'landuse plot',
              slide: landUsePlots3DStoreInstance.slide!,
              param: param,
              tooltipData: {
                plotName: param.plotName,
                sector: param.sectorName,
              },
            };
          }

          infoPopupStoreInstance.worldPosition = intersection.point;
        });
      } else if (landUsePlots3DStoreInstance.dataType === DataType.LAND_USE_TYPE_ZONE) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          const param = landUseZones3DStoreInstance.current.get(id.toString())!;

          infoPopupStoreInstance.data = {
            slideGroup: 'landuse zone',
            slide: landUseZones3DStoreInstance.slide!,
            param: param,
          };

          infoPopupStoreInstance.worldPosition = intersection.point;
        });
      }
    } else {
      this.deselectAll();
    }
  }

  private deselectAll() {
    for (const child of this.group.children) {
      child.visible = true;
    }

    this.deselect();
  }

  deselect() {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}

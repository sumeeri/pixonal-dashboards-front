import { Map as MapBox } from 'mapbox-gl';
import { reaction, runInAction } from 'mobx';
import { Color, Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import {
  ConsumptionGood,
  LandUseConsumptionPlotData,
  LandUseGeometryBase,
  LandUsePlotData,
  LandUsePlotId,
  LandUseZoneId,
} from '../landUse/LandUseDataTypes.ts';
import { LandUseDisplayGroup } from '../landUse/LandUseDisplayGroup.ts';
import { getColorForConsumptionPlot, getColorForUtilizationPlot } from '../landUse/LandUseObject3D.ts';
import landUseConsumptionPlot3DStoreInstance from '../stores/LandUseConsumptionPlot3DStore.ts';
import landUsePlots3DStoreInstance from '../stores/LandUsePlots3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class LandUseConsumptionPlot3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;

  private landUseDisplay: LandUseDisplayGroup;

  private plotsMap = new Map<string, LandUseConsumptionPlotData>();

  constructor(
    private consumptionType: ConsumptionGood,
    private mapbox: MapBox,
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera
  ) {
    reaction(
      () => mapDataValuesStoreInstance.dataType,
      () => {
        this.deselect();
      }
    );
    reaction(
      () => landUseConsumptionPlot3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current } = currentTarget;
          this.setConsumpotionPlots(current);
        }
      }
    );
    reaction(
      () => landUsePlots3DStoreInstance.current,
      (current) => {
        if (current) {
          this.setUtilizationPlots(current);
        }
      }
    );

    this.group = new Group();

    this.landUseDisplay = new LandUseDisplayGroup();
    this.group.add(this.landUseDisplay);
  }

  clearMap(): void {
    this.landUseDisplay.clear();
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  async install(scene: Scene) {
    scene.add(this.group);

    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'none');

    landUseConsumptionPlot3DStoreInstance.consumptionGood = this.consumptionType;
  }

  uninstall(scene: Scene) {
    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'visible');

    scene.remove(this.group);
  }

  init(): void {}

  private setConsumpotionPlots(plots: Map<string, LandUseConsumptionPlotData>) {
    this.plotsMap = plots;

    const map = new Map<string, [LandUseGeometryBase, [Color, number]]>();

    for (const [key, plot] of plots.entries()) {
      map.set(key, [plot, getColorForConsumptionPlot(landUseConsumptionPlot3DStoreInstance.slide!, plot)]);
    }

    this.landUseDisplay.setData(map, map, undefined);
  }

  private setUtilizationPlots(plots: Map<LandUsePlotId, LandUsePlotData>) {
    const map = new Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>();

    for (const [key, plot] of plots.entries()) {
      map.set(key, [plot, getColorForUtilizationPlot(1000)]);
    }

    this.landUseDisplay.setData(map, map, undefined);
  }

  onCameraMove(): void {
    // Empty
  }

  raycast(data: SelectData): void {
    const result = this.landUseDisplay.raycast(data.raycaster);

    if (result) {
      const [id, intersecton] = result;
      if (typeof id === 'string') {
        const plot = this.plotsMap.get(id)!;

        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          switch (this.consumptionType) {
            case ConsumptionGood.Water:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.LAND_USE_WATER_CONSUMPTION,
                paramPlot: plot,
              };
              break;
            case ConsumptionGood.Electricity:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.LAND_USE_ELECTRICITY_CONSUMPTION,
                paramPlot: plot,
              };
              break;
          }

          const centerPos = intersecton.point;
          infoPopupStoreInstance.worldPosition = centerPos;
        });
      }
    } else {
      this.deselect();
    }
  }

  deselect(): void {
    this.landUseDisplay.deselect();
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}

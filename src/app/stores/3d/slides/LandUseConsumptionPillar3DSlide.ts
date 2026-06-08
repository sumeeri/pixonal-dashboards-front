import { Map as MapBox } from 'mapbox-gl';
import { reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Color, Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import {
  ConsumptionGood,
  LandUseConsumptionPillarData,
  LandUseConsumptionPlotData,
  LandUseGeometryBase,
  LandUsePlotId,
  LandUseZoneId,
} from '../landUse/LandUseDataTypes.ts';
import { LandUseDisplayGroup } from '../landUse/LandUseDisplayGroup.ts';
import { getColorForUtilizationPlot } from '../landUse/LandUseObject3D.ts';
import MapUtils from '../MapUtils.ts';
import { PillarsGroup } from '../pillars/PillarsGroup.ts';
import settingsState from '../SettingsState.ts';
import landUseConsumption3DStore from '../stores/LandUseConsumptionPillar3DStore.ts';
import landUseConsumptionPlot3DStoreInstance from '../stores/LandUseConsumptionPlot3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

export default class LandUseConsumptionPillar3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly group: Group;

  private readonly pillars: PillarsGroup;
  private landUseDisplay: LandUseDisplayGroup;
  private plotsMap = new Map<string, LandUseConsumptionPlotData>();

  private pillarsMap = new Map<number, LandUseConsumptionPillarData>();

  constructor(
    private consumptionType: ConsumptionGood,
    private mapbox: MapBox,
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera
  ) {
    reaction(
      () => mapDataValuesStoreInstance.dataType,
      (dataType) => {
        this.deselect();
        this.setDataType(dataType);
      }
    );
    reaction(
      () => landUseConsumption3DStore.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current, target } = currentTarget;
          this.setPillarsParamsData(current, target);
        }
      }
    );
    reaction(
      () => landUseConsumptionPlot3DStoreInstance.currentTarget,
      (currentTarget) => {
        if (currentTarget) {
          const { current } = currentTarget;
          this.setPlots(current);
        }
      }
    );
    reaction(
      () => landUseConsumption3DStore.k,
      (k) => {
        this.updatePillarsAnimation(k);
      }
    );

    this.group = new Group();

    this.pillars = new PillarsGroup(settingsState.landUsePillars);
    this.pillars.position.set(0, 0, 5);
    this.group.add(this.pillars);

    this.landUseDisplay = new LandUseDisplayGroup();
    this.group.add(this.landUseDisplay);
  }

  setVisible(visible: boolean): void {
    this.pillars.visible = visible;
  }

  private setDataType(dataType?: DataType) {
    switch (dataType) {
      case DataType.RESIDENTIAL:
      case DataType.COMMERCIAL:
      case DataType.APARTMENTS:
      case DataType.VILLAS:
      case DataType.OFFICES:
      case DataType.SHOPS:
        this.pillars.visible = true;
        this.landUseDisplay.visible = false;
        break;
      case DataType.UTILIZATION:
        this.pillars.visible = false;
        this.landUseDisplay.visible = true;
        break;
    }
  }

  async install(scene: Scene) {
    scene.add(this.group);

    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'none');

    landUseConsumption3DStore.consumptionGood = this.consumptionType;
  }

  uninstall(scene: Scene) {
    this.mapbox.setLayoutProperty('building-extrusion', 'visibility', 'visible');

    scene.remove(this.group);
  }

  init(): void {}

  setPillarsParamsData(
    current: Map<number, LandUseConsumptionPillarData>,
    target: Map<number, LandUseConsumptionPillarData>
  ) {
    this.pillarsMap = current;

    const pillarsPositions = new Map<number, [number, number]>();
    const pillarsValuesCurrent = new Map<number, number>();
    const pillarsValuesTarget = new Map<number, number>();
    for (const [id, param] of current) {
      pillarsPositions.set(id, param.point);
      pillarsValuesCurrent.set(id, param.valueNormalized);
    }
    for (const [id, param] of target) {
      pillarsValuesTarget.set(id, param.valueNormalized);
    }

    this.pillars.create(pillarsPositions);
    this.pillars.setData(pillarsValuesCurrent, pillarsValuesTarget);
  }

  private setPlots(plots: Map<string, LandUseConsumptionPlotData>) {
    this.plotsMap = plots;

    const map = new Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>();

    for (const [key, plot] of plots.entries()) {
      map.set(key, [plot, getColorForUtilizationPlot(plot.value)]);
    }

    this.landUseDisplay.setData(map, map, undefined);
  }

  clearMap(): void {
    this.pillars.clearMapDisplay();
  }

  updatePillarsAnimation(k: number) {
    this.pillars.updateAnimation(k);
  }

  onCameraMove(): void {
    // Empty
  }

  raycast(data: SelectData): void {
    if (this.pillars.visible) {
      const pillarID = this.pillars.raycastSelectData(data, this.renderer, this.camera);

      if (pillarID !== undefined) {
        const pillar = this.pillarsMap.get(pillarID)!;

        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          switch (this.consumptionType) {
            case ConsumptionGood.Water:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.LAND_USE_WATER_CONSUMPTION,
                paramPillar: pillar,
              };
              break;
            case ConsumptionGood.Electricity:
              infoPopupStoreInstance.data = {
                slideGroup: 'main',
                slide: Slide.LAND_USE_ELECTRICITY_CONSUMPTION,
                paramPillar: pillar,
              };
              break;
          }

          const centerPos = MapUtils.getPositionFromWgs(...pillar.point, pillar.valueNormalized * 1000);
          infoPopupStoreInstance.worldPosition = centerPos;
        });
      } else {
        this.deselect();
      }
    } else if (this.landUseDisplay.visible) {
      const result = this.landUseDisplay.raycast(data.raycaster);

      if (result !== undefined) {
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
  }

  deselect(): void {
    this.pillars.deselect();
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });
  }
}

import { Map as MapBox } from 'mapbox-gl';
import { IReactionDisposer, reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { MathUtils } from 'three/src/math/MathUtils';

import { typesOfMostUsed } from '../../../../entities/dashboard/config.ts';
import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { CongestionFenceData, CongestionParamsData, FenceId } from '../congestion/data/CongestionDataTypes.ts';
import { Fence } from '../congestion/data/Fence.ts';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData.ts';
import FenceGroup from '../congestion/FenceGroup.ts';
import FenceInfoIcons from '../congestion/FenceInfoIcons.ts';
import { DensityFormula } from '../congestion/fenceParamFormulas/DensityFormula.ts';
import IFenceParamFormula from '../congestion/fenceParamFormulas/IFenceParamFormula.ts';
import { RelativeSpeedFormula } from '../congestion/fenceParamFormulas/RelativeSpeedFormula.ts';
import { SpeedFormula } from '../congestion/fenceParamFormulas/SpeedFormula.ts';
import { VolumeFormula } from '../congestion/fenceParamFormulas/VolumeFormula.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { BlurRenderPass, MapboxRenderPass, RenderPass, SceneRenderPass } from '../passes';
import { PillarsGroup } from '../pillars/PillarsGroup.ts';
import settingsState from '../SettingsState.ts';
import congestion3DStore from '../stores/Congestion3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

const NORMALIZING_FACTOR = 10000;

export default class Congestion3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly fenceMap: Map<number, Fence>;
  private paramFormula: IFenceParamFormula<CongestionParamsData>;
  private readonly paramFormulaInfoIcons: IFenceParamFormula<CongestionParamsData>;

  private composer?: EffectComposer;

  private readonly group: Group;

  private readonly fenceGroup: FenceGroup<CongestionParamsData>;
  private readonly fenceInfoIcons: FenceInfoIcons<CongestionParamsData>;

  private reactionDisposers: IReactionDisposer[] = [];

  private readonly pillarsGroup: PillarsGroup;
  private mapPillar = new Map<number, number>();
  private maxValue: number = 0;

  constructor(
    private mapbox: MapBox,
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera
  ) {
    this.group = new Group();

    this.fenceMap = new Map<number, Fence>();
    this.paramFormula = new RelativeSpeedFormula();
    this.paramFormulaInfoIcons = new RelativeSpeedFormula();

    this.fenceGroup = new FenceGroup(this.paramFormula);
    this.fenceGroup.name = 'FenceGroup';
    this.group.add(this.fenceGroup);

    this.fenceInfoIcons = new FenceInfoIcons();
    this.group.add(this.fenceInfoIcons);

    this.pillarsGroup = new PillarsGroup(settingsState.busStopPillars);
    this.group.add(this.pillarsGroup);
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  async install(scene: Scene) {
    scene.add(this.group);

    this.reactionDisposers = [
      reaction(
        () => mapDataValuesStoreInstance.dataType,
        (dataType) => {
          if (dataType) {
            this.deselect();
            this.setDataType(dataType);
          }
        }
      ),
      reaction(
        () => congestion3DStore.fenceData,
        (fenceData) => {
          if (fenceData) this.setFenceData(fenceData);
          this.init();
        }
      ),
      reaction(
        () => congestion3DStore.currentTarget,
        (currentTarget) => {
          if (currentTarget) {
            const { current, target } = currentTarget;
            this.setFenceParamsData(current, target);
          }
        }
      ),
      reaction(
        () => congestion3DStore.k,
        (k) => {
          this.updateFenceAnimation(k);
        }
      ),
    ];
  }

  uninstall(scene: Scene) {
    scene.remove(this.group);

    this.reactionDisposers.forEach((x) => x());
    this.reactionDisposers = [];
  }

  private setDataType(dataType?: DataType) {
    switch (dataType) {
      case DataType.RELATIVE_SPEED:
        this.paramFormula = new RelativeSpeedFormula();
        break;
      case DataType.SPEED:
        this.paramFormula = new SpeedFormula();
        break;
      case DataType.VOLUME:
        this.paramFormula = new VolumeFormula();
        break;
      case DataType.DENSITY:
        this.paramFormula = new DensityFormula();
        break;
    }
  }

  init(): void {
    this.composer = new EffectComposer(this.renderer);

    if (this.mapbox) {
      this.composer.addPass(new MapboxRenderPass(this.mapbox));
    }
    this.composer.addPass(new SceneRenderPass(this.group, this.camera));
    this.composer.addPass(new BlurRenderPass(this.group, this.camera));
    this.composer.addPass(new RenderPass());

    this.fenceGroup.create(this.fenceMap);
    this.fenceInfoIcons.create(this.fenceMap);
  }

  private setFenceData(fenceData: IFenceGeometryData): void {
    this.clearMap();

    fenceData.fenceList.forEach((fence: CongestionFenceData, faceIndex: number) => {
      const fenceObject = new Fence(fence.id, fence, faceIndex);
      this.fenceMap.set(fence.id, fenceObject);
    });
  }

  private setFenceParamsData(
    current: Map<FenceId, CongestionParamsData>,
    target: Map<FenceId, CongestionParamsData>
  ): void {
    if (typesOfMostUsed.includes(congestion3DStore.dataType!)) {
      this.fenceInfoIcons.clear();

      const pillarsPositions = new Map<number, [number, number]>();
      const pillarsValues = new Map<number, number>();

      const valuesCount = [];
      for (const [_, zone] of current) {
        valuesCount.push(zone.flow);
      }
      this.maxValue = Math.max(...valuesCount);

      let i = 0;
      for (const [id, param] of current) {
        this.mapPillar.set(i++, id);

        pillarsPositions.set(id, [param.geometry[0], param.geometry[1]]);
        pillarsValues.set(id, MathUtils.clamp(param.flow / this.maxValue, 0, 1));
      }
      this.pillarsGroup.create(pillarsPositions);
      this.pillarsGroup.setData(pillarsValues, pillarsValues);
    } else {
      this.fenceInfoIcons.setData(current, target, this.paramFormulaInfoIcons);
      this.fenceGroup.setData(current, target, this.paramFormula);
    }
  }

  clearMap() {
    this.fenceInfoIcons.clearMapDisplay();
    this.fenceGroup.clearMapDisplay();
    this.pillarsGroup.clearMapDisplay();
  }

  onCameraMove(): void {
    const scale: number = this.calcHeightMultiplierFromZoom();
    this.fenceGroup.scale.set(1, 1, scale);
    this.fenceGroup.updateMatrix();
    this.fenceInfoIcons.scale.set(1, 1, scale);
    this.fenceInfoIcons.updateMatrix();

    this.fenceInfoIcons.updateClippingPlane(this.camera);

    if (!this.mapbox) throw Error('map is null');

    // Pitch angle. 0 - ground
    let pitchAngle: number = Math.round(90 - this.mapbox.getPitch());
    if (pitchAngle > 89) pitchAngle = 90;
    if (pitchAngle < 6) pitchAngle = 0;

    this.fenceGroup.onCameraMove(this.camera.position, pitchAngle);
  }

  updateFenceAnimation(k: number) {
    this.fenceGroup.updateAnimation(k);
  }

  raycast(data: SelectData): void {
    // Check pillars first (for bus stop visualizations)
    const pillarId = this.pillarsGroup.raycastSelectData(data, this.renderer, this.camera);
    const pointId = this.mapPillar.get(pillarId!);
    const pillarParam = congestion3DStore.currentTarget.current.get(pointId!);
    if (pillarParam) {
      runInAction(() => {
        infoPopupStoreInstance.isShown = true;

        infoPopupStoreInstance.data = {
          slideGroup: 'main',
          slide: Slide.ROAD_TRAFFIC,
          param: pillarParam,
          dataType: mapDataValuesStoreInstance.dataType!,
        };

        const centerPos = MapUtils.getPositionFromWgs(...[pillarParam.geometry[0], pillarParam.geometry[1]]);
        centerPos.z = MathUtils.clamp(pillarParam.flow / 5, 0, 2000);
        infoPopupStoreInstance.worldPosition = centerPos;
      });
      return;
    }

    // Raycast fences and info icons
    let raycastResult: [FenceId, any] | undefined;

    if (settingsState.congestion.canSelectOnlyUnusual) {
      // Only check info icons when this setting is enabled
      raycastResult = this.fenceInfoIcons.raycast(data.raycaster);
    } else {
      // Check both fences and info icons, prioritize the closest hit
      const fenceResult = this.fenceGroup.raycast(data.raycaster);
      const iconResult = this.fenceInfoIcons.raycast(data.raycaster);

      // If both hit something, choose the one with the closer intersection
      if (fenceResult && iconResult) {
        raycastResult = fenceResult[1].distance <= iconResult[1].distance ? fenceResult : iconResult;
      } else {
        raycastResult = fenceResult ?? iconResult;
      }
    }

    if (raycastResult) {
      const [selectedFenceId] = raycastResult;
      const fence = this.fenceMap.get(selectedFenceId);
      const fenceParam = congestion3DStore.currentTarget.current.get(selectedFenceId);
      if (fence && fenceParam) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.ROAD_TRAFFIC,
            param: fenceParam,
            fence: fence,
            dataType: mapDataValuesStoreInstance.dataType!,
          };

          const scale: number = this.calcHeightMultiplierFromZoom();
          const centerPos = fence.getPopupPoint(this.paramFormula, fenceParam);
          centerPos.z *= scale;
          infoPopupStoreInstance.worldPosition = centerPos;
        });

        this.fenceGroup.select(selectedFenceId);
        this.fenceInfoIcons.select(selectedFenceId);

        const canvas: HTMLCanvasElement = this.mapbox.getCanvas();
        const height = canvas.clientHeight;

        const zoomLevel = MapUtils.fittingZoomLevel(fence.getPoint(0).sub(fence.getPoint(1)).length(), 17);

        this.moveToEvent?.({
          pointOfInterest: fence.getPopupPoint(this.paramFormula, fenceParam),
          zoom: zoomLevel,
          offset: [0, height * 0.15],
          resetRotation: false,
        });
      } else {
        this.deselect();
      }
    } else {
      this.deselect();
    }
  }

  deselect(): void {
    runInAction(() => {
      infoPopupStoreInstance.isShown = false;
    });

    this.fenceGroup.deselect();
    this.fenceInfoIcons.deselect();
  }

  private calcHeightMultiplierFromZoom(): number {
    if (!this.mapbox) return 0;
    const zoom: number = this.mapbox.getZoom() ?? 20;
    return MathUtils.clamp(Math.pow(20 - zoom, 2) / 20, 1, 5);
  }
}

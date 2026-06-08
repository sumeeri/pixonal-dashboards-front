import { Map as MapBox } from 'mapbox-gl';
import { IReactionDisposer, reaction, runInAction } from 'mobx';
import { DataType } from 'shared/constants/mapDataParams.ts';
import { Group, MathUtils, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { Slide } from '../../../../entities/dashboard/types.ts';
import infoPopupStoreInstance from '../../infoPopupStore.ts';
import mapDataValuesStoreInstance from '../../mapDataValuesStore.ts';
import { BusLineUtilizationParamsData, BusWithinParamsData } from '../busAndTaxi/BusAndTaxiDataTypes.ts';
import { CongestionFenceData, FenceId } from '../congestion/data/CongestionDataTypes.ts';
import { Fence } from '../congestion/data/Fence.ts';
import { IFenceGeometryData } from '../congestion/data/IFenceGeometryData.ts';
import FenceGroup from '../congestion/FenceGroup.ts';
import FenceInfoIcons from '../congestion/FenceInfoIcons.ts';
import IFenceParamFormula from '../congestion/fenceParamFormulas/IFenceParamFormula.ts';
import { IMoveToEvent } from '../IMoveToEvent.ts';
import MapUtils from '../MapUtils.ts';
import { BlurRenderPass, MapboxRenderPass, RenderPass, SceneRenderPass } from '../passes';
import { PillarsGroup } from '../pillars/PillarsGroup.ts';
import settingsState from '../SettingsState.ts';
import busLineUtilizationStoreInstance from '../stores/BusLineUtilizationStore.ts';
import busStops3DStoreInstance from '../stores/BusStops3DStore.ts';
import { I3DSlide, SelectData } from './I3DSlide.ts';

class Formula implements IFenceParamFormula<BusLineUtilizationParamsData> {
  calculateHeight(_param: BusLineUtilizationParamsData, _fence: CongestionFenceData): number {
    return (this.calculateHeightAsByte(_param, _fence) / 255) * 200;
  }
  calculateHeightAsByte(param: BusLineUtilizationParamsData, _fence: CongestionFenceData): number {
    return MathUtils.clamp(MathUtils.inverseLerp(0, 100, param.passengers), 0, 1) * 255;
  }
  calculateColorByteEncoded(param: BusLineUtilizationParamsData, _fence: CongestionFenceData): number {
    return MathUtils.clamp(MathUtils.inverseLerp(0, 0.5, param.loadFactor ?? 0), 0, 1) * 5 + 1;
  }
}

export default class BusLine3DSlide implements I3DSlide {
  public moveToEvent?: (pos: IMoveToEvent) => void;

  private readonly fenceMap: Map<number, Fence>;
  private paramFormula: IFenceParamFormula<BusLineUtilizationParamsData>;
  private readonly paramFormulaInfoIcons: IFenceParamFormula<BusLineUtilizationParamsData>;

  private composer?: EffectComposer;

  private readonly group: Group;

  private readonly fenceGroup: FenceGroup<BusLineUtilizationParamsData>;
  private readonly fenceInfoIcons: FenceInfoIcons<BusLineUtilizationParamsData>;

  private reactionDisposers: IReactionDisposer[] = [];

  private readonly pillarsGroup: PillarsGroup;
  private mapPillar = new Map<number, number>();

  constructor(
    private mapbox: MapBox,
    private renderer: WebGLRenderer,
    private camera: PerspectiveCamera
  ) {
    this.group = new Group();

    this.fenceMap = new Map<number, Fence>();
    this.paramFormula = new Formula();
    this.paramFormulaInfoIcons = new Formula();

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
        () => busLineUtilizationStoreInstance.fenceData,
        (fenceData) => {
          if (fenceData) this.setFenceData(fenceData);
          this.init();
        }
      ),
      reaction(
        () => busLineUtilizationStoreInstance.currentTarget,
        (currentTarget) => {
          if (currentTarget) {
            const { current, target } = currentTarget;
            this.setFenceParamsData(current, target);
          }
        }
      ),
      reaction(
        () => busStops3DStoreInstance.currentTarget,
        (currentTarget) => {
          if (currentTarget && busLineUtilizationStoreInstance.dataType === DataType.BUS_STOPS) {
            const { current, target } = currentTarget;
            this.setPillarsParamsData(current, target);
          }
        }
      ),
      reaction(
        () => busLineUtilizationStoreInstance.k,
        (k) => {
          this.updateFenceAnimation(k);
        }
      ),
      reaction(
        () => busStops3DStoreInstance.k,
        (k) => {
          this.updatePillarsAnimation(k);
        }
      ),
    ];
  }

  uninstall(scene: Scene) {
    scene.remove(this.group);

    this.reactionDisposers.forEach((x) => x());
    this.reactionDisposers = [];
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
    this.clearMovesDisplay();

    fenceData.fenceList.forEach((fence: CongestionFenceData, faceIndex: number) => {
      const fenceObject = new Fence(fence.id, fence, faceIndex);
      this.fenceMap.set(fence.id, fenceObject);
    });
  }
  private clearMovesDisplay() {
    this.fenceMap.clear();
    this.pillarsGroup.create(new Map<number, [number, number]>());
  }

  private setFenceParamsData(
    current: Map<FenceId, BusLineUtilizationParamsData>,
    target: Map<FenceId, BusLineUtilizationParamsData>
  ): void {
    this.fenceInfoIcons.setData(current, target, this.paramFormulaInfoIcons);
    this.fenceGroup.setData(current, target, this.paramFormula);
  }

  private setPillarsParamsData(
    current: Map<number, BusWithinParamsData>,
    _target: Map<number, BusWithinParamsData>
  ): void {
    const pillarsPositions = new Map<number, [number, number]>();
    const pillarsValues = new Map<number, number>();

    let i = 0;
    for (const [id, param] of current) {
      this.mapPillar.set(i++, id);
      pillarsPositions.set(id, [param.busStop.geometry[1], param.busStop.geometry[0]]);
      pillarsValues.set(id, MathUtils.clamp(param.count / 10, 0, 1));
    }
    this.pillarsGroup.create(pillarsPositions);
    this.pillarsGroup.setData(pillarsValues, pillarsValues);
  }

  clearMap(): void {
    this.pillarsGroup.clearMapDisplay();
    this.fenceGroup.clearMapDisplay();
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

  updatePillarsAnimation(k: number) {
    this.pillarsGroup.updateAnimation(k);
  }

  raycast(data: SelectData): void {
    const raycastResult = this.fenceGroup.raycast(data.raycaster);

    const pillarId = this.pillarsGroup.raycastSelectData(data, this.renderer, this.camera);
    const pointId = this.mapPillar.get(pillarId!);
    const pillarParam = busStops3DStoreInstance.currentTarget.current.get(pointId!);

    if (pillarParam) {
      runInAction(() => {
        infoPopupStoreInstance.isShown = true;

        infoPopupStoreInstance.data = {
          slideGroup: 'main',
          slide: Slide.BUS_LINE_UTILIZATION,
          paramPillars: pillarParam,
          dataType: mapDataValuesStoreInstance.dataType!,
        };

        const centerPos = MapUtils.getPositionFromWgs(
          ...[pillarParam.busStop.geometry[1], pillarParam.busStop.geometry[0]]
        );
        centerPos.z = MathUtils.clamp(pillarParam.count * 200, 0, 2000);
        infoPopupStoreInstance.worldPosition = centerPos;
      });
    }

    if (raycastResult && !pillarParam) {
      const [selectedFenceId] = raycastResult;
      const fence = this.fenceMap.get(selectedFenceId);
      const param = busLineUtilizationStoreInstance.currentTarget.current.get(selectedFenceId);
      if (fence && param) {
        runInAction(() => {
          infoPopupStoreInstance.isShown = true;

          infoPopupStoreInstance.data = {
            slideGroup: 'main',
            slide: Slide.BUS_LINE_UTILIZATION,
            fence: fence,
            paramFence: param,
            dataType: mapDataValuesStoreInstance.dataType!,
          };

          const scale: number = this.calcHeightMultiplierFromZoom();
          const centerPos = fence.getPopupPoint(this.paramFormula, param);
          centerPos.z *= scale;
          infoPopupStoreInstance.worldPosition = centerPos;
        });

        this.fenceGroup.select(selectedFenceId);
        this.fenceInfoIcons.select(selectedFenceId);

        const canvas: HTMLCanvasElement = this.mapbox.getCanvas();
        const height = canvas.clientHeight;

        const zoomLevel = MapUtils.fittingZoomLevel(fence.getPoint(0).sub(fence.getPoint(1)).length(), 17);

        this.moveToEvent?.({
          pointOfInterest: fence.getPopupPoint(this.paramFormula, param),
          zoom: zoomLevel,
          offset: [0, height * 0.15],
          resetRotation: false,
        });
      } else {
        this.deselect();
      }
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

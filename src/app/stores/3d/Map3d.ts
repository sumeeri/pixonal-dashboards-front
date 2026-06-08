// init custom shaders
import './shaders';

import * as TWEEN from '@tweenjs/tween.js';
import _ from 'lodash';
import { type LngLat, type LngLatBoundsLike, type LngLatLike, Map as MapBox, type PointLike } from 'mapbox-gl';
import type { ImageSource } from 'merge-images';
import { autorun, makeObservable, observable, reaction, runInAction } from 'mobx';
import { until } from 'shared/utils/until.ts';
import {
  AmbientLight,
  DirectionalLight,
  Group,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  Path,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { MathUtils } from 'three/src/math/MathUtils';

import { Slide } from '../../../entities/dashboard/types.ts';
import type { ILocation, PolygonWithHoles } from '../../../entities/locationPanel/types.ts';
import locationPanelStoreInstance from '../locationPanelStore.ts';
import mapDataValuesStoreInstance from '../mapDataValuesStore.ts';
import mobilityOverviewPanelStoreInstance from '../mobilityOverviewPanelStore.ts';
import timeIntervalsStoreInstance from '../timeIntervalsStore.ts';
import { getCameraLocationForSlide, getCustomZoomForLocation } from './CameraPositions.ts';
import { setUniformFenceLineMaterial } from './congestion/materials/FenceLineMaterial.ts';
import { setUniformFenceMaterial } from './congestion/materials/FenceMaterial.ts';
import type { IMoveToEvent } from './IMoveToEvent.ts';
import type { IStartPoint } from './IStartPoint.ts';
import {
  addBuildings,
  lightTarget,
  regionPolygonFillMaterial,
  regionPolygonLineMaterial,
  shadowMesh,
  viewCenterMesh,
} from './Map3dObjects.ts';
import MapUtils from './MapUtils.ts';
import settingsState from './SettingsState.ts';
import type { I3DSlide } from './slides/I3DSlide.ts';
import Zones3DSlide from './slides/Zones3DSlide.ts';
import zones3DStoreInstance from './stores/Zones3DStore.ts';
import { prepareGeometry } from './ZoneGeometry.ts';

const key: string = '';

enum MapInteractionMode {
  Free,
  FixedWobble,
}

export class Map3D {
  public mapbox: MapBox | null = null;
  public camera: PerspectiveCamera;
  public cameraUpdateFrames: number = 0;
  public renderer: WebGLRenderer;
  public isInitialized: boolean = false;
  private readonly scene: Scene;
  private readonly buildingsGroup: Group;

  private light: DirectionalLight = new DirectionalLight(settingsState.light.color, settingsState.light.intensity);

  private pointerDown?: Vector2;
  private pointerMove?: Vector2;

  private readonly raycaster: Raycaster;

  // Canvas size
  private width!: number;
  private height!: number;

  private currentCameraMatrix: Matrix4 = new Matrix4();
  private cameraDirection: Vector3 = new Vector3();

  public cameraPitch: number = 0;
  public uiCompassMatrix: string = '1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1';

  private current3DSlide?: I3DSlide;
  private zones3DSlide?: I3DSlide;

  private regionPolygonGroup: Group = new Group();

  private slideVisible: boolean = true;

  private fixedWobbleTween?: TWEEN.Tween<{ t: number }>;

  private currentSlide: Slide | undefined;

  private isZoomChangingToAviation: boolean = false;

  private previousZoom: number | null = null;

  constructor() {
    makeObservable(this, {
      mapbox: observable,
      camera: observable,
      cameraUpdateFrames: observable,
      cameraPitch: observable,
      uiCompassMatrix: observable,
      isInitialized: observable,
    });

    autorun(() => {
      this.updateBordersVisibility();
    });

    reaction(
      () => locationPanelStoreInstance.isLocationPanelOpen,
      async () => {
        this.showLocation(locationPanelStoreInstance.currentLocation, false);
      }
    );

    reaction(
      () => locationPanelStoreInstance.locationInPanel,
      async (value) => {
        if (value) {
          await this.showLocation(value, true);
        }
      }
    );

    reaction(
      () => locationPanelStoreInstance.currentLocation,
      async (value) => {
        if (value) {
          // console.log('Location changed:', value.locationType, '-', value.location);
          await this.showLocation(value, false);
        }
      }
    );

    reaction(
      () => timeIntervalsStoreInstance.isAnimationPlaying,
      (isPlaying) => {
        if (isPlaying) {
          this.current3DSlide?.deselect();
        }
      }
    );

    reaction(
      () => mobilityOverviewPanelStoreInstance.isPanelOpen,
      (isPanelOpen) => {
        this.setInteractionMode(isPanelOpen ? MapInteractionMode.FixedWobble : MapInteractionMode.Free);
      }
    );

    // Bad code, but we need to check isPanelOpen on start
    setInterval(() => {
      this.setInteractionMode(
        mobilityOverviewPanelStoreInstance.isPanelOpen ? MapInteractionMode.FixedWobble : MapInteractionMode.Free
      );
    }, 2000);

    // 3D infrastructure
    this.camera = new PerspectiveCamera();
    this.camera.layers.disableAll();
    this.camera.layers.enable(0);
    this.camera.layers.enable(1);
    this.scene = new Scene();
    this.buildingsGroup = new Group();
    this.scene.add(this.buildingsGroup);

    this.raycaster = new Raycaster();
    this.raycaster.layers.disableAll();
    this.raycaster.layers.enable(0);

    this.renderer = new WebGLRenderer();

    this.scene.add(viewCenterMesh);
    this.scene.add(this.regionPolygonGroup);

    this.addLight();

    setUniformFenceMaterial(settingsState);
    setUniformFenceLineMaterial(settingsState);
  }

  public async setSlide(slide?: Slide) {
    this.currentSlide = slide;
    this.setDefaultCameraPosition();
  }

  public async setDefaultCameraPosition() {
    const cameraLocation = structuredClone(getCameraLocationForSlide(this.currentSlide));
    if (cameraLocation) {
      const slideWithoutLocation = [
        Slide.AVIATION_CONNECTIVITY,
        Slide.AVIATION_INBOUND,
        Slide.AVIATION_OUTBOUND,
        Slide.MARITIME_FACILITIES,
        Slide.MARITIME_TRIPS,
      ];
      const newOrigin = locationPanelStoreInstance.currentLocation;

      const result = this.mapbox?.cameraForBounds(locationPanelStoreInstance.currentLocation.boundingBox);

      cameraLocation.center[0] = newOrigin.center[0];
      cameraLocation.center[1] = newOrigin.center[1];

      // Use the calculated zoom level from cameraForBounds to fit the new location
      if (!slideWithoutLocation.includes(this.currentSlide!)) {
        // Check if there's a custom zoom level for this region/slide combination
        const customZoom = getCustomZoomForLocation(newOrigin.locationType, newOrigin.location, this.currentSlide);
        cameraLocation.zoom = customZoom ?? result?.zoom ?? cameraLocation.zoom;
      }

      this.isZoomChangingToAviation = slideWithoutLocation.includes(this.currentSlide!);

      this.mapbox?.easeTo(_.merge({ duration: 1000 }, cameraLocation));
    }
  }

  private updateBordersVisibility() {
    // this needs to be assigned
    const isPanelOpen = mobilityOverviewPanelStoreInstance.isPanelOpen;
    const isBordersVisible = mapDataValuesStoreInstance.isBordersVisible;
    const isLocationPanelOpen = locationPanelStoreInstance.isLocationPanelOpen;
    // because mobx will not catch observables call in this expression
    this.zones3DSlide?.setVisible(
      !isPanelOpen && (isBordersVisible || isLocationPanelOpen) && (isLocationPanelOpen || this.slideVisible)
    );
    this.regionPolygonGroup.visible = !isPanelOpen && (isLocationPanelOpen || this.slideVisible);
  }

  private async showLocation(value: ILocation, _fitCamera: boolean) {
    const loc = await zones3DStoreInstance.getLocationWithGeometryByName(value.locationType, value.location);
    if (loc?.geometry) {
      this.showRegionPolygon(loc.geometry);
    }
  }

  public async setCurrent3DSlide(slide?: I3DSlide) {
    if (this.current3DSlide) {
      this.current3DSlide.deselect();
      this.current3DSlide.uninstall(this.scene);
      this.current3DSlide.stopTimelineEvent = undefined;
      this.current3DSlide.moveToEvent = undefined;
    }
    this.current3DSlide = slide;

    await this.waitMapStyleLoaded();
    if (this.current3DSlide) {
      this.current3DSlide.stopTimelineEvent = this.onStopTimeline.bind(this);
      this.current3DSlide.moveToEvent = this.onMoveTo.bind(this);
      this.current3DSlide.install(this.scene);
      this.current3DSlide.setVisible(this.slideVisible);
      this.onCameraMove();
    }
  }

  public deselectCurrent3DSlide(): void {
    if (this.current3DSlide) {
      this.current3DSlide.deselect();
    }
  }

  public init(mapContainer: HTMLDivElement): void {
    this.mapbox = new MapBox({
      container: mapContainer,
      style: 'mapbox://styles/pixonal/clob32fwp012j01qsbs1x1lkr',
      antialias: true,
      accessToken: key,
    });

    this.mapbox.easeTo({
      pitch: 60,
      bearing: 40,
      zoom: 10,
      duration: 2000,
      animate: true,
      essential: true,
    });

    this.mapbox.resize();

    const canvas: HTMLCanvasElement = this.mapbox.getCanvas();
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;

    this.isInitialized = true;
  }

  public showRegionPolygon(polygonsWithHoles: PolygonWithHoles[]): void {
    this.clearRegionPolygon();

    for (const polygonWithHoles of polygonsWithHoles) {
      const { pointsVector2, pointsFlat, holesPointsVector2, holesPointsFlat3 } = prepareGeometry(polygonWithHoles);

      // Lifting polygons to prevent z-fighting, m
      const z = 5;

      if (locationPanelStoreInstance.isLocationPanelOpen) {
        // Polygon
        const shape = new Shape(pointsVector2);
        shape.holes = holesPointsVector2.map((x) => new Path(x));
        const fillGeometry = new ShapeGeometry(shape);
        const fillMesh = new Mesh(fillGeometry, regionPolygonFillMaterial);
        fillMesh.renderOrder = -10;
        fillMesh.position.set(0, 0, z);
        this.regionPolygonGroup.add(fillMesh);
      }

      // Outline polygon
      for (const points of [pointsFlat, ...holesPointsFlat3]) {
        const lineGeometry = new LineGeometry().setPositions(points);
        const lineMesh = new Line2(lineGeometry, regionPolygonLineMaterial);
        lineMesh.name = 'outline';
        lineMesh.renderOrder = -10;
        lineMesh.position.set(0, 0, z);
        this.regionPolygonGroup.add(lineMesh);
      }
    }

    // this.regionPolygonGroup.visible = true;
  }

  public clearRegionPolygon(): void {
    this.regionPolygonGroup.clear();
    // this.regionPolygonGroup.visible = false;
  }

  public fitToBbox(bounds: LngLatBoundsLike, offset: PointLike = [0, -50], duration: number = 1000) {
    const result = this.mapbox?.cameraForBounds(bounds);
    if (result && result.center && result.zoom) {
      this.easeTo(result.center, result.zoom, duration, true, offset);
    }
  }

  public set3DSlideVisible(visible: boolean) {
    this.slideVisible = visible;
    this.current3DSlide?.setVisible(visible);
    this.updateBordersVisibility();
  }

  public clearMap() {
    this.current3DSlide?.clearMap();
  }

  public async waitMapStyleLoaded(): Promise<void> {
    await until(() => this.mapbox?.style?._loaded ?? false);
  }

  private addLight(): void {
    this.scene.add(new AmbientLight(0xffffff, 3));

    this.light.castShadow = true;
    this.light.shadow.camera.near = 10;
    this.light.shadow.camera.far = 100_000;

    const shadowSize = settingsState.shadow.radius * 2;
    this.light.shadow.camera.bottom = shadowSize;
    this.light.shadow.camera.top = -shadowSize;
    this.light.shadow.camera.left = shadowSize;
    this.light.shadow.camera.right = -shadowSize;

    this.light.shadow.mapSize.width = settingsState.shadow.quality;
    this.light.shadow.mapSize.height = settingsState.shadow.quality;

    this.light.position.set(7000, 7000, 3000);
    lightTarget.position.set(0, 0, 0);
    this.light.target = lightTarget;
    this.scene.add(this.light);

    this.scene.add(shadowMesh);
  }

  public zoomIn(): void {
    this.mapbox?.zoomIn();
  }

  public zoomOut(): void {
    this.mapbox?.zoomOut();
  }

  public easeTo(
    center: LngLatLike,
    zoom: number,
    duration: number = 1000,
    resetRotation: boolean = true,
    offset: PointLike | undefined = undefined
  ): void {
    const params = {
      center,
      duration,
      zoom,
    };

    if (resetRotation) Object.assign(params, { pitch: 60, bearing: 0 });
    if (offset) Object.assign(params, { offset });

    if (duration > 0) {
      this.mapbox?.easeTo(params);
    } else {
      this.mapbox?.jumpTo(params);
    }
  }

  public dragRotate(dx: number, dy: number) {
    this.mapbox?.setBearing(this.mapbox?.getBearing() + dx);
    this.mapbox?.setPitch(this.mapbox?.getPitch() - dy);
  }

  public addVisualizationLayer() {
    if (!this.mapbox) throw new Error('map is null');

    if (this.mapbox.getLayer('ad-heatmap-schools-1o6seo')) this.mapbox.removeLayer('ad-heatmap-schools-1o6seo');

    const visualizationLayer = this.mapbox.getLayer('visualizationLayer');
    if (!visualizationLayer) {
      this.mapbox.addLayer(
        {
          id: 'visualizationLayer',
          type: 'custom',
          renderingMode: '3d',
          onAdd: (map: MapBox, gl: WebGLRenderingContext): void => {
            this.renderer = new WebGLRenderer({
              canvas: map.getCanvas(),
              context: gl,
              antialias: true,
              powerPreference: 'high-performance',
            });
            this.renderer.debug.checkShaderErrors = window.location.hostname === 'localhost';
            this.renderer.shadowMap.enabled = false;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.renderer.autoClear = false;
            this.renderer.outputColorSpace = LinearSRGBColorSpace;
            this.renderer.localClippingEnabled = true;

            this.renderer.shadowMap.autoUpdate = true;

            this.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown(e));
            this.renderer.domElement.addEventListener('mouseup', (e: MouseEvent) => this.onMouseUp(e));
            this.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e));

            map.on('resize', () => {
              const canvas = map.getCanvas();
              this.width = canvas.clientWidth;
              this.height = canvas.clientHeight;

              this.renderer.setSize(canvas.width, canvas.height, false);
            });

            addBuildings(map, this.buildingsGroup).finally();

            try {
              if (map.style?._layers) {
                map.style._layers['upc-precincts-cznffl copy'].visibility = 'none';
              }
            } catch {}

            this.render();
          },
          render: (_: WebGLRenderingContext, matrix: number[]): void => {
            this.updateAndRender(matrix);
          },
        },
        'bridge-rail-tracks'
      );
    }

    this.zones3DSlide = new Zones3DSlide(this.mapbox);
    this.zones3DSlide.install(this.scene);

    this.updateBordersVisibility();
  }

  private updateAndRender(matrix: number[]) {
    TWEEN.update();
    this.render(matrix);
  }

  private onCameraMove() {
    if (!this.mapbox) return;

    runInAction(() => {
      if (this.mapbox) {
        this.cameraPitch = this.mapbox.getPitch();
        const rot1 = new Matrix4().makeRotationX(MathUtils.degToRad(this.mapbox.transform.pitch));
        const rot2 = new Matrix4().makeRotationZ(MathUtils.degToRad(-this.mapbox.transform.rotation));
        const compassMatrix = new Matrix4().multiplyMatrices(rot1, rot2);
        this.uiCompassMatrix = compassMatrix.elements.toString();
      }
    });

    // Camera Lock at position
    const lockAtWgs: LngLat = this.mapbox.getCenter();
    const cameraLockAtPosition: Vector3 = MapUtils.getPositionFromWgs(lockAtWgs.lng, lockAtWgs.lat);

    this.camera.getWorldDirection(this.cameraDirection);

    // Center sphere
    viewCenterMesh.position.copy(cameraLockAtPosition);

    // Light in the direction of the camera
    this.light.position.copy(this.camera.position);
    this.light.target.position.copy(this.camera.position.clone().add(this.cameraDirection));

    this.light.updateMatrixWorld();
    this.light.target.updateMatrixWorld();

    const cameraCenterPosition = new Vector3(
      (this.camera.position.x + cameraLockAtPosition.x) / 2,
      (this.camera.position.y + cameraLockAtPosition.y) / 2,
      1
    );

    shadowMesh.position.copy(cameraCenterPosition);

    const currentZoom = this.mapbox.getZoom();
    // Log zoom changes
    // if (this.previousZoom !== null && this.previousZoom !== currentZoom) {
    //   console.log('Map zoom changed:', currentZoom);
    // }
    this.previousZoom = currentZoom;

    this.current3DSlide?.onCameraMove(this.camera, currentZoom);
  }

  private select(mouse: Vector2, pointer: Vector2): void {
    this.raycaster.setFromCamera(pointer, this.camera);
    const pointerData = {
      raycaster: this.raycaster,
      pointer,
      mouse,
      size: new Vector2(this.width, this.height),
    };
    this.current3DSlide?.raycast(pointerData);
    this.zones3DSlide?.raycast(pointerData);
  }

  private hover() {
    if (this.pointerMove && !this.mapbox?.isMoving()) {
      this.raycaster.setFromCamera(this.pointerMove, this.camera);
      this.current3DSlide?.hover?.(this.raycaster);
      this.zones3DSlide?.hover?.(this.raycaster);
    }
  }

  private onStopTimeline(): void {
    runInAction(() => {
      timeIntervalsStoreInstance.handleStop();
    });
  }

  private onMoveTo(moveToEvent: IMoveToEvent): void {
    const { pointOfInterest, zoom, resetRotation, offset } = moveToEvent;
    if (pointOfInterest) {
      const lngLat = MapUtils.getWgsFromPosition(pointOfInterest);
      this.easeTo(lngLat, zoom, 1000, resetRotation, offset);
    }
    this.onStopTimeline();
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.pointerDown) return;
    const pointerDown: Vector2 = this.pointerDown.clone();
    this.pointerDown = undefined;

    const mouse: Vector2 = new Vector2(e.offsetX, e.offsetY);
    const pointer: Vector2 = MapUtils.getScreenCoordinates(e, this.width, this.height);

    const isMoved: boolean = pointerDown.x !== pointer.x || pointerDown.y !== pointer.y;
    if (isMoved) return;

    this.select(mouse, pointer);
  }

  private onMouseDown(e: MouseEvent): void {
    this.pointerDown = MapUtils.getScreenCoordinates(e, this.width, this.height);
  }

  private onMouseMove(e: MouseEvent): void {
    this.pointerMove = MapUtils.getScreenCoordinates(e, this.width, this.height);

    this.hover();
  }

  private render(matrixElements?: number[]): void {
    if (!this.mapbox) return;

    const startPoint: IStartPoint = MapUtils.startPoint;
    if (!startPoint) return;

    if (matrixElements && matrixElements.length === 16) {
      const newCameraMatrix = new Matrix4().fromArray(matrixElements);

      if (!this.currentCameraMatrix.equals(newCameraMatrix)) {
        this.currentCameraMatrix.copy(newCameraMatrix);

        this.updateCamera(startPoint);
        this.onCameraMove();

        runInAction(() => {
          this.cameraUpdateFrames++;
        });
      }
    }

    this.renderer.resetState();

    // this.composer?.render(); // render with blur
    this.renderer.render(this.scene, this.camera); // render without blur

    this.renderer.resetState();

    this.mapbox.triggerRepaint();
  }

  private updateCamera(startPoint: IStartPoint) {
    // Convert map's camera parameters to three.js camera
    // to get camera.position, camera.quaternion, camera.scale
    // and then matrixWorld
    // https://github.com/nagix/mini-tokyo-3d/blob/master/src/layers/three-layer.js
    // https://github.com/salgum1114/mapbox-gl-threelayer/blob/master/src/CameraSync.ts
    // @ts-expect-error this.map.transform untyped access
    const { _fov, _camera, _horizonShift, worldSize, fovAboveCenter, _pitch, width, height } = this.mapbox.transform,
      halfFov = _fov / 2,
      angle = Math.PI / 2 - _pitch,
      cameraToSeaLevelDistance = (_camera.position[2] * worldSize) / Math.cos(_pitch),
      topHalfSurfaceDistance =
        (Math.sin(fovAboveCenter) * cameraToSeaLevelDistance) /
        Math.sin(MathUtils.clamp(angle - fovAboveCenter, 0.01, Math.PI - 0.01)),
      furthestDistance = Math.cos(angle) * topHalfSurfaceDistance + cameraToSeaLevelDistance,
      horizonDistance = cameraToSeaLevelDistance / _horizonShift,
      farZ = Math.min(furthestDistance * 1.01, horizonDistance),
      nearZ = height / 50,
      halfHeight = Math.tan(halfFov) * nearZ,
      halfWidth = (halfHeight * width) / height,
      startMatrix = new Matrix4()
        .makeTranslation(startPoint.x, startPoint.y, 0)
        .scale(new Vector3(startPoint.scale, -startPoint.scale, startPoint.scale));

    this.camera.fov = MathUtils.radToDeg(_fov);
    this.camera.aspect = width / height;
    this.camera.near = nearZ;
    this.camera.far = farZ;
    this.camera.projectionMatrix
      .makePerspective(-halfWidth, halfWidth, halfHeight, -halfHeight, nearZ, farZ)
      .clone()
      .invert()
      .multiply(this.currentCameraMatrix)
      .multiply(startMatrix)
      .invert()
      .decompose(this.camera.position, this.camera.quaternion, this.camera.scale);

    this.camera.updateProjectionMatrix(); // for proper raycasting
  }

  public takeScreenshot(): Promise<ImageSource> | undefined {
    // https://github.com/mapbox/mapbox-gl-js/issues/2766#issuecomment-370758650
    const map = this.mapbox;
    if (map) {
      return new Promise((resolve) => {
        map.once('render', () => {
          resolve(map.getCanvas().toDataURL());
        });
        /* trigger render */
        map.setBearing(map.getBearing());
      });
    }
  }

  private setInteractionMode(mode: MapInteractionMode) {
    if (this.mapbox) {
      switch (mode) {
        case MapInteractionMode.Free: {
          this.mapbox.dragPan.enable();
          this.mapbox.dragRotate.enable();
          this.mapbox.scrollZoom.enable();

          this.fixedWobbleTween?.stop();
          this.fixedWobbleTween = undefined;
          break;
        }
        case MapInteractionMode.FixedWobble: {
          this.mapbox.dragPan.disable();
          this.mapbox.dragRotate.disable();
          this.mapbox.scrollZoom.disable();

          this.fixedWobbleTween || this.startFixedWobbleAnimation();
          break;
        }
        default:
          throw new Error(`Not implemented interaction mode ${mode}`);
      }
    }
  }

  private startFixedWobbleAnimation() {
    if (this.mapbox) {
      let cameraOptions = this.mapbox.getFreeCameraOptions();
      let center = this.mapbox.getCenter();
      const animationVar = { t: 0, m: 0 };

      this.fixedWobbleTween = new TWEEN.Tween(animationVar)
        .delay(2000)
        .onStart(() => {
          new TWEEN.Tween(animationVar).to({ m: 1 }, 7000).start();
          cameraOptions = this.mapbox!.getFreeCameraOptions();
          center = this.mapbox!.getCenter();
        })
        .to({ t: 2 * Math.PI }, 25000)
        .repeat(Infinity)
        .onUpdate((obj) => {
          if (this.mapbox && cameraOptions.position) {
            const amplitude = 20 * obj.m * cameraOptions.position.z;
            this.mapbox.setCenter([center.lng + Math.cos(obj.t) * amplitude, center.lat + Math.sin(obj.t) * amplitude]);
          }
        })
        .start();
    }
  }
}

const map3d: Map3D = new Map3D();

// Expose to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).map3d = map3d;
}

export default map3d;

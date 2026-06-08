import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Camera,
  CircleGeometry,
  Clock,
  Color,
  CubicBezierCurve3,
  EllipseCurve,
  ExtrudeGeometry,
  Group,
  Intersection,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NormalBufferAttributes,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Scene,
  Shape,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

import { BetterLineMaterial } from '../BetterLineMaterial.ts';
import settingsState from '../SettingsState.ts';

// const border = 50;
const DISK_RADIUS = 100;

const colorUsual = new Color(0x00dafe);
const colorUnusual = new Color(0xedc16b);

// const circleBottomFillMaterial = new MeshBasicMaterial({ color: color.clone().offsetHSL(0, 0, -0.15) });

export class ArcAndCircleObject3D extends Group {
  private static circleGeometry: BufferGeometry = new CircleGeometry(1, 32);
  private static extrudeHeight: number = 0;
  private static directionFlowGeometry = new BoxGeometry(
    settingsState.populationMovement.flowGeometryThicknes,
    settingsState.populationMovement.flowGeometryThicknes,
    settingsState.populationMovement.flowGeometryWidth
  );

  private static clock: Clock = new Clock();

  // public readonly move: PopulationMoveParamsData;

  // public readonly fromZone: LocationWithGeometry;
  // public readonly toZone: LocationWithGeometry;

  // public arcId: string;

  private readonly circleGroup: Group;
  private readonly arcLineMaterial: BetterLineMaterial;
  private readonly circleBorderMaterial: BetterLineMaterial;
  private readonly circleFillMaterial: MeshBasicMaterial;
  private readonly circleInnerMaterial: MeshBasicMaterial;
  private readonly directionFlowMaterial: MeshBasicMaterial;

  private curve: CubicBezierCurve3;
  // public readonly startPoint: Vector3;
  // public readonly endPoint: Vector3;

  private prevValue: number = 0;
  private rising: boolean = true;

  private innerDiskMaxScale: number;

  constructor(
    public arcId: string,
    // move: PopulationMoveParamsData,
    // zonesMap: Map<ZoneHierarchyId, LocationWithGeometry>,
    public startPoint: Vector3,
    public endPoint: Vector3,
    recurrent: number,
    inbound = false,
    private clampSize = true,
    directionFlowSpeed = 1000,
    innerDiskMaxScale: number = 150
  ) {
    super();

    this.innerDiskMaxScale = innerDiskMaxScale;

    // this.arcId = id;

    // const { f: from, t: to, c: value, r: recurrent } = move;

    // this.fromZone = zonesMap.get(from)!;
    // this.toZone = zonesMap.get(to)!;

    // this.move = move;

    // const startWgs = this.fromZone.c;
    // const endWgs = this.toZone.c;

    const color = recurrent == 2 ? colorUnusual : colorUsual;

    // this.startPoint = MapUtils.getPositionFromWgs(startWgs![0], startWgs![1]);
    // this.endPoint = MapUtils.getPositionFromWgs(endWgs![0], endWgs![1]);

    this.endPoint.z += ArcAndCircleObject3D.extrudeHeight;
    const distance = this.endPoint.distanceTo(this.startPoint) * 0.5;
    const height = 1000 + distance * 0.5;
    const anchor = new Vector3(
      MathUtils.lerp(this.startPoint.x, this.endPoint.x, 0.5),
      MathUtils.lerp(this.startPoint.y, this.endPoint.y, 0.5),
      height
    );

    this.curve = new CubicBezierCurve3(this.startPoint, anchor, anchor, this.endPoint);
    const points = this.curve.getPoints(32);

    // Line
    {
      const flatPoints = [];
      for (const point of points) {
        flatPoints.push(point.x, point.y, point.z);
      }
      const geometry = new LineGeometry().setPositions(flatPoints);
      this.arcLineMaterial = new BetterLineMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        linewidth: settingsState.populationMovement.arcLineWidth, // px
        dashed: true,
        depthWrite: false,
        depthTest: false,
        // clippingPlanes: [new Plane(this.endPoint.clone().sub(this.startPoint).normalize()).translate(this.endPoint)],
      });
      const curveObject = new Line2(geometry, this.arcLineMaterial);
      curveObject.renderOrder = 1;
      this.add(curveObject);
    }

    // Line direction animation
    {
      this.directionFlowMaterial = new MeshBasicMaterial({
        blending: AdditiveBlending,
        color: 0xffffff,
        transparent: true,
      });
      const directionFlow = new Mesh(ArcAndCircleObject3D.directionFlowGeometry, this.directionFlowMaterial);
      directionFlow.onBeforeRender = (
        _renderer: WebGLRenderer,
        _scene: Scene,
        camera: Camera,
        _geometry: BufferGeometry<NormalBufferAttributes>,
        _material: Material,
        _group: Group<Object3DEventMap>
      ) => {
        ArcAndCircleObject3D.clock.getDelta();
        const animationOffset = (Math.abs(this.endPoint.x * 100) % 10) * 100;
        const t =
          (((ArcAndCircleObject3D.clock.elapsedTime * (inbound ? -1 : 1) + animationOffset) / this.curve.getLength()) *
            directionFlowSpeed) %
          1;
        const pos = this.curve.getPoint(t);
        directionFlow.position.copy(pos);
        directionFlow.lookAt(pos.add(this.curve.getTangent(t)).applyMatrix4(this.matrixWorld));
        const scale = camera.position.distanceTo(directionFlow.position) / 1000;
        directionFlow.scale.set(scale, scale, scale);
      };
      directionFlow.renderOrder = 2;
      this.add(directionFlow);
    }

    this.circleGroup = new Group();

    // Inner cirlce
    {
      const geometry = ArcAndCircleObject3D.circleGeometry;
      this.circleInnerMaterial = new MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
      const mesh = new Mesh(geometry, this.circleInnerMaterial);
      mesh.scale.set(DISK_RADIUS * 0.2, DISK_RADIUS * 0.2, 1);
      this.circleGroup.add(mesh);
    }

    // Fill cirlce
    {
      const geometry = ArcAndCircleObject3D.circleGeometry;
      this.circleFillMaterial = new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
      const circle = new Mesh(geometry, this.circleFillMaterial);
      circle.scale.set(DISK_RADIUS, DISK_RADIUS, 1);
      this.circleGroup.add(circle);
    }

    // Border cirlce
    {
      const curve = new EllipseCurve(0, 0, 1, 1);
      const points = curve.getPoints(32);
      const flatPoints = [];
      for (const point of points) {
        flatPoints.push(point.x, point.y, 0);
      }
      const geometry = new LineGeometry().setPositions(flatPoints);
      this.circleBorderMaterial = new BetterLineMaterial({
        transparent: true,
        color: color,
        linewidth: 3, // px
      });
      const curveObject = new Line2(geometry, this.circleBorderMaterial);
      curveObject.renderOrder = 1;
      curveObject.position.set(0, 0, ArcAndCircleObject3D.extrudeHeight);
      curveObject.scale.set(DISK_RADIUS, DISK_RADIUS, 1);
      this.circleGroup.add(curveObject);
    }

    this.circleGroup.position.set(this.endPoint.x, this.endPoint.y, 5);
    this.add(this.circleGroup);

    // this.setValue(value);
  }

  setValue(value: number) {
    this.rising = value > this.prevValue;
    this.prevValue = value;

    const size = Math.max(0.1, value) * 15;
    this.circleGroup?.scale.set(size, size, 1);

    // Making equal sizes for all inner circles
    const currentDiskScale = (1 / size) * this.innerDiskMaxScale;

    if (currentDiskScale <= DISK_RADIUS * 0.2) {
      this.circleGroup.children[0].scale.set(currentDiskScale, currentDiskScale, 1);
    }

    const mul = MathUtils.clamp(value, 0.5, 1);
    this.arcLineMaterial.opacity = 0.5;
    this.circleBorderMaterial.linewidth = 3 * mul;
    this.directionFlowMaterial.opacity = settingsState.populationMovement.flowOpacity * mul;
  }

  setDimm(dimm: boolean) {
    const mul = dimm ? 0.2 : 1;
    const innerCircleMul = dimm ? 0.6 : 1;
    const fillCircleMul = dimm ? 0.2 : 0.3;

    this.circleFillMaterial.opacity = fillCircleMul;
    this.arcLineMaterial.opacity = 0.5 * mul;
    this.circleBorderMaterial.opacity = mul;
    this.circleInnerMaterial.opacity = innerCircleMul;
  }

  raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]): void {
    const intersections = raycaster.intersectObjects(this.children);
    intersections.forEach((x) => (x.object = this));
    intersects.push(...intersections);
  }

  public static setCircleExtrude(extrudeHeight: number): void {
    ArcAndCircleObject3D.extrudeHeight = extrudeHeight;
    const curve = new EllipseCurve(0, 0, 1, 1);
    const shape = new Shape(curve.getPoints(32));
    ArcAndCircleObject3D.circleGeometry = new ExtrudeGeometry(shape, {
      depth: extrudeHeight,
      bevelEnabled: false,
    });
  }

  public static setFlowGeometrySize(thicknes: number, width: number): void {
    ArcAndCircleObject3D.directionFlowGeometry = new BoxGeometry(thicknes, thicknes, width);
  }
}

ArcAndCircleObject3D.setCircleExtrude(settingsState.populationMovement.extrudeHeight);

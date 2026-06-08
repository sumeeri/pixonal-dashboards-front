import {
  AlwaysDepth,
  Camera,
  Group,
  Intersection,
  Matrix4,
  Object3D,
  Plane,
  Raycaster,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from 'three';

import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import MapUtils from '../MapUtils';
import { PopulationMoveZone } from '../population/PopulationDataTypes';
import { RenderOrder } from '../RenderOrderEnum';

class PopulationCountInfoSprite extends Sprite {
  constructor(
    public zoneId: string,
    material: SpriteMaterial
  ) {
    super(material);
  }
}

// TODO: make base class, copypaste form FenceInfoIcons
export default class PopulationWithinInfoIcons
  extends Group
  implements IDataModelDisplayGroup<string, PopulationMoveZone, PopulationMoveZone>
{
  public clipPlaneDistance: number = 50000;

  private readonly texture: Texture | null | undefined;
  private readonly material: SpriteMaterial;

  private readonly clippingPlane: Plane;
  private iconSize: number = 35;

  private map = new Map<string, PopulationMoveZone>();

  constructor() {
    super();

    this.clippingPlane = new Plane(new Vector3(0, 0, 1), 0);

    this.texture = new TextureLoader().load('/populationWarning.png');
    this.material = new SpriteMaterial({
      map: this.texture,
      sizeAttenuation: true,
      depthFunc: AlwaysDepth,
      alphaHash: true,
      clippingPlanes: [this.clippingPlane],
      clipShadows: true,
    });
  }

  updateAnimation(_k: number): void {
    throw new Error('Method not implemented.');
  }

  public create(fenceMap: Map<string, PopulationMoveZone>): void {
    this.map = fenceMap;
  }

  public setIconSize(size: number) {
    this.iconSize = size;
    for (const obj of this.children) {
      obj.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
    }
  }

  private isNonRecurent(param: PopulationMoveZone): boolean {
    return param.peopleMoveParamsData.recurrency === 2;
  }

  public setData(
    current: Map<string, PopulationMoveZone>,
    _target: Map<string, PopulationMoveZone>,
    _paramFormula: undefined = undefined
  ): void {
    this.clear();

    for (const [key, param] of current) {
      const fence = this.map.get(key);
      if (fence && this.isNonRecurent(param)) {
        // const popupPoint = PopulationZoneUtils.getPopupPoint(fence, param * 1500);
        const popupPoint = MapUtils.getPositionFromWgs(...param.location.center);
        popupPoint.z = (param.peopleMoveParamsData.peopleCount / 1000) * 100;
        if (popupPoint) {
          const sprite = new PopulationCountInfoSprite(key, this.material);
          sprite.name = 'PopulationZone';
          sprite.renderOrder = RenderOrder.InfoIcon;
          sprite.center.set(0.5, 0);
          sprite.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
          sprite.position.copy(popupPoint);
          this.add(sprite);
        }
      }
    }
  }

  raycast(raycaster: Raycaster): [string, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject: Object3D = intersects[0].object;

    const zoneSprite = nearestObject as PopulationCountInfoSprite;
    const zone = zoneSprite.zoneId;
    if (!zone) {
      this.deselect();
      return undefined;
    }

    return [zone, intersects[0]];
  }

  public updateClippingPlane(camera: Camera) {
    this.clippingPlane.copy(
      new Plane(new Vector3(0, 0, 1), this.clipPlaneDistance).applyMatrix4(
        new Matrix4().compose(camera.position, camera.quaternion, new Vector3(1, 1, 1))
      )
    );
  }

  select(zoneId: string): void {
    for (const obj of this.children) {
      obj.visible = (obj as PopulationCountInfoSprite)?.zoneId !== zoneId;
    }
  }

  public deselect(): void {
    for (const obj of this.children) {
      obj.visible = true;
    }
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}

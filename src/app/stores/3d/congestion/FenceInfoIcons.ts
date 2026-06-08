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
import { RenderOrder } from '../RenderOrderEnum';
import { FenceId } from './data/CongestionDataTypes';
import { Fence } from './data/Fence';
import IFenceParamFormula from './fenceParamFormulas/IFenceParamFormula';

class FenceInfoSprite extends Sprite {
  constructor(
    public fenceId: FenceId,
    material: SpriteMaterial
  ) {
    super(material);
  }
}

export default class FenceInfoIcons<TParam>
  extends Group
  implements IDataModelDisplayGroup<FenceId, Fence, TParam, IFenceParamFormula<TParam>>
{
  public clipPlaneDistance: number = 5000;

  private readonly texture: Texture | null | undefined;
  private readonly material: SpriteMaterial;

  private readonly clippingPlane: Plane;
  private iconSize: number = 35;

  private fenceMap = new Map<number, Fence>();

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

  public create(fenceMap: Map<FenceId, Fence>): void {
    this.fenceMap = fenceMap;
  }

  clearMapDisplay(): void {
    this.clear();
  }

  public setIconSize(size: number) {
    this.iconSize = size;
    for (const obj of this.children) {
      obj.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
    }
  }

  private isNonRecurent(param: TParam): boolean {
    const paramAny = param as any;
    return paramAny.recurrency === 2 || false;
  }

  public setData(
    current: Map<FenceId, TParam>,
    _target: Map<FenceId, TParam>,
    paramFormula: IFenceParamFormula<TParam>
  ): void {
    this.clear();

    for (const [key, param] of current) {
      const fence = this.fenceMap.get(key);
      if (fence && this.isNonRecurent(param)) {
        const popupPoint = fence.getPopupPoint(paramFormula, param);
        if (popupPoint) {
          const sprite = new FenceInfoSprite(key, this.material);
          sprite.name = 'FenceInfoSprite';
          sprite.renderOrder = RenderOrder.InfoIcon;
          sprite.center.set(0.5, 0);
          sprite.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
          sprite.position.copy(popupPoint);
          this.add(sprite);
        }
      }
    }
  }

  raycast(raycaster: Raycaster): [FenceId, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject: Object3D = intersects[0].object;

    const fenceSprite = nearestObject as FenceInfoSprite;
    const fence = fenceSprite.fenceId;
    if (!fence) {
      this.deselect();
      return undefined;
    }

    return [fence, intersects[0]];
  }

  public updateClippingPlane(camera: Camera) {
    this.clippingPlane.copy(
      new Plane(new Vector3(0, 0, 1), this.clipPlaneDistance).applyMatrix4(
        new Matrix4().compose(camera.position, camera.quaternion, new Vector3(1, 1, 1))
      )
    );
  }

  select(fenceId: FenceId): void {
    for (const obj of this.children) {
      obj.visible = (obj as FenceInfoSprite)?.fenceId !== fenceId;
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

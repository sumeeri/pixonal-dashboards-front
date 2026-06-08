import { until } from 'shared/utils/until.ts';
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
import { RenderOrder } from '../RenderOrderEnum';
import { AccidentData, AccidentId } from './AccidentsDataTypes';
import IAccidentsParamFormula from './IAccidentsParamFormula';

export class AccidentInfoSprite extends Sprite {
  constructor(
    public accidentId: AccidentId,
    material: SpriteMaterial
  ) {
    super(material);
  }
}

// TODO: refactor this copy pasta from JunctionInfoIcons.ts
export default class AccidentInfoIcons
  extends Group
  implements IDataModelDisplayGroup<AccidentId, AccidentData, AccidentData, IAccidentsParamFormula>
{
  public clipPlaneDistance: number = 5000;

  private readonly texture: Texture | null | undefined;
  private readonly material: SpriteMaterial;

  private readonly clippingPlane: Plane;
  private iconSize: number = 35;

  constructor() {
    super();

    this.clippingPlane = new Plane(new Vector3(0, 0, 1), 0);

    this.texture = new TextureLoader().load('/fatalAccidentWarning.png');

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
    // Empty
  }

  public create(_data: Map<AccidentId, AccidentData>): void {
    // Empty
  }

  public setIconSize(size: number) {
    this.iconSize = size;
    for (const obj of this.children) {
      obj.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
    }
  }

  private toBeShown(param: AccidentData): boolean {
    return param.injuryLevel === 'fatal';
  }

  public async setData(
    current: Map<AccidentId, AccidentData>,
    _target: Map<AccidentId, AccidentData>,
    _formula: IAccidentsParamFormula
  ): Promise<void> {
    await until(() => this.texture?.image);

    this.clear();

    for (const [key, param] of current) {
      const accidentData = param;
      if (accidentData && this.toBeShown(param)) {
        const popupPoint = MapUtils.getPositionFromWgs(accidentData.lng, accidentData.lat);
        if (popupPoint) {
          const sprite = new AccidentInfoSprite(key, this.material);
          sprite.name = 'InfoSprite';
          sprite.renderOrder = RenderOrder.InfoIcon;
          sprite.center.set(0.5, 0);
          sprite.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
          sprite.position.copy(popupPoint);
          this.add(sprite);
        }
      }
    }
  }

  raycast(raycaster: Raycaster): [AccidentId, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject: Object3D = intersects[0].object;

    const sprite = nearestObject as AccidentInfoSprite;
    const accidentId = sprite.accidentId;
    if (!accidentId) {
      this.deselect();
      return undefined;
    }

    return [accidentId, intersects[0]];
  }

  public updateClippingPlane(camera: Camera) {
    this.clippingPlane.copy(
      new Plane(new Vector3(0, 0, 1), this.clipPlaneDistance).applyMatrix4(
        new Matrix4().compose(camera.position, camera.quaternion, new Vector3(1, 1, 1))
      )
    );
  }

  select(id: AccidentId): void {
    for (const obj of this.children) {
      obj.visible = (obj as AccidentInfoSprite)?.accidentId !== id;
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

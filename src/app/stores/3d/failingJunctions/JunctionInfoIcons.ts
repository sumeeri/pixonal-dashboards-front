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
import IJunctionParamFormula from './IJunctionParamFormula';
import { JunctionData, JunctionId, JunctionParamsData } from './JunctionDataTypes';

export class JunctionInfoSprite extends Sprite {
  constructor(
    public junctionId: JunctionId,
    material: SpriteMaterial
  ) {
    super(material);
  }
}

export default class JunctionInfoIcons
  extends Group
  implements IDataModelDisplayGroup<JunctionId, JunctionData, JunctionParamsData, IJunctionParamFormula>
{
  public clipPlaneDistance: number = 5000;

  private readonly texture: Texture | null | undefined;
  private readonly material: SpriteMaterial;

  private readonly clippingPlane: Plane;
  private iconSize: number = 35;

  private junctionMap = new Map<JunctionId, JunctionData>();

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

  clearMapDisplay(): void {
    this.clear();
  }

  updateAnimation(_k: number): void {
    // Empty
  }

  public create(data: Map<string, JunctionData>): void {
    this.junctionMap = data;
  }

  public setIconSize(size: number) {
    this.iconSize = size;
    for (const obj of this.children) {
      obj.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
    }
  }

  private isNonRecurent(param: JunctionParamsData): boolean {
    return param.delay >= 60;
  }

  public async setData(
    current: Map<JunctionId, JunctionParamsData>,
    _target: Map<JunctionId, JunctionParamsData>,
    _formula: IJunctionParamFormula
  ): Promise<void> {
    await until(() => this.texture?.image);

    this.clear();

    for (const [key, param] of current) {
      const junctionData = this.junctionMap.get(key);
      if (junctionData && this.isNonRecurent(param)) {
        const popupPoint = MapUtils.getPositionFromWgs(junctionData.lng, junctionData.lat);
        if (popupPoint) {
          const sprite = new JunctionInfoSprite(key, this.material);
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

  raycast(raycaster: Raycaster): [JunctionId, Intersection] | undefined {
    const intersects: Intersection[] = raycaster.intersectObjects(this.children, true);

    if (intersects.length === 0) {
      this.deselect();
      return undefined;
    }

    const nearestObject: Object3D = intersects[0].object;

    const sprite = nearestObject as JunctionInfoSprite;
    const junction = sprite.junctionId;
    if (!junction) {
      this.deselect();
      return undefined;
    }

    return [junction, intersects[0]];
  }

  public updateClippingPlane(camera: Camera) {
    this.clippingPlane.copy(
      new Plane(new Vector3(0, 0, 1), this.clipPlaneDistance).applyMatrix4(
        new Matrix4().compose(camera.position, camera.quaternion, new Vector3(1, 1, 1))
      )
    );
  }

  select(id: JunctionId): void {
    for (const obj of this.children) {
      obj.visible = (obj as JunctionInfoSprite)?.junctionId !== id;
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

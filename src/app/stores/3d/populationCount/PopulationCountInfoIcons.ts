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
import { StudentCountZone } from '../students/StudentsDataTypes';
import { PopulationCountZone } from './PopulationCountTypes';

class PopulationCountInfoSprite extends Sprite {
  constructor(
    public zoneId: string,
    material: SpriteMaterial
  ) {
    super(material);
  }
}

// TODO: make base class, copypaste form FenceInfoIcons
export default class PopulationCountInfoIcons
  extends Group
  implements IDataModelDisplayGroup<string, PopulationCountZone, PopulationCountZone>
{
  public clipPlaneDistance: number = 50000;

  private readonly texture: Texture | null | undefined;
  private readonly material: SpriteMaterial;

  private readonly clippingPlane: Plane;
  private iconSize: number = 35;

  private map = new Map<string, PopulationCountZone | StudentCountZone>();

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

  public create(fenceMap: Map<string, PopulationCountZone | StudentCountZone>): void {
    this.map = fenceMap;
  }

  public setIconSize(size: number) {
    this.iconSize = size;
    for (const obj of this.children) {
      obj.scale.set(this.iconSize, this.iconSize * (this.texture?.image.height / this.texture?.image.width), 1);
    }
  }

  public setData(
    _current: Map<string, PopulationCountZone | StudentCountZone>,
    _target: Map<string, PopulationCountZone | StudentCountZone>,
    _paramFormula: undefined = undefined
  ): void {
    this.clear();
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

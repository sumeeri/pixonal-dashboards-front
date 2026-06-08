import {
  Color,
  ExtrudeGeometry,
  Group,
  Intersection,
  MathUtils,
  Mesh,
  MeshMatcapMaterial,
  Object3D,
  Object3DEventMap,
  Path,
  Raycaster,
  Shape,
  TextureLoader,
  Vector2,
} from 'three';

import { MultiPolygonGeometry } from '../../../entities/locationPanel/types.ts';
import settingsState from './SettingsState.ts';
import { prepareGeometry } from './ZoneGeometry.ts';

// const lowColor = new Color(0x3a097b).convertLinearToSRGB();
// const highColor = new Color(0x25c1e6).convertLinearToSRGB();
// const nonRecurentColor = new Color(0xedc16b).convertLinearToSRGB();

const matcapTexture = new TextureLoader().load('textures/matcap/00012.png');
// const nonRecurentTexure = new TextureLoader().load('textures/transparent-gradient.png');
const shadowTexture = new TextureLoader().load('textures/shadow-gradient.png');

const fillMaterial: MeshMatcapMaterial = new MeshMatcapMaterial({
  // roughness: 2.0,
  color: 0xffffff,
  matcap: matcapTexture,
  map: shadowTexture,
});
// const overlayMaterial: MeshBasicMaterial = new MeshBasicMaterial({
//   transparent: true,
//   color: nonRecurentColor,
//   map: nonRecurentTexure,
// });

export class MultiPolygonObject3D<TId> extends Group {
  objectId: TId;
  material?: MeshMatcapMaterial;
  group: Group;

  scalableCoefficient = 1000;

  constructor(objectId: TId, multiPolygon: MultiPolygonGeometry) {
    super();

    this.objectId = objectId;

    this.material = fillMaterial.clone();
    this.group = new Group();

    for (const zoneGeometry of multiPolygon) {
      const { pointsVector2, holesPointsVector2 } = prepareGeometry(zoneGeometry);

      // Fill mesh
      const shape = new Shape(pointsVector2);
      shape.holes = holesPointsVector2.map((x) => new Path(x));
      const geometry = new ExtrudeGeometry(shape, {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelThickness: 0.04,
        bevelSize: 50,
        bevelOffset: -50,
        UVGenerator: WorldUVGenerator,
      });
      const mesh = new Mesh(geometry, this.material);
      this.group.add(mesh);
    }

    this.add(this.group);
  }

  setScalableCoefficient(value: number) {
    this.scalableCoefficient = value;
  }

  setValue(value: number) {
    const lowColor = new Color(settingsState.population.lowColor).convertLinearToSRGB();
    const highColor = new Color(settingsState.population.highColor).convertLinearToSRGB();
    if (this.material) {
      this.material.color = lowColor.clone().lerp(highColor, MathUtils.clamp(value, 0, 1));
      this.material.transparent = settingsState.population.opacity < 1.0;
      this.material.opacity = settingsState.population.opacity;
      this.group.scale.set(1, 1, 5 + value * this.scalableCoefficient);
    }
  }

  raycast(raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]): void {
    const intersections = raycaster.intersectObjects(this.children);
    intersections.forEach((x) => (x.object = this));
    intersects.push(...intersections);
  }
}

const WorldUVGenerator = {
  generateTopUV: function () {
    const one = new Vector2(1, 1);
    return [one, one, one];
  },

  generateSideWallUV: function (
    _geometry: ExtrudeGeometry,
    vertices: number[],
    indexA: number,
    indexB: number,
    indexC: number,
    indexD: number
  ) {
    const a_z = vertices[indexA * 3 + 2];
    const b_z = vertices[indexB * 3 + 2];
    const c_z = vertices[indexC * 3 + 2];
    const d_z = vertices[indexD * 3 + 2];

    return [new Vector2(a_z, a_z), new Vector2(b_z, b_z), new Vector2(c_z, c_z), new Vector2(d_z, d_z)];
  },
};

import { Map as MapBox } from 'mapbox-gl';
import {
  CircleGeometry,
  FrontSide,
  Group,
  LOD,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  ShadowMaterial,
  SphereGeometry,
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { fetchBuildingsList, s3assets } from '../../../entities/dashboard/services.ts';
import { BetterLineMaterial } from './BetterLineMaterial.ts';
import IBuilding from './IBuilding.ts';
import { RenderOrder } from './RenderOrderEnum.ts';
import settingsState from './SettingsState.ts';

// Center sphere
const sphereGeometry: SphereGeometry = new SphereGeometry(20, 30, 30).scale(1, 1, 1);
const sphereMaterialB: MeshBasicMaterial = new MeshBasicMaterial({
  color: 16777215,
  opacity: 0.25,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  side: FrontSide,
  blending: NormalBlending,
});
export const viewCenterMesh: Mesh = new Mesh(sphereGeometry, sphereMaterialB);
viewCenterMesh.name = 'Sphere Center';
viewCenterMesh.visible = false;

export const lightTarget: Object3D = new Object3D();

// Shadow plane
export const shadowMaterial = new ShadowMaterial({
  color: 0,
  opacity: 0.4,
  transparent: true,
  depthTest: true,
  depthWrite: false,
});
export const shadowMesh = new Mesh(new CircleGeometry(settingsState.shadow.radius, 10), shadowMaterial);
shadowMesh.name = 'Shadow Mesh';
shadowMesh.renderOrder = RenderOrder.Shadow;
shadowMesh.receiveShadow = true;

export const regionPolygonFillMaterial = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });

export const regionPolygonLineMaterial = new BetterLineMaterial({
  color: '#5f76d3',
  transparent: true,
  opacity: 0.5,
  linewidth: 3,
  dashed: true,
});

export const addBuildings = async (map: MapBox, buildingsGroup: Group) => {
  const buildingsList: IBuilding[] = await fetchBuildingsList();

  const loader = new GLTFLoader().setPath(`${s3assets}/models/`);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/thirdparty/draco/');
  loader.setDRACOLoader(dracoLoader);

  const tint = '0x99ADFF';

  const filterIds: number[] = [];
  const loadings: Promise<void>[] = [];

  for (const { filename, position, rotation, overlapIds } of buildingsList) {
    const loading = new Promise<void>((resolve, reject) => {
      loader.load(
        filename,
        (gltf: GLTF) => {
          const scene = gltf.scene;
          // console.log(filename);
          // console.log(scene);
          for (const child of scene.children) {
            if (child instanceof Mesh) {
              child.material.color.setHex(tint);
            }
          }
          const lod = new LOD();
          lod.position.fromArray(position);
          lod.rotation.fromArray(rotation);
          lod.addLevel(scene);
          lod.addLevel(new Object3D(), 7000, 0.05);
          buildingsGroup.add(lod);
          if (overlapIds) {
            filterIds.push(...overlapIds);
          }
          resolve();
        },
        () => {},
        (err) => reject(new Error(String(err)))
      );
    });
    loadings.push(loading);
  }

  await Promise.all(loadings);

  const filter: any[] = ['all', ['!=', ['id'], -1], ...filterIds.map((id) => ['!=', ['id'], id])];
  map.setFilter('building-extrusion', filter);
};

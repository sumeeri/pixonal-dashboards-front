import { BufferGeometry, Camera, Group, Object3D, Scene, Vector2, WebGLRenderer } from 'three';
import { LineMaterial, LineMaterialParameters } from 'three/examples/jsm/lines/LineMaterial';

export class BetterLineMaterial extends LineMaterial {
  constructor(parameters?: LineMaterialParameters) {
    super(parameters);
    this.resolution = new Vector2(window.innerWidth, window.innerHeight);
  }

  onBeforeRender(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    object: Object3D,
    group: Group
  ): void {
    super.onBeforeRender(renderer, scene, camera, geometry, object, group);
    this.resolution = new Vector2(renderer.domElement.width, renderer.domElement.height);
  }
}

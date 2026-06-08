import { Camera, Object3D, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';

class SceneRenderPass extends Pass {
  private readonly scene: Object3D;
  private readonly camera: Camera;

  constructor(scene: Object3D, camera: Camera) {
    super();

    this.clear = false;

    this.scene = scene;
    this.camera = camera;
    this.needsSwap = false;
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget): void {
    renderer.setRenderTarget(writeBuffer);
    renderer.render(this.scene, this.camera);
  }
}

export { SceneRenderPass };

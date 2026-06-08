import { MeshBasicMaterial, WebGLRenderer, WebGLRenderTarget } from 'three';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';

class RenderPass extends Pass {
  private material = new MeshBasicMaterial();
  private fsq = new FullScreenQuad(this.material);

  public test: any;

  constructor() {
    super();
    this.clear = false;
    this.needsSwap = false;
  }

  render(renderer: WebGLRenderer, _writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    renderer.setRenderTarget(null);
    renderer.clear();
    this.material.map = readBuffer.texture;
    this.fsq.render(renderer);
  }
}

export { RenderPass };

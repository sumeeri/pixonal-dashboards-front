/**
 * Render mapbox to render target
 */

import { Map } from 'mapbox-gl';
import { WebGLRenderer, WebGLRenderTarget } from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';

class MapboxRenderPass extends Pass {
  private readonly map: Map;
  private isInitialized = false;

  constructor(map: Map) {
    super();

    this.map = map;

    this.clear = false;
    this.needsSwap = false;
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget): void {
    if (!this.isInitialized) {
      // Replace mapbox framebuffer
      renderer.setRenderTarget(writeBuffer);
      const fb = renderer.properties.get(writeBuffer).__webglFramebuffer;

      const map = this.map as any;
      const original_fb_set = map.painter.context.bindFramebuffer.set.bind(map.painter.context.bindFramebuffer);
      map.painter.context.bindFramebuffer.set = (v: WebGLFramebuffer | null) => {
        if (v === null) v = fb;
        original_fb_set(v);
      };

      this.isInitialized = true;
    }
  }
}

export { MapboxRenderPass };

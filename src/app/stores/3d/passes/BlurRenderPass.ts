import {
  Camera,
  DoubleSide,
  Group,
  HalfFloatType,
  Mesh,
  Object3D,
  RawShaderMaterial,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';

import BlurFS from '../shaders/Blur.frag?raw';
import BlurVS from '../shaders/Blur.vert?raw';

class BlurPickMaterial extends ShaderMaterial {
  constructor() {
    super({
      side: DoubleSide,
      vertexShader: `
                uniform vec3 u_cam_position;

                varying float v_z;

                void main() {

                    #include <begin_vertex>
                    #include <project_vertex>

                    v_z = length(u_cam_position - (modelViewMatrix * mvPosition).xyz);
                }
            `,
      fragmentShader: `
                uniform float u_max_dist;
                uniform float u_strength;

                varying float v_z;

                void main() {
                    vec4 color = vec4(0.0);

                    if (v_z <= u_max_dist) {
                        color.x = u_strength;
                    }

                    gl_FragColor = color;
                }
            `,
      uniforms: {
        u_cam_position: new Uniform(new Vector3()),
        u_max_dist: new Uniform(1500),
        u_strength: new Uniform(1),
      },
    });
  }
}

class BlurMaterial extends RawShaderMaterial {
  constructor() {
    super({
      vertexShader: BlurVS,
      fragmentShader: BlurFS,
      uniforms: {
        u_resolution: new Uniform(new Vector2()),
        u_color: new Uniform(null),
        u_blur: new Uniform(null),
      },
    });
  }
}

class BlurRenderPass extends Pass {
  private scene: Group;
  private readonly camera: Camera;
  private blurTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
  private blurMaterial = new BlurMaterial();
  private blurPickMaterial = new BlurPickMaterial();
  private fsq = new FullScreenQuad(this.blurMaterial);

  constructor(scene: Group, camera: Camera) {
    super();

    this.scene = scene;
    this.camera = camera;
    this.clear = false;
    this.needsSwap = false;
  }

  setSize(width: number, height: number): void {
    const current_size = this.blurMaterial.uniforms.u_resolution.value;
    if (current_size.x !== width || current_size.y !== height) {
      this.blurTarget.setSize(width, height);
      current_size.set(width, height);
    }
  }

  render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    // clear blur data
    renderer.setRenderTarget(this.blurTarget);
    renderer.clear();

    // make blur data from render target
    this.blurPickMaterial.uniforms.u_cam_position.value
      .set(0, 0, 0)
      .applyMatrix4(this.camera.projectionMatrix.clone().invert());
    const originalAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.scene.traverse((obj: Object3D) => {
      if (obj.type !== 'Mesh' || !obj.userData.isBlur) return;
      const mesh = obj as Mesh;

      const originalMaterial = mesh.material;
      mesh.material = this.blurPickMaterial;
      this.blurPickMaterial.uniforms.u_strength.value = +mesh.userData.isBlur;

      renderer.render(mesh, this.camera);

      mesh.material = originalMaterial;
    });
    renderer.autoClear = originalAutoClear;

    // apply blur to color render target
    renderer.setRenderTarget(readBuffer);
    this.blurMaterial.uniforms.u_color.value = writeBuffer.texture;
    this.blurMaterial.uniforms.u_blur.value = this.blurTarget.texture;
    this.fsq.render(renderer);
  }
}

export { BlurRenderPass };

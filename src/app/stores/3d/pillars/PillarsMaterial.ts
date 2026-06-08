import { Color, GLSL3, ShaderLib, ShaderMaterial, Uniform, UniformsUtils } from 'three';

import PillarsFS from '../shaders/Pillars.frag?raw';
import PillarsVS from '../shaders/Pillars.vert?raw';

class PillarsMaterial extends ShaderMaterial {
  // adding lambert material processing
  public isMeshLambertMaterial = true;

  constructor() {
    super({
      vertexShader: PillarsVS,
      fragmentShader: PillarsFS,
      uniforms: UniformsUtils.merge([
        UniformsUtils.clone(ShaderLib.lambert.uniforms),
        {
          diffuse: new Uniform(new Color(1, 1, 1)),
          uAnimationK: new Uniform(0),
          selectedInstance: new Uniform(-1),
          lowColor: new Uniform(new Color(0, 0, 0)),
          highColor: new Uniform(new Color(1, 1, 1)),
          colorCurve: new Uniform(1),
          colorMul: new Uniform(1),
          matcap: new Uniform(null),
          map: new Uniform(null),
        },
      ]),
      defines: {
        USE_COLOR: '',
        USE_MATCAP: '',
        USE_MAP: '',
        MAP_UV: 'uv',
      },
    });
  }

  get animationK(): number {
    return this.uniforms.uAnimationK.value;
  }
  set animationK(value: number) {
    this.uniforms.uAnimationK.value = value;
  }

  get isPick() {
    return 'PICK_INSTANCE_ID' in this.defines;
  }
  set isPick(value: boolean) {
    if (this.isPick === value) return;

    if (value) {
      this.defines['PICK_INSTANCE_ID'] = '';
      this.defines['gl_FragColor'] = '_FragColor';
      this.glslVersion = GLSL3;
    } else {
      delete this.defines['PICK_INSTANCE_ID'];
      delete this.defines['gl_FragColor'];
      this.glslVersion = null;
    }
    this.needsUpdate = true;
  }
}

export { PillarsMaterial };

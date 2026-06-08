import {
  DoubleSide,
  NormalBlending,
  ShaderLib,
  ShaderMaterial,
  Uniform,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
} from 'three';

import FenceFS from '../../shaders/Fence.frag?raw';
import fenceVertShader from '../../shaders/Fence.vert?raw';

export class FenceMaterial extends ShaderMaterial {
  // adding lambert material processing
  public isMeshLambertMaterial = true;

  constructor() {
    super({
      vertexShader: fenceVertShader,
      fragmentShader: FenceFS,
      uniforms: UniformsUtils.merge([
        // uniq uniforms
        UniformsUtils.clone(ShaderLib.lambert.uniforms),
        {
          uCameraPos: new Uniform(new Vector3(0, 0, 0)),
          uPitchAngle: new Uniform(0),
          uIsShowEmpty: new Uniform(false),
          uHideDistance: new Uniform(100),
          uFadeParam: new Uniform(150),
          uFenceIndexSelected: new Uniform(-1),
          uAnimationK: new Uniform(0),
          uClipPolygon: new Uniform([]),
        },
        // global uniforms
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        UniformsLib.clip_polygon,
      ]),
      defines: {
        clipPoints: 0,
      },
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      depthTest: true,
      wireframe: false,
    });
  }

  get cameraPos(): Vector3 {
    return this.uniforms.uCameraPos.value;
  }
  set cameraPos(value: Vector3) {
    this.cameraPos.copy(value);
  }

  get pitchAngle(): number {
    return this.uniforms.uPitchAngle.value;
  }
  set pitchAngle(value: number) {
    this.uniforms.uPitchAngle.value = value;
  }

  get isShowEmpty(): boolean {
    return this.uniforms.uIsShowEmpty.value;
  }
  set isShowEmpty(value: boolean) {
    this.uniforms.uIsShowEmpty.value = value;
  }

  get hideDistance(): number {
    return this.uniforms.uHideDistance.value;
  }
  set hideDistance(value: number) {
    this.uniforms.uHideDistance.value = value;
  }

  get fadeParam(): number {
    return this.uniforms.uFadeParam.value;
  }
  set fadeParam(value: number) {
    this.uniforms.uFadeParam.value = value;
  }

  get fenceIndexSelected(): number {
    return this.uniforms.uFenceIndexSelected.value;
  }
  set fenceIndexSelected(value: number) {
    this.uniforms.uFenceIndexSelected.value = value;
  }

  get animationK(): number {
    return this.uniforms.uAnimationK.value;
  }
  set animationK(value: number) {
    this.uniforms.uAnimationK.value = value;
  }

  set clipPoints(value: Vector2[]) {
    if (this.defines.clipPoints !== value.length) {
      this.uniforms.uClipPolygon.value = new Float32Array(value.length * 2);
      this.defines.clipPoints = value.length;
      this.needsUpdate = true;
    }

    for (let i = 0; i < value.length; i++) {
      value[i].toArray(this.uniforms.uClipPolygon.value, i * 2);
    }
  }
}

export const fenceMaterial: FenceMaterial = new FenceMaterial();

export const setUniformFenceMaterial = (guiState: any): FenceMaterial => {
  fenceMaterial.isShowEmpty = guiState.fences.showEmpty;
  fenceMaterial.opacity = guiState.fences.opacity;
  fenceMaterial.hideDistance = guiState.fences.hideDistance;
  fenceMaterial.fadeParam = guiState.fences.fadeParam;

  return fenceMaterial;
};

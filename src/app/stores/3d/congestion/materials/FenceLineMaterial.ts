import {
  NormalBlending,
  ShaderMaterial,
  Uniform,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import FenceLineFS from '../../shaders/FenceLine.frag?raw';
import fenceLineVertShader from '../../shaders/FenceLine.vert?raw';

export class FenceLineMaterial extends ShaderMaterial {
  public readonly isLineMaterial = true;

  constructor() {
    super({
      vertexShader: fenceLineVertShader,
      fragmentShader: FenceLineFS,
      uniforms: UniformsUtils.merge([
        // uniq uniforms
        UniformsUtils.clone(UniformsLib.common),
        UniformsUtils.clone(UniformsLib.fog),
        {
          worldUnits: new Uniform(1),
          linewidth: new Uniform(1),
          resolution: new Uniform(new Vector2(512, 512)),
          dashOffset: new Uniform(0),
          dashScale: new Uniform(0),
          dashSize: new Uniform(0),
          gapSize: new Uniform(0),

          uCameraPos: new Uniform(new Vector3()),
          uPitchAngle: new Uniform(0),
          uIsShowEmpty: new Uniform(false),
          uHideDistance: new Uniform(100 * 1000),
          uFadeParam: new Uniform(100 * 1000),
          maxLinewidth: new Uniform(6),
          minLinewidth: new Uniform(1),
          maxLinewidthDistance: new Uniform(10 * 1000),
          minLinewidthDistance: new Uniform(1000),
          uFenceIndexSelected: new Uniform(-1),
          uAnimationK: new Uniform(0),
        },
        // global uniforms
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        UniformsLib.clip_polygon,
      ]),

      vertexColors: false,
      transparent: true,
      opacity: 0.9,
      blending: NormalBlending,
      linewidth: 6,

      polygonOffset: true,
      polygonOffsetFactor: -10,

      defines: {
        USE_ALPHA_TO_COVERAGE: '',
        clipPoints: 0,
      },
    });
  }

  onBeforeRender(renderer: WebGLRenderer): void {
    this.uniforms.resolution.value = new Vector2(renderer.domElement.width, renderer.domElement.height);
  }

  get color() {
    return this.uniforms.diffuse.value;
  }

  set color(value) {
    this.uniforms.diffuse.value = value;
  }

  get worldUnits() {
    return 'WORLD_UNITS' in this.defines;
  }

  set worldUnits(value: boolean) {
    if (value) {
      this.defines.WORLD_UNITS = '';
    } else {
      delete this.defines.WORLD_UNITS;
    }
  }

  get dashed() {
    return 'USE_DASH' in this.defines;
  }

  set dashed(value: boolean) {
    if (value !== this.dashed) this.needsUpdate = true;

    if (value) {
      this.defines.USE_DASH = '';
    } else {
      delete this.defines.USE_DASH;
    }
  }

  get dashScale() {
    return this.uniforms.dashScale.value;
  }

  set dashScale(value) {
    this.uniforms.dashScale.value = value;
  }

  get dashSize() {
    return this.uniforms.dashSize.value;
  }

  set dashSize(value) {
    this.uniforms.dashSize.value = value;
  }

  get dashOffset() {
    return this.uniforms.dashOffset.value;
  }

  set dashOffset(value) {
    this.uniforms.dashOffset.value = value;
  }

  get gapSize() {
    return this.uniforms.gapSize.value;
  }

  set gapSize(value) {
    this.uniforms.gapSize.value = value;
  }

  get resolution() {
    return this.uniforms.resolution.value;
  }

  set resolution(value) {
    this.uniforms.resolution.value.copy(value);
  }

  get cameraPos(): Vector3 {
    return this.uniforms.uCameraPos.value;
  }
  set cameraPos(value: Vector3) {
    this.uniforms.uCameraPos.value = value;
  }

  get pitchAngle(): number {
    return this.uniforms.uPitchAngle.value;
  }
  set pitchAngle(value: number) {
    this.uniforms.uPitchAngle.value = value;
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

  get maxLinewidth(): number {
    return this.uniforms.maxLinewidth.value;
  }
  set maxLinewidth(value: number) {
    this.uniforms.maxLinewidth.value = value;
  }

  get minLinewidth(): number {
    return this.uniforms.minLinewidth.value;
  }
  set minLinewidth(value: number) {
    this.uniforms.minLinewidth.value = value;
  }

  get maxLinewidthDistance(): number {
    return this.uniforms.maxLinewidthDistance.value;
  }
  set maxLinewidthDistance(value: number) {
    this.uniforms.maxLinewidthDistance.value = value;
  }

  get minLinewidthDistance(): number {
    return this.uniforms.minLinewidthDistance.value;
  }
  set minLinewidthDistance(value: number) {
    this.uniforms.minLinewidthDistance.value = value;
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

  get isShowEmpty(): boolean {
    return this.uniforms.uIsShowEmpty.value;
  }
  set isShowEmpty(value: boolean) {
    this.uniforms.uIsShowEmpty.value = value;
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

export const fenceLineMaterial = new FenceLineMaterial();

export const setUniformFenceLineMaterial = (guiState: any): FenceLineMaterial => {
  fenceLineMaterial.hideDistance = guiState.fenceLines.hideDistance * 1000;
  fenceLineMaterial.fadeParam = guiState.fenceLines.fadeParam * 1000;
  fenceLineMaterial.maxLinewidth = guiState.fenceLines.maxLinewidth;
  fenceLineMaterial.minLinewidth = guiState.fenceLines.minLinewidth;
  fenceLineMaterial.maxLinewidthDistance = guiState.fenceLines.maxLinewidthDistance * 1000;
  fenceLineMaterial.minLinewidthDistance = guiState.fenceLines.minLinewidthDistance * 1000;

  return fenceLineMaterial;
};

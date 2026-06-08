import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  IntType,
  PerspectiveCamera,
  RGBAIntegerFormat,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

import { RenderOrder } from '../RenderOrderEnum';
import { PillarsSettings } from '../SettingsState';
import { PillarsMaterial } from './PillarsMaterial';

const matcapTexture = new TextureLoader().load('textures/matcap/00012.png');
const shadowTexture = new TextureLoader().load('textures/shadow-gradient.png');

class PillarsMesh extends InstancedMesh {
  private pickMaterial: PillarsMaterial;
  private pickRT: WebGLRenderTarget;
  private pickColor: Color;

  public material: PillarsMaterial; // override material type

  constructor(private pillarsSettings: PillarsSettings) {
    // super(new CylinderGeometry(25, 25, 1, 6).rotateX(-Math.PI / 2).translate(0, 0, 0.5), undefined, 0);
    super(
      new BoxGeometry(pillarsSettings.width, pillarsSettings.width, 1).rotateZ(Math.PI / 6).translate(0, 0, 0.5),
      undefined,
      0
    );
    this.material = new PillarsMaterial();
    this.material.uniforms['matcap'].value = matcapTexture;
    this.material.uniforms['map'].value = shadowTexture;

    this.pickMaterial = new PillarsMaterial();
    this.pickMaterial.isPick = true;
    this.pickRT = new WebGLRenderTarget(1, 1, {
      format: RGBAIntegerFormat,
      type: IntType,
      internalFormat: 'RGBA32I',
    });
    this.pickColor = new Color(-1, -1, -1);

    this.initGeometryAttributes();

    this.name = 'Pillars';
    this.castShadow = true;
    this.renderOrder = RenderOrder.Pillars;
    this.frustumCulled = false;

    this.scale.set(1, 1, pillarsSettings.maxHeight);
  }

  private initGeometryAttributes() {
    const translateAttr = new InstancedBufferAttribute(new Float32Array(3), 3).setUsage(DynamicDrawUsage);
    const heightAttr = new InstancedBufferAttribute(new Uint8Array(1), 1, true).setUsage(DynamicDrawUsage);

    this.geometry.setAttribute('translate', translateAttr);
    this.geometry.setAttribute('currentHeight', heightAttr);
    this.geometry.setAttribute('targetHeight', heightAttr.clone());

    this.count = heightAttr.count;
  }

  public clearAttributes() {
    const translateAttr = new InstancedBufferAttribute(new Float32Array(3), 3).setUsage(DynamicDrawUsage);
    const heightAttr = new InstancedBufferAttribute(new Uint8Array(1), 1, true).setUsage(DynamicDrawUsage);

    this.geometry.setAttribute('translate', translateAttr);
    this.geometry.setAttribute('currentHeight', heightAttr);
    this.geometry.setAttribute('targetHeight', heightAttr.clone());
  }

  public setPositions(array: number[]) {
    const translateAttr = new InstancedBufferAttribute(new Float32Array(array), 3).setUsage(DynamicDrawUsage);

    this.geometry.setAttribute('translate', translateAttr);

    this.count = translateAttr.count;

    this.material.uniforms['lowColor'].value = new Color(this.pillarsSettings.lowColor).convertLinearToSRGB();
    this.material.uniforms['highColor'].value = new Color(this.pillarsSettings.highColor).convertLinearToSRGB();
    this.material.uniforms['colorCurve'].value = this.pillarsSettings.colorCurve;
    this.material.uniforms['colorMul'].value = this.pillarsSettings.colorMul;
  }

  private updateHeight() {
    const currentAttr = this.geometry.getAttribute('currentHeight');
    if (!currentAttr) return;
    const targetAttr = this.geometry.getAttribute('targetHeight');
    if (!targetAttr) return;

    const k = this.material.animationK;

    if (k > 0.9) {
      currentAttr.array.set(targetAttr.array);
    } else {
      for (let i = 0; i < currentAttr.count; i++) {
        const current = currentAttr.array[i];
        const target = targetAttr.array[i];
        currentAttr.array[i] = current + (target - current) * k;
      }
    }

    currentAttr.needsUpdate = true;
  }

  public setHeights(current?: number[], target?: number[]) {
    if (current) {
      const currentAttr = new InstancedBufferAttribute(new Uint8Array(current), 1, true).setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('currentHeight', currentAttr);
      this.count = currentAttr.count;
    } else {
      this.updateHeight();
    }

    if (target) {
      const targetAttr = new InstancedBufferAttribute(new Uint8Array(target), 1, true).setUsage(DynamicDrawUsage);
      this.geometry.setAttribute('targetHeight', targetAttr);
      this.count = targetAttr.count;
    }
  }

  public pick(pointer: Vector2, renderer: WebGLRenderer, camera: PerspectiveCamera, size: Vector2): number {
    const oldMaterial = this.material;
    const oldRT = renderer.getRenderTarget();
    const oldClearColor = renderer.getClearColor(new Color());

    this.material = this.pickMaterial;
    renderer.setRenderTarget(this.pickRT);
    renderer.setClearColor(this.pickColor);
    renderer.clear();
    camera.setViewOffset(size.x, size.y, pointer.x, pointer.y, 1, 1);

    renderer.render(this, camera);

    this.material = oldMaterial;
    renderer.setRenderTarget(oldRT);
    renderer.setClearColor(oldClearColor);
    camera.clearViewOffset();

    const pixelBuffer = new Int32Array(4);
    renderer.readRenderTargetPixels(this.pickRT, 0, 0, 1, 1, pixelBuffer);

    return pixelBuffer[0];
  }
}

export { PillarsMesh };

import { BatchedMesh, BufferAttribute, Color, MathUtils, Matrix4, Path, Shape, ShapeGeometry } from 'three';

import { mapLandUsePlotTypes } from '../../../../entities/dashboard/landUsePlotMapping.ts';
import { Slide } from '../../../../entities/dashboard/types.ts';
import settingsState from '../SettingsState.ts';
import { prepareGeometry } from '../ZoneGeometry.ts';
import {
  LandUseConsumptionPlotData,
  LandUseGeometryBase,
  LandUsePlotData as LandUsePlotData,
  LandUseZoneData,
  PlotConstructionStatus,
} from './LandUseDataTypes.ts';

const colors = new Map<PlotConstructionStatus, [Color, number]>([
  ['Hidden', [new Color(0x313d76).convertLinearToSRGB(), 1]],
  ['Constructed', [new Color(0xcfb73c).convertLinearToSRGB(), 1]],
  ['Not Constructed', [new Color(0x1775df).convertLinearToSRGB(), 1]],
  ['Only Boundary Wall', [new Color(0xcf554e).convertLinearToSRGB(), 1]],
  ['Under Construction', [new Color(0xcf554e).convertLinearToSRGB(), 1]],

  ['RESIDENTIAL - Villa', [new Color(0xffde34).convertLinearToSRGB(), 1]],
  ['RESIDENTIAL - Apartment', [new Color(0xe59802).convertLinearToSRGB(), 1]],
  ['RESIDENTIAL - Planned', [new Color(0xffbeb2).convertLinearToSRGB(), 1]],

  ['SCHOOLS - Higher Education', [new Color(0xff644a).convertLinearToSRGB(), 1]],
  ['SCHOOLS - Nurseries', [new Color(0x4fa126).convertLinearToSRGB(), 1]],
  ['SCHOOLS - Private', [new Color(0x03c5ff).convertLinearToSRGB(), 1]],
  ['SCHOOLS - Public', [new Color(0x5b6bfd).convertLinearToSRGB(), 1]],
  ['SCHOOLS - Charter Schools', [new Color(0xf79eff).convertLinearToSRGB(), 1]],
  ['SCHOOLS - POD Schools', [new Color(0xe59902).convertLinearToSRGB(), 1]],
  ['SCHOOLS - Tolerance Schools', [new Color(0xffde34).convertLinearToSRGB(), 1]],

  ['INDUSTRY - Default', [new Color(0x03c5ff).convertLinearToSRGB(), 1]],

  ['MEDICAL - Active', [new Color(0x4fa126).convertLinearToSRGB(), 1]],
  ['MEDICAL - Planned', [new Color(0xf79eff).convertLinearToSRGB(), 1]],

  ['OFFICES - Public', [new Color(0xf79eff).convertLinearToSRGB(), 1]],
  ['OFFICES - Private', [new Color(0x03c5ff).convertLinearToSRGB(), 1]],

  ['RETAIL - Mall', [new Color(0xb42179).convertLinearToSRGB(), 1]],
  ['RETAIL - Other', [new Color(0xd6bcff).convertLinearToSRGB(), 1]],

  ['HOTELS - Hotels', [new Color(0x4fa126).convertLinearToSRGB(), 1]],
  ['HOTELS - Resorts', [new Color(0xf79eff).convertLinearToSRGB(), 1]],

  ['OTHERS - Religious', [new Color(0xcfb73c).convertLinearToSRGB(), 1]],
  ['OTHERS - Park', [new Color(0xcf554e).convertLinearToSRGB(), 1]],
  ['OTHERS - Other', [new Color(0x1775df).convertLinearToSRGB(), 1]],
]);

const utilizationColors: [Color, number][] = [
  [new Color(0x008399).convertLinearToSRGB(), 1],
  [new Color(0xffcda7).convertLinearToSRGB(), 1],
  [new Color(0x7e53ff).convertLinearToSRGB(), 1],
];

export function getColorForUtilizationPlot(value: number): [Color, number] {
  return utilizationColors[Math.ceil(MathUtils.clamp(MathUtils.mapLinear(value, 100, 5000, 0, 2), 0, 2))]!;
}

const consumptionColorFrom = new Color('rgb(48, 76, 191)').convertLinearToSRGB();
const consumptionColorTo = new Color('rgb(242, 70, 70)').convertLinearToSRGB();

export function getColorForConsumptionPlot(slide: Slide, data: LandUseConsumptionPlotData): [Color, number] {
  if (slide == Slide.LAND_USE_WATER_CONSUMPTION) {
    return [new Color(consumptionColorFrom).lerp(consumptionColorTo, MathUtils.clamp(data.value / 5000, 0, 1)), 1];
  } else {
    return [new Color(consumptionColorFrom).lerp(consumptionColorTo, MathUtils.clamp(data.value / 50000, 0, 1)), 1];
  }
}

export function getColorForPlot(
  slide: Slide,
  plot: LandUsePlotData,
  overrideBuildingStatus?: PlotConstructionStatus
): [Color, number] {
  if (slide == Slide.LAND_USE_HOSPITALITY) {
    return colors.get(overrideBuildingStatus ?? mapLandUsePlotTypes(slide, plot.state) ?? plot.state)!;
  } else {
    return colors.get(overrideBuildingStatus ?? mapLandUsePlotTypes(slide, plot.type) ?? plot.state)!;
  }
}

export function getColorForZone(
  _slide: Slide,
  zone: LandUseZoneData,
  maxGfa: number, // added
  _overrideBuildingStatus?: PlotConstructionStatus
): [Color, number] {
  const alpha = MathUtils.clamp((zone.gfa / maxGfa) * 50, 0, 1);
  return [
    new Color(settingsState.landUseZones.lowColor)
      .lerp(new Color(settingsState.landUseZones.highColor), alpha)
      .convertLinearToSRGB(),
    MathUtils.lerp(settingsState.landUseZones.lowAlpha, settingsState.landUseZones.highAlpha, alpha),
  ];
}

export class LandUseObject3D {
  public geometryId: number = -1;

  constructor(batchedMesh: BatchedMesh, building: LandUseGeometryBase, color: Color, opacity: number) {
    const { geometry } = building;

    for (const zoneGeometry of geometry) {
      const { pointsVector2, holesPointsVector2 } = prepareGeometry(zoneGeometry);

      const shape = new Shape(pointsVector2);

      shape.holes = holesPointsVector2.map((x) => new Path(x));

      const geometry = new ShapeGeometry(shape);

      const numVertices = geometry.getAttribute('position').count;
      const colorsArray = new Uint8Array(numVertices * 4); // 4 components per vertex color (RGBA)

      // Fill the array with color data
      for (let i = 0; i < numVertices; i++) {
        const offset = i * 4;
        // Example: Setting each vertex to red with full opacity
        colorsArray[offset] = color.r * 255; // Red
        colorsArray[offset + 1] = color.g * 255; // Green
        colorsArray[offset + 2] = color.b * 255; // Blue
        colorsArray[offset + 3] = opacity * 255; // Alpha
      }

      geometry.setAttribute('color', new BufferAttribute(colorsArray, 4));
      geometry.attributes.color.normalized = true; // Important for Uint8Array color data

      this.geometryId = batchedMesh.addGeometry(geometry);
      batchedMesh.setMatrixAt(this.geometryId, new Matrix4());
    }
  }
}

export const shadowQualities = { r512: 512, r1024: 1024, r2048: 2048, r4096: 4096, r8192: 8192 };

export type PillarsSettings = {
  width: number;
  maxHeight: number;
  lowColor: string;
  highColor: string;
  colorCurve: number;
  colorMul: number;
};

const settingsState = {
  population: {
    lowColor: '#152054',
    highColor: '#00ac9e',
    opacity: 0.85,
  },
  congestion: {
    canSelectOnlyUnusual: false,
  },
  fences: {
    visible: true,
    showEmpty: false,
    opacity: 0.5,
    hideDistance: 110,
    fadeParam: 100,
    wireframe: false,
  },
  fenceLines: {
    visible: true,
    maxLinewidth: 6,
    minLinewidth: 1,
    maxLinewidthDistance: 10,
    minLinewidthDistance: 1,
    hideDistance: 110,
    fadeParam: 100,
  },
  fenceInfoIcons: {
    hideDistance: 8,
    iconSize: 25,
  },
  populationMovement: {
    extrudeHeight: 5,
    animationSpeed: 1000,
    flowGeometryThicknes: 1,
    flowGeometryWidth: 7.5,
    flowOpacity: 0.8,
    arcLineWidth: 3,
  },
  aviation: {
    animationSpeed: 100000,
  },
  failingJunctions: {
    LOScolors: ['#2cf65c', '#F5B719', '#f14646'],
  },
  landUseZones: {
    lowColor: '#00ac9e',
    lowAlpha: 0.1,
    highColor: '#00ac9e',
    highAlpha: 0.9,
  },
  landUsePillars: {
    width: 50,
    maxHeight: 1000,
    lowColor: '#304CBF',
    highColor: '#F24646',
    colorCurve: 1.05,
    colorMul: 1.5,
  } as PillarsSettings,
  busStopPillars: {
    width: 150,
    maxHeight: 2000,
    lowColor: '#3A097B',
    highColor: '#25C1E6',
    colorCurve: 2.5,
    colorMul: 1.5,
  } as PillarsSettings,
  shadow: {
    visible: false,
    color: '#000000',
    opacity: 0.4,
    quality: shadowQualities.r4096,
    radius: 1000,
  },
  light: {
    color: '#ffffff',
    intensity: 2,
  },
  timeInterval: {
    normalizedData: true,
  },
};

export default settingsState;

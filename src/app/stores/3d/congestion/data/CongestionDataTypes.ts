export type FenceId = number;

export type CongestionFenceData = {
  id: FenceId; // Camera id
  speed: number; // Max speed
  capacity: number; // Capacity
  geometry: number[]; // Coords [lat, lng, ... ]
  location: number; // Zone
  nextId: number[];
  previousId: number[];
};

export type CongestionParamsData = {
  sensorId: FenceId;
  delayProportion: number;
  value: number;
  recurrency: number;
  geometry: number[];
  flow: number;
  streetName: string;
};

export type CongestionTooltipData = {
  delayTime: number;
  delayCost: number;
  lanes: number;
  relativeSpeed: number;
  speed: number;
  volume: number;
  density: number;
};

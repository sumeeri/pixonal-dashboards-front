interface IBuilding {
  filename: string;
  position: [number, number, number];
  rotation: [number, number, number];
  overlapIds?: number[];
}

export default IBuilding;

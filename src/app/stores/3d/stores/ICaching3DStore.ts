export interface ICaching3DStore {
  startPreloadData(startFromIndex: number, length: number): void;
  stopPreloadData(): void;
  resetCachedIndixes(): void;
}

export type JunctionId = string;

export class JunctionData {
  constructor(
    public i: JunctionId, // junction_id
    public g: [number, number] // lng, lat
  ) {}

  public get lng(): number {
    return this.g[0];
  }

  public get lat(): number {
    return this.g[1];
  }
}

/** A - very good, F - very bad */
export type LevelOfServive = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type JunctionParamsData = {
  id: JunctionId;
  delay: number;
  serviceLevel: LevelOfServive;
};

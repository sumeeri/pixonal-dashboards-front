export type AccidentId = number;

type InjuryLevel = 'minor' | 'moderate' | 'severe' | 'fatal';

export class AccidentData {
  constructor(
    public point: [number, number], // lng, lat
    // public z: number, // zone id, -1 is unknown
    // public k: string, // kind info
    // public w: string, // whereabout
    public injuries: number, // injuries, 0 = "Accident with unknown causer", 1 = "Accident without injuries",  2 = "Accident with injuries", -1 = unknown
    // public s: string, // street name
    // public c: string, // cause
    public injuryLevel: InjuryLevel, // injure_level
    public affectedPeopleCount: number, // nb_people
    public accidentId: number
  ) {}

  public get lng(): number {
    return this.point[0];
  }

  public get lat(): number {
    return this.point[1];
  }

  public get injureLevel(): number {
    return (typeof this.injuryLevel).indexOf(this.injuryLevel);
  }
}

export type AccidentTooltipData = {
  noOfAffected: number;
  whereabout: string;
  injuryType: string;
  description: string;

  // kind: string;
  // whereabout: string;
  // streetName: string;
  // cause: string;
  // point: null;
  // injuries: number;
  // injuryLevel: InjuryLevel;
  // affectedPeopleCount: number;
  // accidentId: string;
};

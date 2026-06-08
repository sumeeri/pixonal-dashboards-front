import { Group, Intersection, MathUtils, Raycaster, Vector3 } from 'three';

import { LocationWithGeometry } from '../../../../entities/locationPanel/types';
import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import MapUtils from '../MapUtils';
import { ArcAndCircleObject3D } from '../population/ArcAndCircleObject3D';
import settingsState from '../SettingsState';
import { AviationTransferDataType } from './AviationDataTypes';

const AVIATION_INNER_DISK_MAX_RADIUS = 50000;

const MIN_VALUE = 1000;

export class AviationTransferArcsGroup
  extends Group
  implements
    IDataModelDisplayGroup<string, LocationWithGeometry, Map<string, AviationTransferDataType>, undefined, string>
{
  private _arcsMap = new Map<string, ArcAndCircleObject3D>();
  public get arcsMap() {
    return this._arcsMap;
  }

  private _movesMap = new Map<string, AviationTransferDataType>();
  public get movesMap() {
    return this._movesMap;
  }

  private _selectedArc?: string | undefined;
  public get selectedArc(): string | undefined {
    return this._selectedArc;
  }

  private zonesMap = new Map<string, LocationWithGeometry>();

  private current = new Map<string, Map<string, AviationTransferDataType>>();
  private target = new Map<string, Map<string, AviationTransferDataType>>();

  private currentMin = 0;
  private currentMax = 0;

  constructor(private clampSize: boolean = false) {
    super();
  }

  create(zonesMap: Map<string, LocationWithGeometry>): void {
    this.zonesMap = zonesMap;
  }

  setData(
    current: Map<string, Map<string, AviationTransferDataType>>,
    target: Map<string, Map<string, AviationTransferDataType>>,
    _paramFormula: undefined = undefined,
    _selectedZone: string = '',
    inbound = false,
    switchFromTo = inbound
  ): void {
    this.current = current;
    this.target = target;

    let minValue: number;
    let maxValue = 0;

    const keys = new Set<String>();

    function addMapToSet(map: Map<string, Map<string, AviationTransferDataType>>) {
      for (const fromKey of map.keys()) {
        const inner = map.get(fromKey)!;
        for (const toKey of inner.keys()) {
          keys.add([fromKey, toKey].join('/'));
        }

        inner.forEach((value, key) => {
          if (key === fromKey) {
            return;
          }

          if (minValue === undefined) {
            minValue = value.count;
          }

          minValue = Math.min(minValue, value.count);
          maxValue = Math.max(maxValue, value.count);
        });
      }
    }

    addMapToSet(current);

    if (current.size === 0 && target.size === 0) {
      minValue = 0;
    }

    this.currentMin = minValue!;
    this.currentMax = maxValue;

    for (const key of keys) {
      let [from, to] = key.split('/');

      const currentMove = current.get(from)?.get(to);
      const targetMove = target.get(from)?.get(to);

      if (from == to) continue;

      const currentValue = currentMove?.count ?? 0;

      const arcId = [from, to].join('/');

      if (switchFromTo) {
        const temp = from;
        from = to;
        to = temp;
      }

      try {
        const fromZone = this.zonesMap.get(from)!;
        const toZone = this.zonesMap.get(to)!;

        const startWgs = fromZone.center;
        const endWgs = toZone.center;

        const startPoint = MapUtils.getPositionFromWgs(startWgs![0], startWgs![1]);
        const endPoint = MapUtils.getPositionFromWgs(endWgs![0], endWgs![1]);

        const moveCircleObject3D = new ArcAndCircleObject3D(
          arcId,
          startPoint,
          endPoint,
          0,
          inbound,
          this.clampSize,
          settingsState.aviation.animationSpeed,
          AVIATION_INNER_DISK_MAX_RADIUS
        );

        moveCircleObject3D.setValue((currentValue / this.currentMax) * MIN_VALUE);

        this.arcsMap.set(arcId, moveCircleObject3D);
        this.movesMap.set(arcId, (currentMove ?? targetMove)!);

        this.add(moveCircleObject3D);
      } catch (er) {
        // eslint-disable-next-line no-console
        console.log(`Can't find country with name "${to}"`);
      }
    }
  }

  clearMovesDisplay() {
    this.clear();
    this.arcsMap.clear();
    this.movesMap.clear();
  }

  raycast(raycaster: Raycaster): [string, Intersection] | undefined {
    const recover = raycaster.params.Line2;
    raycaster.params.Line2 = { threshold: 25 };
    const intersects = raycaster.intersectObjects(this.children, true);
    raycaster.params.Line2 = recover;

    const intersection = intersects[0];
    if (intersection) {
      const object = intersection.object;
      if (object instanceof ArcAndCircleObject3D) {
        return [object.arcId, intersection];
      }
    } else {
      return undefined;
    }
  }

  select(id: string): void {
    this._selectedArc = id;
    const arcSelect = this.arcsMap.get(id);
    for (const arc of this.arcsMap.values()) {
      arc.setDimm(arc !== arcSelect);
    }
  }

  deselect(): void {
    this._selectedArc = undefined;
    for (const arc of this.arcsMap.values()) {
      arc.setDimm(false);
    }
  }

  updateAnimation(k: number, _mul: number = 1): void {
    for (const [arcKey, arc] of this.arcsMap) {
      const [from, to] = arcKey.split('/');
      const currentMove = this.current.get(from)?.get(to);
      const targetMove = this.target.get(from)?.get(to);

      const currentValue = MathUtils.lerp(
        currentMove?.count ?? this.currentMin,
        targetMove?.count ?? this.currentMin,
        k
      );

      arc.setValue((currentValue / this.currentMax) * MIN_VALUE);
    }
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}

import { makeAutoObservable } from 'mobx';
import { Vector2, Vector3 } from 'three';

import { MarkerType } from '../../entities/dashboard/types';
import map3d from './3d/Map3d';
import MapUtils from './3d/MapUtils';

export type Mark = {
  id: number;
  value?: string;
  isShow: boolean;
  type: MarkerType;
  sup?: string;
  position: [number, number];
  coord?: Vector3;
};

export class InfoMarkerStore {
  public data: Mark[] = [];

  public getData(markerTypes: MarkerType[]) {
    return this.data?.filter((el) => markerTypes.includes(el.type));
  }

  public updateMarkerPosition(markId: number, coord: Vector3): void {
    const mark = this.getMark(markId);
    if (mark) {
      mark.coord = coord;
    }
  }

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public getMarkPosition(markId: number): Vector2 {
    const mark = this.getMark(markId);
    if (map3d.mapbox && mark?.coord) {
      map3d.cameraUpdateFrames;
      const canvas: HTMLCanvasElement = map3d.mapbox.getCanvas();
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      return MapUtils.worldToScreen(mark.coord, map3d.camera, width, height);
    }

    return new Vector2();
  }

  private getMark(markId: number): Mark | null {
    return this.data.find((el) => el.id === markId) ?? null;
  }
}

const infoMarkerStoreInstance = new InfoMarkerStore();
export default infoMarkerStoreInstance;

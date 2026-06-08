import { Vector3 } from 'three';

import IInfoPopupState from '../IInfoPopupState';

interface IArcInfoPopupState extends IInfoPopupState {
  worldPosition: Vector3;
  msg: string;
}

export default IArcInfoPopupState;

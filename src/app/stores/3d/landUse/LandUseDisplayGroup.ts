import { BatchedMesh, Color, DoubleSide, Group, Intersection, MeshBasicMaterial, Raycaster, Vector3 } from 'three';

import { IDataModelDisplayGroup } from '../IDataModelDisplayGroup';
import { LandUseGeometryBase, LandUsePlotId, LandUseZoneId } from './LandUseDataTypes';
import { LandUseObject3D } from './LandUseObject3D';

const MAX_OBJECTS_PER_BATCH = 20000;
export class LandUseDisplayGroup
  extends Group
  implements
    IDataModelDisplayGroup<
      LandUsePlotId | LandUseZoneId,
      [LandUseGeometryBase, [Color, number]],
      [LandUseGeometryBase, [Color, number]]
    >
{
  private batchIdToLandUseIdMap = new Map<number, LandUsePlotId | LandUseZoneId>();

  create(_models: Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>): void {
    // Empty
  }

  setData(
    current: Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>,
    _target: Map<LandUsePlotId | LandUseZoneId, [LandUseGeometryBase, [Color, number]]>,
    _paramFormula: undefined
  ): void {
    this.clear();
    this.batchIdToLandUseIdMap.clear();

    const batches: BatchedMesh[] = [];
    let currentBatch: BatchedMesh | null = null;
    let objectsInCurrentBatch = 0;

    for (const [key, [landUseGeometryBase, [color, alpha]]] of current) {
      if (!currentBatch || objectsInCurrentBatch === MAX_OBJECTS_PER_BATCH) {
        currentBatch = new BatchedMesh(
          MAX_OBJECTS_PER_BATCH * 2,
          MAX_OBJECTS_PER_BATCH * 150,
          MAX_OBJECTS_PER_BATCH * 150 * 4,
          new MeshBasicMaterial({
            vertexColors: true,
            side: DoubleSide,
            transparent: true,
          })
        );

        currentBatch.perObjectFrustumCulled = false;
        currentBatch.sortObjects = false;

        batches.push(currentBatch);

        objectsInCurrentBatch = 0;
      }

      const buildingObject3D = new LandUseObject3D(currentBatch, landUseGeometryBase, color, alpha);
      this.batchIdToLandUseIdMap.set(buildingObject3D.geometryId, key);

      objectsInCurrentBatch++;
    }

    for (const batch of batches) {
      batch.position.z += 5;

      this.add(batch);
    }
  }

  raycast(raycaster: Raycaster): [LandUsePlotId | LandUseZoneId, Intersection] | undefined {
    const intersects = raycaster.intersectObjects(
      this.children.filter((obj) => obj.visible),
      true
    );

    const intersection = intersects[0];
    if (intersection && intersection.batchId !== undefined) {
      const id = this.batchIdToLandUseIdMap.get(intersection.batchId);
      if (id !== undefined) {
        return [id, intersection];
      }
    }
    return undefined;
  }

  select(_id: LandUsePlotId | LandUseZoneId): void {
    // Empty
  }

  deselect(): void {
    // Empty
  }

  updateAnimation(_k: number): void {
    // Empty
  }

  onCameraMove(_cameraPosition: Vector3, _pitchAngle: number): void {
    // Empty
  }
}

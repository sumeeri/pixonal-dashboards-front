import map3d from './3d/Map3d.ts';
import accidents3DStoreInstance from './3d/stores/Accidents3DStore.ts';
import congestion3DStoreInstance from './3d/stores/Congestion3DStore.ts';
import current3DStoreInstance from './3d/stores/Current3DStore.ts';
import junctions3DStoreInstance from './3d/stores/Junctions3DStore.ts';
import landUseConsumptionPillar3DStoreInstance from './3d/stores/LandUseConsumptionPillar3DStore.ts';
import populationMovement3DStoreInstance from './3d/stores/PopulationMovement3DStore.ts';
import zones3DStoreInstance from './3d/stores/Zones3DStore.ts';
import adminStoreInstance from './adminStore.ts';
import authStoreInstance from './authStore.ts';
import chartsStoreInstance from './chartsStore.ts';
import contentLoadStoreInstance from './contentLoadStore.ts';
import currentUserStoreInstance from './currentUserStore.ts';
import downloadStoreInstance from './DownloadStore.ts';
import errorStoreInstance from './errorStore.ts';
import exportMediaStoreInstance from './ExportMediaStore.ts';
import infoMarkerStoreInstance from './infoMarkerStore.ts';
import infoPopupStoreInstance from './infoPopupStore.ts';
import kpiStoreInstance from './kpiStore.ts';
import locationPanelStoreInstance from './locationPanelStore.ts';
import mapDataValuesStoreInstance from './mapDataValuesStore.ts';
import mobilityOverviewPanelStoreInstance from './mobilityOverviewPanelStore.ts';
import patternsStoreInstance from './patternsStore.ts';
import slidesStoreInstance from './slidesStore.ts';
import screenshotStoreInstance from './sreenshotStore.ts';
import timeIntervalsStoreInstance from './timeIntervalsStore.ts';
import videoRecorderStoreInstance from './VideoRecorderStore.ts';

const rootStore = {
  adminStore: adminStoreInstance,
  errorStore: errorStoreInstance,
  slidesStore: slidesStoreInstance,
  kpiStore: kpiStoreInstance,
  authStore: authStoreInstance,
  currentUserStore: currentUserStoreInstance,
  mapDataValuesStore: mapDataValuesStoreInstance,
  patternStore: patternsStoreInstance,
  map3DStore: map3d,
  downloadStore: downloadStoreInstance,
  infoPopupStore: infoPopupStoreInstance,
  infoMarkerStore: infoMarkerStoreInstance,
  congestion3DStore: congestion3DStoreInstance,
  junctions3DStore: junctions3DStoreInstance,
  accidents3DStore: accidents3DStoreInstance,
  landUse3DStore: landUseConsumptionPillar3DStoreInstance,
  populationMovement3DStore: populationMovement3DStoreInstance,
  current3DStore: current3DStoreInstance,
  contentLoadStore: contentLoadStoreInstance,
  timeIntervalsStore: timeIntervalsStoreInstance,
  locationPanelStore: locationPanelStoreInstance,
  mobilityOverviewPanelStore: mobilityOverviewPanelStoreInstance,
  screenshotStore: screenshotStoreInstance,
  exportMediaStore: exportMediaStoreInstance,
  zones3DStore: zones3DStoreInstance,
  chartsStore: chartsStoreInstance,
  videoRecordingStore: videoRecorderStoreInstance,
};

export default rootStore;

import { DataType } from 'shared/constants/mapDataParams';

export type MaritimeGeometry = [number, number];

export type MaritimeFacilitiesDataType = {
  harbourName: string;
  count: number;
  tripsCount: number;
};

export type MaritimeFacilitiesDataWithLocation = MaritimeFacilitiesDataType & { location: MaritimeGeometry };

export type MaritimeGeometryData = {
  harbourName: string;
  geometry: MaritimeGeometry;
};

export type MaritimeTripsFetchArgs = { dataType: DataType; startDate: Date; endDate: Date };

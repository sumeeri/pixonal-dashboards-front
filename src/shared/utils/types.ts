export type Modify<Target, Source> = Omit<Target, keyof Source> & Source;

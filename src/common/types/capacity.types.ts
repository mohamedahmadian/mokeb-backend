export interface MawkibCapacitySnapshot {
  maleCapacity: number;
  femaleCapacity: number;
  availableMale: number;
  availableFemale: number;
}

export function totalCapacity(snapshot: Pick<MawkibCapacitySnapshot, 'maleCapacity' | 'femaleCapacity'>) {
  return snapshot.maleCapacity + snapshot.femaleCapacity;
}

export function totalAvailable(snapshot: Pick<MawkibCapacitySnapshot, 'availableMale' | 'availableFemale'>) {
  return snapshot.availableMale + snapshot.availableFemale;
}

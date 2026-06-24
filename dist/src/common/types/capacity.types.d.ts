export interface MawkibCapacitySnapshot {
    maleCapacity: number;
    femaleCapacity: number;
    availableMale: number;
    availableFemale: number;
}
export declare function totalCapacity(snapshot: Pick<MawkibCapacitySnapshot, 'maleCapacity' | 'femaleCapacity'>): number;
export declare function totalAvailable(snapshot: Pick<MawkibCapacitySnapshot, 'availableMale' | 'availableFemale'>): number;

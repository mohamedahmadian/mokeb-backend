export declare enum AttendanceRosterKind {
    ABSENT = "absent",
    PRESENT = "present"
}
export declare class AttendanceRosterQueryDto {
    kind: AttendanceRosterKind;
    mawkibId?: number;
}

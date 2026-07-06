import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceRosterKind {
  ABSENT = 'absent',
  PRESENT = 'present',
}

export class AttendanceRosterQueryDto {
  @IsEnum(AttendanceRosterKind)
  kind: AttendanceRosterKind;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mawkibId?: number;
}

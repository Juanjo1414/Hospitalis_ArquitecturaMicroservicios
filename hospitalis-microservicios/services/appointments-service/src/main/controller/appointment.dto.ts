import { IsString, IsDateString, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { AppointmentStatus, AppointmentType } from '../domain/appointment.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAppointmentDto {
  @IsMongoId() patientId!: string;
  @IsMongoId() doctorId!: string;
  @IsDateString() date!: string;
  @IsString() startTime!: string;
  @IsString() endTime!: string;
  @IsOptional() @IsEnum(AppointmentType) type?: AppointmentType;
  @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @IsString() reason!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() room?: string;
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}

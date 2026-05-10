import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsMongoId,
  IsDateString, IsArray, IsObject, MaxLength,
} from 'class-validator';
import { RecordType, RecordStatus } from '../domain/medical-record.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMedicalRecordDto {
  @IsMongoId() patientId!: string;
  @IsMongoId() doctorId!: string;
  @IsOptional() @IsMongoId() appointmentId?: string;
  @IsEnum(RecordType, { message: 'type must be one of: ' + Object.values(RecordType).join(', ') })
  @IsNotEmpty() type!: RecordType;
  @IsOptional() @IsEnum(RecordStatus, { message: 'status must be one of: ' + Object.values(RecordStatus).join(', ') })
  status?: RecordStatus;
  @IsString() @IsNotEmpty() @MaxLength(200) title!: string;
  @IsString() @IsNotEmpty() @MaxLength(5000) description!: string;
  @IsOptional() @IsString() @MaxLength(20) icdCode?: string;
  @IsOptional() @IsObject() vitals?: any;
  @IsOptional() @IsObject() labResult?: any;
  @IsOptional() @IsArray() @IsString({ each: true }) attachments?: string[];
  @IsOptional() @IsDateString() recordDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}

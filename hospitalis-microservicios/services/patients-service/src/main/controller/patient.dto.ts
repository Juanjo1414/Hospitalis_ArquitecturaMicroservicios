import {
  IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PatientStatus, BloodType } from '../domain/patient.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePatientDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsDateString() dateOfBirth!: string;
  @IsEnum(['male', 'female', 'other']) gender!: string;
  @IsEmail() @Transform(({ value }) => value.trim().toLowerCase()) email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() emergencyContactName?: string;
  @IsOptional() @IsString() emergencyContactPhone?: string;
  @IsOptional() @IsEnum(BloodType) bloodType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) chronicConditions?: string[];
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(PatientStatus) status?: PatientStatus;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

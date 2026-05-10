import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  SCHEDULED   = 'scheduled',
  CONFIRMED   = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED   = 'completed',
  CANCELLED   = 'cancelled',
  NO_SHOW     = 'no_show',
}

export enum AppointmentType {
  CHECKUP      = 'checkup',
  FOLLOW_UP    = 'follow_up',
  CONSULTATION = 'consultation',
  EMERGENCY    = 'emergency',
  PROCEDURE    = 'procedure',
  LAB          = 'lab',
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ type: String, enum: AppointmentType, default: AppointmentType.CHECKUP })
  type!: AppointmentType;

  @Prop({ type: String, enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status!: AppointmentStatus;

  @Prop({ required: true })
  reason!: string;

  @Prop({ default: '' })
  notes!: string;

  @Prop({ default: '' })
  room!: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

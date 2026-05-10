import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

export enum RecordType {
  DIAGNOSIS     = 'diagnosis',
  CLINICAL_NOTE = 'clinical_note',
  LAB_RESULT    = 'lab_result',
  PRESCRIPTION  = 'prescription',
  PROCEDURE     = 'procedure',
  VITAL_SIGNS   = 'vital_signs',
}

export enum RecordStatus {
  ACTIVE   = 'active',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment', default: null })
  appointmentId!: Types.ObjectId | null;

  @Prop({ type: String, enum: RecordType, required: true })
  type!: RecordType;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status!: RecordStatus;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  icdCode!: string;

  @Prop({ type: Object, default: null })
  vitals!: {
    heartRate?: number; bloodPressure?: string; temperature?: number;
    weight?: number; height?: number; oxygenSaturation?: number; respiratoryRate?: number;
  } | null;

  @Prop({ type: Object, default: null })
  labResult!: {
    testName?: string; result?: string; unit?: string;
    referenceRange?: string; isAbnormal?: boolean;
  } | null;

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ default: Date.now })
  recordDate!: Date;

  @Prop({ trim: true })
  notes!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
MedicalRecordSchema.index({ patientId: 1, recordDate: -1 });
MedicalRecordSchema.index({ patientId: 1, type: 1 });
MedicalRecordSchema.index({ doctorId: 1 });

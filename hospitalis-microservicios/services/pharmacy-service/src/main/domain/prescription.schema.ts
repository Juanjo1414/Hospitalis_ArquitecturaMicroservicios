import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;
export enum PrescriptionStatus { ACTIVE = 'active', EXPIRED = 'expired', CANCELLED = 'cancelled' }
export enum RouteOfAdmin { ORAL = 'oral', INTRAVENOUS = 'intravenous', INTRAMUSCULAR = 'intramuscular', SUBCUTANEOUS = 'subcutaneous', TOPICAL = 'topical', INHALED = 'inhaled', OTHER = 'other' }

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true }) patientId!: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Appointment', default: null }) appointmentId!: Types.ObjectId | null;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) doctorId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) medication!: string;
  @Prop({ required: true }) dosage!: number;
  @Prop({ required: true, trim: true, default: 'mg' }) unit!: string;
  @Prop({ required: true, trim: true }) frequency!: string;
  @Prop({ required: true, trim: true }) duration!: string;
  @Prop({ type: String, enum: Object.values(RouteOfAdmin), default: RouteOfAdmin.ORAL }) route!: RouteOfAdmin;
  @Prop({ trim: true, default: '' }) instructions!: string;
  @Prop({ type: String, enum: Object.values(PrescriptionStatus), default: PrescriptionStatus.ACTIVE }) status!: PrescriptionStatus;
  @Prop({ default: false }) isDeleted!: boolean;
}
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

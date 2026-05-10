import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicationDocument = Medication & Document;
export enum MedicationStatus { ACTIVE = 'active', INACTIVE = 'inactive' }

@Schema({ timestamps: true })
export class Medication {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ trim: true, default: '' }) description!: string;
  @Prop({ trim: true, default: '' }) genericName!: string;
  @Prop({ trim: true, default: '' }) category!: string;
  @Prop({ trim: true, default: '' }) defaultUnit!: string;
  @Prop({ type: String, enum: Object.values(MedicationStatus), default: MedicationStatus.ACTIVE }) status!: MedicationStatus;
  @Prop({ default: false }) isDeleted!: boolean;
}
export const MedicationSchema = SchemaFactory.createForClass(Medication);
MedicationSchema.index({ name: 1 }, { unique: true });

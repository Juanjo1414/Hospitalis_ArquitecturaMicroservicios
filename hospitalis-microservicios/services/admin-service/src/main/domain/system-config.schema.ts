import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type SystemConfigDocument = SystemConfig & Document;

@Schema({ timestamps: true })
export class SystemConfig {
  @Prop({ default: 'global', unique: true }) key!: string;
  @Prop({ default: 'Hospitalis' }) hospitalName!: string;
  @Prop({ default: '' }) hospitalAddress!: string;
  @Prop({ default: '' }) hospitalPhone!: string;
  @Prop({ default: '' }) hospitalEmail!: string;
  @Prop({ default: 'America/Bogota' }) timezone!: string;
  @Prop({ default: 'es-CO' }) locale!: string;
  @Prop({ default: 30 }) defaultAppointmentDuration!: number;
  @Prop({ default: 20 }) maxAppointmentsPerDay!: number;
  @Prop({ default: true }) allowRegistration!: boolean;
  @Prop({ default: false }) maintenanceMode!: boolean;
}
export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);

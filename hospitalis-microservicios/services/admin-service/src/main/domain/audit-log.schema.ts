import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export enum AuditAction { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LOGIN = 'login', LOGOUT = 'logout', ACCESS = 'access' }

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) userId!: Types.ObjectId | null;
  @Prop({ default: '' }) userFullName!: string;
  @Prop({ type: String, enum: Object.values(AuditAction), required: true }) action!: AuditAction;
  @Prop({ required: true }) resource!: string;
  @Prop({ type: Types.ObjectId, default: null }) resourceId!: Types.ObjectId | null;
  @Prop({ default: '' }) description!: string;
  @Prop({ default: '' }) ipAddress!: string;
  @Prop({ type: Number, default: null }) statusCode!: number | null;
}
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1 }); AuditLogSchema.index({ resource: 1 }); AuditLogSchema.index({ createdAt: -1 });

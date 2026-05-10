import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) fullname!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email!: string;
  @Prop({ required: true }) password!: string;
  @Prop({ default: '' }) specialty!: string;
  @Prop({ type: String, enum: ['admin', 'medico'], default: 'medico' }) role!: string;
  @Prop({ default: true }) isActive!: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);

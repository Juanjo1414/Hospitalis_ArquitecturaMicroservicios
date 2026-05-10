import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../domain/user.schema';
import { AuditLog, AuditLogDocument, AuditAction } from '../domain/audit-log.schema';
import { SystemConfig, SystemConfigDocument } from '../domain/system-config.schema';

@Injectable()
export class UsersAdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query?: { role?: string; isActive?: boolean; page?: number; limit?: number }) {
    const page = query?.page ?? 1; const limit = query?.limit ?? 10;
    const filter: any = {};
    if (query?.role) filter.role = query.role;
    if (query?.isActive !== undefined) filter.isActive = query.isActive;
    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: any) {
    if (dto.email) { const ex = await this.userModel.findOne({ email: dto.email }); if (ex && ex._id.toString() !== id) throw new ConflictException('Email en uso'); }
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { currentPassword, ...updateData } = dto;
    if (dto.password) {
      if (!currentPassword) throw new ConflictException('Debes proporcionar la contraseña actual');
      if (!await bcrypt.compare(currentPassword, user.password)) throw new ConflictException('Contraseña actual incorrecta');
      updateData.password = await bcrypt.hash(dto.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).select('-password');
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario desactivado exitosamente' };
  }

  async hardDelete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado permanentemente' };
  }
}

@Injectable()
export class AuditLogService {
  constructor(@InjectModel(AuditLog.name) private readonly model: Model<AuditLogDocument>) {}
  async log(dto: any): Promise<void> { try { await this.model.create({ ...dto, userId: dto.userId ? new Types.ObjectId(dto.userId) : null }); } catch {} }
  async findAll(query: { userId?: string; resource?: string; action?: string; from?: string; to?: string; page?: number; limit?: number }) {
    const filter: Record<string, any> = {};
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.resource) filter.resource = query.resource;
    if (query.action) filter.action = query.action;
    if (query.from || query.to) { filter.createdAt = {}; if (query.from) filter.createdAt.$gte = new Date(query.from); if (query.to) filter.createdAt.$lte = new Date(query.to); }
    const page = Math.max(1, query.page ?? 1); const limit = Math.min(100, query.limit ?? 30);
    const [data, total] = await Promise.all([
      this.model.find(filter).populate('userId', 'fullname email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }
}

@Injectable()
export class SystemConfigService {
  constructor(@InjectModel(SystemConfig.name) private readonly model: Model<SystemConfigDocument>) {}
  async get() { let c = await this.model.findOne({ key: 'global' }); if (!c) c = await this.model.create({ key: 'global' }); return c; }
  async update(dto: Partial<SystemConfig>) { const c = await this.get(); Object.assign(c, dto); return c.save(); }
}

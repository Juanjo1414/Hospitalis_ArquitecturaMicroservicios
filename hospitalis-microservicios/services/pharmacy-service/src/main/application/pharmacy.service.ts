import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prescription, PrescriptionDocument, PrescriptionStatus } from '../domain/prescription.schema';
import { Medication, MedicationDocument } from '../domain/medication.schema';

@Injectable()
export class PrescriptionsService {
  constructor(@InjectModel(Prescription.name) private readonly model: Model<PrescriptionDocument>) {}

  async create(dto: any, doctorId: string) {
    const doc = await this.model.create({
      ...dto, doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(dto.patientId),
      appointmentId: dto.appointmentId ? new Types.ObjectId(dto.appointmentId) : null,
    });
    return doc.populate([{ path: 'patientId', select: 'firstName lastName' }, { path: 'doctorId', select: 'fullname email' }]);
  }

  async findAll(query: { patientId?: string; status?: string; doctorId?: string; page?: number; limit?: number }) {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.patientId) filter.patientId = new Types.ObjectId(query.patientId);
    if (query.doctorId) filter.doctorId = new Types.ObjectId(query.doctorId);
    if (query.status) filter.status = query.status;
    const page = Math.max(1, query.page ?? 1); const limit = Math.min(100, query.limit ?? 20);
    const [data, total] = await Promise.all([
      this.model.find(filter).populate('patientId', 'firstName lastName').populate('doctorId', 'fullname email')
        .populate('appointmentId', 'date startTime').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const doc = await this.model.findOne({ _id: id, isDeleted: false })
      .populate('patientId', 'firstName lastName dateOfBirth').populate('doctorId', 'fullname email specialty')
      .populate('appointmentId', 'date startTime type');
    if (!doc) throw new NotFoundException('Prescripcion no encontrada');
    return doc;
  }

  async update(id: string, dto: any) {
    const doc = await this.findOne(id);
    const { patientId, appointmentId: _a, doctorId: _d, ...safeDto } = dto;
    Object.assign(doc, safeDto);
    if (patientId) doc.patientId = new Types.ObjectId(patientId);
    return doc.save();
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    doc.isDeleted = true; doc.status = PrescriptionStatus.CANCELLED;
    return doc.save();
  }
}

@Injectable()
export class MedicationsService {
  constructor(@InjectModel(Medication.name) private readonly model: Model<MedicationDocument>) {}

  async create(dto: any) {
    const exists = await this.model.findOne({ name: dto.name, isDeleted: false });
    if (exists) throw new ConflictException(`El medicamento "${dto.name}" ya existe.`);
    return this.model.create(dto);
  }

  async findAll(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.status) filter.status = query.status;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    const page = Math.max(1, query.page ?? 1); const limit = Math.min(100, query.limit ?? 50);
    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
      this.model.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const doc = await this.model.findOne({ _id: id, isDeleted: false });
    if (!doc) throw new NotFoundException('Medicamento no encontrado');
    return doc;
  }

  async update(id: string, dto: any) {
    const doc = await this.findOne(id); Object.assign(doc, dto); return doc.save();
  }

  async remove(id: string) {
    const doc = await this.findOne(id); doc.isDeleted = true; return doc.save();
  }
}

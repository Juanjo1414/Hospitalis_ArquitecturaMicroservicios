import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../domain/appointment.schema';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../controller/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    return new this.appointmentModel(dto).save();
  }

  async findAll(query?: {
    doctorId?: string; patientId?: string; status?: string;
    date?: string; page?: number; limit?: number;
  }): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (query?.doctorId) filter.doctorId = query.doctorId;
    if (query?.patientId) filter.patientId = query.patientId;
    if (query?.status) filter.status = query.status;
    if (query?.date) {
      const start = new Date(query.date);
      const end = new Date(query.date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const [data, total] = await Promise.all([
      this.appointmentModel.find(filter)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'fullname email specialty')
        .skip(skip).limit(limit).sort({ date: 1, startTime: 1 }),
      this.appointmentModel.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id)
      .populate('patientId', 'firstName lastName email phone dateOfBirth gender')
      .populate('doctorId', 'fullname email specialty');
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id, { $set: dto }, { new: true, runValidators: true },
    ).populate('patientId', 'firstName lastName').populate('doctorId', 'fullname specialty');
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.appointmentModel.findByIdAndDelete(id);
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return { message: 'Cita eliminada exitosamente' };
  }

  async findTodayByDoctor(_doctorId: string): Promise<Appointment[]> {
    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
    const start = new Date(`${todayStr}T00:00:00.000Z`);
    const end = new Date(`${todayStr}T23:59:59.999Z`);
    return this.appointmentModel.find({ date: { $gte: start, $lte: end } })
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'fullname specialty')
      .sort({ startTime: 1 });
  }
}

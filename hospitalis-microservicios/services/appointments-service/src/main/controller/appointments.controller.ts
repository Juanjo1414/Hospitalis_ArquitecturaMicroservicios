import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { AppointmentsService } from '../application/appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.dto';
import { JwtAuthGuard } from '../domain/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  findAll(
    @Query('doctorId')  doctorId?:  string,
    @Query('patientId') patientId?: string,
    @Query('status')    status?:    string,
    @Query('date')      date?:      string,
    @Query('page')      page?:      string,
    @Query('limit')     limit?:     string,
  ) {
    return this.appointmentsService.findAll({
      doctorId, patientId, status, date,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('today')
  findToday(@Req() req: any) {
    return this.appointmentsService.findTodayByDoctor(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}

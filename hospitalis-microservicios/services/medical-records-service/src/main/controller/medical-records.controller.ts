import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from '../application/medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './medical-record.dto';
import { RolesGuard } from '../domain/roles.guard';
import { Roles } from '../domain/roles.decorator';
import { Role } from '../domain/roles.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(Role.MEDICO, Role.ADMIN)
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }

  @Get('patient/:id')
  @Roles(Role.MEDICO, Role.ADMIN)
  findByPatient(
    @Param('id') patientId: string,
    @Query('type') type?: string, @Query('status') status?: string,
    @Query('from') from?: string, @Query('to') to?: string,
    @Query('page') page?: string, @Query('limit') limit?: string,
  ) {
    return this.medicalRecordsService.findByPatient(patientId, {
      type: type as any, status, from, to,
      page: page ? parseInt(page) : 1, limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('patient/:id/summary')
  @Roles(Role.MEDICO, Role.ADMIN)
  getSummary(@Param('id') patientId: string) {
    return this.medicalRecordsService.getSummary(patientId);
  }

  @Get(':id')
  @Roles(Role.MEDICO, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MEDICO, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.medicalRecordsService.remove(id);
  }
}

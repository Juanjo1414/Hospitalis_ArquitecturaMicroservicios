import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PrescriptionsService, MedicationsService } from '../application/pharmacy.service';
import { JwtAuthGuard } from '../domain/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly svc: PrescriptionsService) {}
  @Post() create(@Body() dto: any, @Req() req: any) { return this.svc.create(dto, req.user.userId); }
  @Get() findAll(@Query('patientId') patientId?: string, @Query('status') status?: string, @Query('doctorId') doctorId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll({ patientId, status, doctorId, page: page ? +page : 1, limit: limit ? +limit : 20 });
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}

@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly svc: MedicationsService) {}
  @Post() create(@Body() dto: any) { return this.svc.create(dto); }
  @Get() findAll(@Query('status') status?: string, @Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.svc.findAll({ status, search, page: page ? +page : 1, limit: limit ? +limit : 50 });
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}

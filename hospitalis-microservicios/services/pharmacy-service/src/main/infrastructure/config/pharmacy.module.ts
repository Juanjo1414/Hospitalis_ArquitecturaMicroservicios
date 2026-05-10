import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { PrescriptionsController, MedicationsController } from '../../controller/pharmacy.controller';
import { PrescriptionsService, MedicationsService } from '../../application/pharmacy.service';
import { Prescription, PrescriptionSchema } from '../../domain/prescription.schema';
import { Medication, MedicationSchema } from '../../domain/medication.schema';
import { Appointment, AppointmentSchema } from '../../domain/appointment.schema';
import { Patient, PatientSchema } from '../../domain/patient.schema';
import { User, UserSchema } from '../../domain/user.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env') }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGO_URI') }) }),
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Medication.name, schema: MedicationSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '24h' } }) }),
  ],
  controllers: [PrescriptionsController, MedicationsController],
  providers: [PrescriptionsService, MedicationsService, JwtStrategy],
})
export class PharmacyModule {}

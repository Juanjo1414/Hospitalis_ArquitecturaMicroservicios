import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { MedicalRecordsController } from '../../controller/medical-records.controller';
import { MedicalRecordsService } from '../../application/medical-records.service';
import { MedicalRecord, MedicalRecordSchema } from '../../domain/medical-record.schema';
import { Appointment, AppointmentSchema } from '../../domain/appointment.schema';
import { Patient, PatientSchema } from '../../domain/patient.schema';
import { User, UserSchema } from '../../domain/user.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env') }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGO_URI') }) }),
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '24h' } }) }),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, JwtStrategy],
})
export class MedicalRecordsModule {}

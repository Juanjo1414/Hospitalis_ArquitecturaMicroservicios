import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { AppointmentsController } from '../../controller/appointments.controller';
import { AppointmentsService } from '../../application/appointments.service';
import { Appointment, AppointmentSchema } from '../../domain/appointment.schema';
import { Patient, PatientSchema } from '../../domain/patient.schema';
import { User, UserSchema } from '../../domain/user.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env') }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGO_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '24h' } }),
    }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, JwtStrategy],
})
export class AppointmentsModule {}

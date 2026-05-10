import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppointmentsModule } from './infrastructure/config/appointments.module';

async function bootstrap() {
  const app = await NestFactory.create(AppointmentsModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Appointments Service running on http://localhost:${port}`);
}
bootstrap();

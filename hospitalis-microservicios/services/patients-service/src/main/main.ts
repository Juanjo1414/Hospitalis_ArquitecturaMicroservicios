import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PatientsModule } from './infrastructure/config/patients.module';

async function bootstrap() {
  const app = await NestFactory.create(PatientsModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Patients Service running on http://localhost:${port}`);
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import { UsersController, AuditLogsController, SystemConfigController } from '../../controller/admin.controller';
import { UsersAdminService, AuditLogService, SystemConfigService } from '../../application/admin.service';
import { User, UserSchema } from '../../domain/user.schema';
import { AuditLog, AuditLogSchema } from '../../domain/audit-log.schema';
import { SystemConfig, SystemConfigSchema } from '../../domain/system-config.schema';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(process.cwd(), '.env') }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ uri: c.getOrThrow<string>('MONGO_URI') }) }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: SystemConfig.name, schema: SystemConfigSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '24h' } }) }),
  ],
  controllers: [UsersController, AuditLogsController, SystemConfigController],
  providers: [UsersAdminService, AuditLogService, SystemConfigService, JwtStrategy],
})
export class AdminModule {}

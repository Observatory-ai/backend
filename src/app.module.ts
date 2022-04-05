import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { TokenModule } from './token/token.module';
import { LoggerModule } from './logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
const Joi = require('joi');
import {
  Config,
  DatabaseConfig,
  EnvironmentConfig,
  LogLevel,
  SmtpConfig,
} from './config/configuration.interface';
import { commaDelimitedLogLevel } from './utils/regex.patterns';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuditModule } from './audit/audit.module';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { ServiceIntegrationModule } from './service-integration/service-integration.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid(EnvironmentConfig.Development, EnvironmentConfig.Production)
          .default(EnvironmentConfig.Development),
        PORT: Joi.number().default(3000),
        LOG_LEVEL: Joi.string()
          .pattern(new RegExp(commaDelimitedLogLevel))
          .default(`${LogLevel.Warn},${LogLevel.Error}`),
        DOMAIN: Joi.string()
          .domain()
          .required()
          .when('NODE_ENV', {
            is: EnvironmentConfig.Development,
            then: Joi.allow('localhost'),
          }),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_URI: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().required(),
        SMTP_SECURE: Joi.boolean().required(),
        SMTP_USERNAME: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => {
        const smtpConfig: SmtpConfig = configService.get<SmtpConfig>('smtp');
        return {
          transport: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: {
              user: smtpConfig.username,
              pass: smtpConfig.password,
            },
          },
          defaults: {
            from: `"Observatory" <${smtpConfig.username}>`,
          },
          template: {
            dir: process.cwd() + '/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => {
        const databaseConfig: DatabaseConfig =
          configService.get<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: databaseConfig.databaseUri,
          port: databaseConfig.databasePort,
          username: databaseConfig.databaseUsername,
          password: databaseConfig.databasePassword,
          database: databaseConfig.databaseName,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: true,
        };
      },
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    MailModule,
    TokenModule,
    LoggerModule,
    AuditModule,
    GoogleAuthModule,
    ServiceIntegrationModule,
    GoogleCalendarModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('api');
  }
}

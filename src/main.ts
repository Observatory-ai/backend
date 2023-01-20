import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Config, EnvironmentConfig } from './config/configuration.interface';
import { LoggerService } from './logger/logger.service';
const helmet = require('helmet');

declare const module: any;
async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  // app.use(helmet({ contentSecurityPolicy: false, frameguard: false })); // Disables graphql playground
  // Use the custom LoggerService for logging
  app.useLogger(app.get(LoggerService));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.set('trust proxy', 1);

  // Get configuration values
  const configService: ConfigService<Config> = app.get(ConfigService);
  const domain: string = configService.get<string>('domain');
  const port: number = configService.get<number>('port');
  const environment: EnvironmentConfig =
    configService.get<EnvironmentConfig>('environment');
  const version: number = configService.get<number>('version');

  console.log('server listening on port', port);
  console.log('environment:', environment, ' version:', version);

  await app.listen(port);

  // Hot reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

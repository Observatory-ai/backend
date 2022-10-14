import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AuthTokenType, COOKIE_CONFIG } from './auth/configs/cookie.config';
import { Config, EnvironmentConfig } from './config/configuration.interface';
import { LoggerService } from './logger/logger.service';
const helmet = require('helmet');

declare const module: any;
async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));
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
  const port: number = configService.get<number>('port');
  const domain: string = configService.get<string>('domain');
  const environment: EnvironmentConfig =
    configService.get<EnvironmentConfig>('environment');
  const version: number = configService.get<number>('version');
  app.enableCors({ credentials: true, origin: domain });

  // Swagger (auth API)
  if (environment === EnvironmentConfig.Development) {
    const config: Pick<
      OpenAPIObject,
      'openapi' | 'info' | 'servers' | 'security' | 'tags' | 'externalDocs'
    > = new DocumentBuilder()
      .setTitle('Observatory API')
      .setDescription('Observatory API')
      .setVersion(`v${version}`)
      .addCookieAuth(COOKIE_CONFIG[AuthTokenType.Access].name)
      .build();
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  console.log('server listening on port', port);
  await app.listen(port);

  // Hot reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Config, LogLevel } from '../config/configuration.interface';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private logLevel: boolean;
  private errorLevel: boolean;
  private warnLevel: boolean;
  private debugLevel: boolean;
  private verboseLevel: boolean;

  constructor(private readonly configService: ConfigService<Config>) {
    super();
    const logLevel: LogLevel[] = this.configService.get<LogLevel[]>('logLevel');
    logLevel.forEach((logLevel: LogLevel) => {
      this[`${logLevel}Level`] = true;
    });
  }

  log(message: any, context?: string): void {
    if (this.logLevel) super.log(message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.errorLevel) super.error(message, trace, context);
  }

  warn(message: any, context?: string): void {
    if (this.warnLevel) super.warn(message, context);
  }

  debug(message: any, context?: string): void {
    if (this.debugLevel) super.debug(message, context);
  }

  verbose(message: any, context?: string): void {
    if (this.verboseLevel) super.verbose(message, context);
  }
}

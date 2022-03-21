import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Config } from '../config/configuration.interface';
import { UserTokenDto } from './dto/user-token.dto';
import { PasswordChangedDto } from './dto/password-changed.dto';

@Injectable()
export class MailService {
  private readonly baseDomain: string;
  private readonly logger: Logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<Config>,
  ) {
    this.baseDomain = this.configService.get<string>('domain');
  }

  /**
   * Sends an email
   * @param options the email options
   */
  private sendEmail(options: ISendMailOptions): void {
    this.mailerService.sendMail(options).catch((err) => {
      this.logger.error({
        message: `Error sending a ${options.template} email to user ${options.to}`,
        err,
      });
    });
  }

  /**
   * Sends an account verification email to the user
   * @param payload the user.created event payload
   */
  private sendAccountVerificationEmail(userTokenDto: UserTokenDto): void {
    this.sendEmail({
      to: userTokenDto.user.email,
      subject: 'Verify Your Observatory Account',
      template: 'verify-account',
      context: {
        username: userTokenDto.user.username,
        link: `${this.baseDomain}/verify-account?token=${userTokenDto.token}`,
      },
    });
  }

  /**
   * Sends a forgot password email to the user
   * @param payload the user.forgotPassword event payload
   */
  private sendForgotPasswordEmail(userTokenDto: UserTokenDto): void {
    this.sendEmail({
      to: userTokenDto.user.email,
      subject: 'Change Your Observatory Account Password',
      template: 'forgot-password',
      context: {
        username: userTokenDto.user.username,
        link: `${this.baseDomain}/change-password?token=${userTokenDto.token}`,
      },
    });
  }

  /**
   * Sends a password changed email to the user
   * @param payload the user.passwordChanged event payload
   */
  private sendPasswordChangedEmail(
    passwordChangedDto: PasswordChangedDto,
  ): void {
    this.sendEmail({
      to: passwordChangedDto.user.email,
      subject: 'Observatory Account Password Changed',
      template: 'password-changed',
      context: {
        username: passwordChangedDto.user.username,
        link: `${this.baseDomain}/sign-in`,
      },
    });
  }

  /**
   * Handles the user.created event
   * @param userTokenDto the user.created event payload
   */
  handleUserCreated(userTokenDto: UserTokenDto): void {
    if (!userTokenDto.user.isVerified)
      this.sendAccountVerificationEmail(userTokenDto);
  }

  /**
   * Handles the user.forgotPassword event
   * @param userTokenDto the user.forgotPassword event payload
   */
  handleForgotPassword(userTokenDto: UserTokenDto): void {
    this.sendForgotPasswordEmail(userTokenDto);
  }

  /**
   * Handles the user.passwordChanged event
   * @param passwordChangedDto the user.passwordChanged event payload
   */
  handlePasswordChanged(passwordChangedDto: PasswordChangedDto): void {
    this.sendPasswordChangedEmail(passwordChangedDto);
  }
}

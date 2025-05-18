import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>('BASE_URL');
    const confirmationUrl = `${baseUrl}/api/confirm/${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Confirm your weather subscription',
      html: `
        <h1>Thanks for subscribing to Weather Forecast!</h1>
        <p>Please confirm your subscription by clicking the link below:</p>
        <a href="${confirmationUrl}">Confirm Subscription</a>
        <p>If you did not request this subscription, you can ignore this email.</p>
      `,
    });
  }

  async sendWeatherUpdate(
    email: string,
    city: string,
    temperature: number,
    humidity: number,
    description: string,
    unsubscribeToken: string,
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('BASE_URL');
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${unsubscribeToken}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: `Weather Update for ${city}`,
      html: `
        <h1>Weather Update for ${city}</h1>
        <div>
          <p><strong>Temperature:</strong> ${temperature}°C</p>
          <p><strong>Humidity:</strong> ${humidity}%</p>
          <p><strong>Conditions:</strong> ${description}</p>
        </div>
        <p>To unsubscribe from these updates, <a href="${unsubscribeUrl}">click here</a>.</p>
      `,
    });
  }
}
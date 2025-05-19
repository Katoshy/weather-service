import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { SubscriptionService } from '../subscription/subscription.service';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';
import { SubscriptionFrequency } from '../subscription/entities/subscription.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyUpdates() {
    this.logger.debug('Processing hourly weather updates');
    await this.processSubscriptions(SubscriptionFrequency.HOURLY);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyUpdates() {
    this.logger.debug('Processing daily weather updates');
    await this.processSubscriptions(SubscriptionFrequency.DAILY);
  }

  private async processSubscriptions(frequency: SubscriptionFrequency) {
    const subscriptions = await this.subscriptionService.getActiveSubscriptions(frequency);

    for (const subscription of subscriptions) {
      try {
        const weatherData = await lastValueFrom(
          this.weatherService.getWeather(subscription.city)
        );

        await this.emailService.sendWeatherUpdate(
          subscription.email,
          subscription.city,
          weatherData.temperature,
          weatherData.humidity,
          weatherData.description,
          subscription.unsubscribeToken,
        );

        await this.subscriptionService.updateLastSentAt(subscription.id);

        this.logger.debug(
          `Weather update sent to ${subscription.email} for ${subscription.city}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to send weather update to ${subscription.email} for ${subscription.city}`,
          error,
        );
      }
    }
  }
}
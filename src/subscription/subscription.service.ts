import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, SubscriptionFrequency } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private emailService: EmailService,
  ) {}

  async subscribe(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<{ message: string }> {
    // Check if email already exists
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { email: createSubscriptionDto.email },
    });

    if (existingSubscription) {
      throw new HttpException('Email already subscribed', HttpStatus.CONFLICT);
    }

    // Create new subscription
    const subscription = new Subscription();
    subscription.email = createSubscriptionDto.email;
    subscription.city = createSubscriptionDto.city;
    subscription.frequency = createSubscriptionDto.frequency;
    subscription.confirmationToken = uuidv4();
    subscription.unsubscribeToken = uuidv4();

    await this.subscriptionRepository.save(subscription);

    // Send confirmation email
    await this.emailService.sendConfirmationEmail(
      subscription.email,
      subscription.confirmationToken,
    );

    return { message: 'Subscription successful. Confirmation email sent.' };
  }

  async confirmSubscription(token: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { confirmationToken: token },
    });

    if (!subscription) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    subscription.confirmed = true;
    await this.subscriptionRepository.save(subscription);

    return { message: 'Subscription confirmed successfully' };
  }

  async unsubscribe(token: string): Promise<{ message: string }> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { unsubscribeToken: token },
    });

    if (!subscription) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    await this.subscriptionRepository.remove(subscription);

    return { message: 'Unsubscribed successfully' };
  }

  async getActiveSubscriptions(frequency: SubscriptionFrequency): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: {
        confirmed: true,
        frequency,
      },
    });
  }

  async updateLastSentAt(subscriptionId: string): Promise<void> {
    await this.subscriptionRepository.update(
      { id: subscriptionId },
      { lastSentAt: new Date() },
    );
  }
}
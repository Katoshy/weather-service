import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from '../../src/subscription/subscription.service';
import { Subscription, SubscriptionFrequency } from '../../src/subscription/entities/subscription.entity';
import { EmailService } from '../../src/email/email.service';

// Mock repositories and services
const mockSubscriptionRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
});

const mockEmailService = () => ({
  sendConfirmationEmail: jest.fn(),
  sendWeatherUpdate: jest.fn(),
});

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionRepository: Repository<Subscription>;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getRepositoryToken(Subscription),
          useFactory: mockSubscriptionRepository,
        },
        {
          provide: EmailService,
          useFactory: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionRepository = module.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create a new subscription and send confirmation email', async () => {
      const dto = {
        email: 'test@example.com',
        city: 'London',
        frequency: SubscriptionFrequency.DAILY,
      };

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(subscriptionRepository, 'save').mockImplementation(async (subscription) => ({
        ...subscription,
        id: 'some-uuid',
      } as Subscription));

      const result = await service.subscribe(dto);

      expect(subscriptionRepository.findOne).toHaveBeenCalled();
      expect(subscriptionRepository.save).toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Subscription successful. Confirmation email sent.' });
    });

    it('should throw an error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        city: 'London',
        frequency: SubscriptionFrequency.DAILY,
      };

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue({} as Subscription);

      await expect(service.subscribe(dto)).rejects.toThrow(
        new HttpException('Email already subscribed', HttpStatus.CONFLICT),
      );
    });
  });

  describe('confirmSubscription', () => {
    it('should confirm a subscription with valid token', async () => {
      const token = 'valid-token';
      const mockSubscription = {
        confirmationToken: token,
        confirmed: false,
      } as Subscription;

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription);
      jest.spyOn(subscriptionRepository, 'save').mockResolvedValue({
        ...mockSubscription,
        confirmed: true,
      } as Subscription);

      const result = await service.confirmSubscription(token);

      expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { confirmationToken: token },
      });
      expect(mockSubscription.confirmed).toBe(true);
      expect(subscriptionRepository.save).toHaveBeenCalledWith(mockSubscription);
      expect(result).toEqual({ message: 'Subscription confirmed successfully' });
    });

    it('should throw an error if token is not found', async () => {
      const token = 'invalid-token';

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.confirmSubscription(token)).rejects.toThrow(
        new HttpException('Token not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe with valid token', async () => {
      const token = 'valid-unsubscribe-token';
      const mockSubscription = {
        unsubscribeToken: token,
      } as Subscription;

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(mockSubscription);
      jest.spyOn(subscriptionRepository, 'remove').mockResolvedValue({} as Subscription);

      const result = await service.unsubscribe(token);

      expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { unsubscribeToken: token },
      });
      expect(subscriptionRepository.remove).toHaveBeenCalledWith(mockSubscription);
      expect(result).toEqual({ message: 'Unsubscribed successfully' });
    });

    it('should throw an error if token is not found', async () => {
      const token = 'invalid-token';

      jest.spyOn(subscriptionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.unsubscribe(token)).rejects.toThrow(
        new HttpException('Token not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
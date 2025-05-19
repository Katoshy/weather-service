import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from '../src/subscription/entities/subscription.entity';

describe('Weather Forecast API (e2e)', () => {
  let app: INestApplication;
  let subscriptionRepository: Repository<Subscription>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');
    subscriptionRepository = moduleFixture.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await subscriptionRepository.clear();
  });

  describe('/api/weather (GET)', () => {
    it('should return weather for a valid city', () => {
      return request(app.getHttpServer())
        .get('/api/weather?city=London')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('temperature');
          expect(res.body).toHaveProperty('humidity');
          expect(res.body).toHaveProperty('description');
        });
    });

    it('should return 400 for missing city parameter', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/api/subscribe (POST)', () => {
    it('should create a subscription successfully', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Subscription successful');
        });
    });

    it('should return 400 for invalid input', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'invalid-email',
          city: 'London',
          frequency: 'daily',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'duplicate@example.com',
          city: 'London',
          frequency: 'daily',
        });

      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({
          email: 'duplicate@example.com',
          city: 'Paris',
          frequency: 'hourly',
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  // Additional tests for confirm and unsubscribe would ideally use mocked tokens
  // since the real tokens are generated randomly
});
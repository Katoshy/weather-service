// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EmailModule } from './email/email.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { Subscription } from './subscription/entities/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:    true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type:       'postgres',
        host:       cfg.get('DB_HOST', 'localhost'),
        port:       Number(cfg.get('DB_PORT', '5432')),
        username:   cfg.get('DB_USERNAME', 'postgres'),
        password:   cfg.get('DB_PASSWORD', 'postgres'),
        database:   cfg.get('DB_DATABASE', 'weather_forecast'),

        //autoLoadEntities: true,     
        entities: [Subscription], 
        migrations: [              
          'dist/database/migrations/*.js'
        ],
        migrationsRun: true,        
        synchronize: false,         
      }),
    }),

    ScheduleModule.forRoot(),
    WeatherModule,
    SubscriptionModule,
    EmailModule,
    SchedulerModule,
  ],
})
export class AppModule {}

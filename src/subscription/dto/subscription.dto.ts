import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionFrequency } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'Kyiv',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Frequency of updates (hourly or daily)',
    enum: SubscriptionFrequency,
    example: SubscriptionFrequency.DAILY,
  })
  @IsEnum(SubscriptionFrequency)
  @IsNotEmpty()
  frequency: SubscriptionFrequency;
}

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription successful. Confirmation email sent.',
  })
  message: string;
}

export class ConfirmSubscriptionResponseDto {
  @ApiProperty({
    description: 'Subscription confirmed successfully',
  })
  message: string;
}

export class UnsubscribeResponseDto {
  @ApiProperty({
    description: 'Unsubscribe successful',
  })
  message: string;
}

export class TokenParamDto {
  @ApiProperty({
    description: 'Token for confirmation or unsubscribe action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  token: string;
}
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  SubscriptionResponseDto,
  ConfirmSubscriptionResponseDto,
  UnsubscribeResponseDto,
  TokenParamDto,
} from './dto/subscription.dto';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiResponse({
    status: 200,
    description: 'Subscription successful. Confirmation email sent.',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.subscribe(createSubscriptionDto);
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm email subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
    type: ConfirmSubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async confirmSubscription(
    @Param() params: TokenParamDto,
  ): Promise<ConfirmSubscriptionResponseDto> {
    return this.subscriptionService.confirmSubscription(params.token);
  }

  @Get('unsubscribe/:token')
  @ApiOperation({ summary: 'Unsubscribe from weather updates' })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed successfully',
    type: UnsubscribeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async unsubscribe(
    @Param() params: TokenParamDto,
  ): Promise<UnsubscribeResponseDto> {
    return this.subscriptionService.unsubscribe(params.token);
  }
}
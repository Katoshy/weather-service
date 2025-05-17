import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeatherDto {
  @ApiProperty({
    description: 'Current temperature',
    example: 22.5,
  })
  @IsNumber()
  temperature: number;

  @ApiProperty({
    description: 'Current humidity percentage',
    example: 65,
  })
  @IsNumber()
  humidity: number;

  @ApiProperty({
    description: 'Weather description',
    example: 'Partly cloudy',
  })
  @IsString()
  description: string;
}

export class WeatherQueryDto {
  @ApiProperty({
    description: 'City name for weather forecast',
    example: 'Kyiv',
  })
  @IsNotEmpty()
  @IsString()
  city: string;
}
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { WeatherService } from './weather.service';
import { WeatherDto, WeatherQueryDto } from './dto/weather.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiResponse({
    status: 200,
    description: 'Successful operation - current weather forecast returned',
    type: WeatherDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'City not found' })
  getWeather(@Query() query: WeatherQueryDto): Observable<WeatherDto> {
    return this.weatherService.getWeather(query.city);
  }
}
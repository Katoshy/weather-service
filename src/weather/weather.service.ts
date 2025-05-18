import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, map, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { WeatherDto } from './dto/weather.dto';
import { WeatherApiResponse } from './interfaces/weather-api.interface';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
    this.apiUrl = 'http://api.weatherapi.com/v1/current.json';
  }

  getWeather(city: string): Observable<WeatherDto> {
    return this.httpService
      .get<WeatherApiResponse>(this.apiUrl, {
        params: {
          key: this.apiKey,
          q: city,
        },
      })
      .pipe(
        map((response) => {
          const weatherData = response.data;
          return {
            temperature: weatherData.current.temp_c,
            humidity: weatherData.current.humidity,
            description: weatherData.current.condition.text,
          };
        }),
        catchError((error: AxiosError) => {
          if (error.response?.status === 400) {
            throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
          } else if (error.response?.status === 404) {
            throw new HttpException('City not found', HttpStatus.NOT_FOUND);
          } else {
            throw new HttpException(
              'Error fetching weather data',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      );
  }
}
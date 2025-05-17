export interface WeatherApiResponse {
  current: {
    temp_c: number;
    humidity: number;
    condition: {
      text: string;
    };
  };
  location: {
    name: string;
    country: string;
  };
}   
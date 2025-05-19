import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Subscription } from '../subscription/entities/subscription.entity'
// Імпортуйте інші сутності тут явно

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'weather_forecast',
  
  // Явно вказуємо всі сутності замість шляхів
  entities: [
    Subscription,
    // Інші сутності...
  ],

  // Явно вказуємо шляхи до міграцій
  migrations: [
    __dirname + '/migrations/*.{ts,js}'
  ],

  synchronize: false,
  logging: true,
});
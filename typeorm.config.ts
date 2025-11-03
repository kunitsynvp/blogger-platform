import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { typeORMNamingStrategy } from './src/core/config/camel-case-naming-strategy';

//config({ path: './.env.development' });
config();

export default new DataSource({
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  type: 'postgres',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  namingStrategy: typeORMNamingStrategy
})
console.log("host: ", process.env.DB_HOST);
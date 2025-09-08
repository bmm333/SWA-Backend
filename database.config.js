import 'dotenv/config';
import { DataSource } from "typeorm";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataSourceOptions = {
  type: "postgres",
  host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT) || 5432,
  username: process.env.PGUSER || process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'swadb',
  entities: ['src/**/*.entity.js'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
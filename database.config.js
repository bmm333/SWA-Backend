import 'dotenv/config';
import { DataSource } from "typeorm";

export const dataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.PGHOST || process.env.POSTGRES_HOST,
  port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT),
  username: process.env.PGUSER || process.env.POSTGRES_USERNAME,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE,
  entities: ['src/**/*.entity.js',
    'src/**/entities/*.entity.js'
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
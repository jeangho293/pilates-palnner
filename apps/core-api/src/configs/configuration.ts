import type { DataSourceOptions } from 'typeorm';

interface AppConfig {
  mysql: DataSourceOptions;
}

export default (env: Record<string, any> = process.env): AppConfig => ({
  mysql: {
    type: 'mysql',
    host: env.MYSQL_HOST,
    username: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    port: 3306,
  },
});

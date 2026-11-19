import { Global, InternalServerErrorException, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NestTypeormModule } from './typeorm';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [NestTypeormModule],
  exports: [NestTypeormModule],
})
export class DatabasesModule implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(DatabasesModule.name);

  constructor(private readonly datasource: DataSource) {}

  onModuleInit() {
    if (this.datasource.isInitialized) {
      this.logger.log('mysql is successfully connected. 😎');
    } else {
      throw new InternalServerErrorException('mysql is not connected. 😭');
    }
  }

  async onModuleDestroy() {
    if (this.datasource.isInitialized) {
      await this.datasource.destroy();
      this.logger.log('mysql is successfully disconnected. 😎');
    }
  }
}

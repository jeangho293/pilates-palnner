import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './entities';
import { ConfigsService } from '@configs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: (configsService: ConfigsService) => ({
        ...configsService.mysql,
        entities,
        synchronize: true,
      }),
    }),
  ],
})
export class NestTypeormModule {}

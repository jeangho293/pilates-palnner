import { Module } from '@nestjs/common';
import { GlobalDomainModule } from './modules/global-domain.module';
import { DatabasesModule } from '@databases';

@Module({
  imports: [DatabasesModule, GlobalDomainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

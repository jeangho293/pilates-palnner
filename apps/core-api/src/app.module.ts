import { Module } from '@nestjs/common';
import { GlobalDomainModule } from './modules/global-domain.module';
import { DatabasesModule } from '@databases';
import { ConfigsModule } from './configs';

@Module({
  imports: [ConfigsModule, DatabasesModule, GlobalDomainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

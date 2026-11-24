import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalDomainModule } from './modules/global-domain.module';
import { DatabasesModule } from '@databases';
import { ConfigsModule } from '@configs';
import { ContextModule } from '@libs/context';
import { ContextMiddleware, UUIDMiddleware } from '@middlewares';

@Module({
  imports: [ConfigsModule, ContextModule, DatabasesModule, GlobalDomainModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, UUIDMiddleware).forRoutes('*');
  }
}

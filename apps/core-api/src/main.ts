import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requesterValidatorPipe } from '@libs/pipes';
import { logger } from '@libs/logger';

(async () => {
  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(requesterValidatorPipe);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
})();

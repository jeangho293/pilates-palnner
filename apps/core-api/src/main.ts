import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requesterValidatorPipe } from '@libs/pipes';

(async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(requesterValidatorPipe);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
})();

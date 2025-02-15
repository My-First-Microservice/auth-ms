import { NestFactory } from '@nestjs/core';
import { Logger } from "@nestjs/common";
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('AuthMS');
  const app = await NestFactory.create(AppModule);

  await app.listen(envs.port);
  logger.log(`Auth Microservice running on port ${envs.port}`)
}
bootstrap();

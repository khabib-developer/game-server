import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
async function bootstrap() {
  const result = config();
  if (result.error) {
    throw result.error;
  }

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({ origin: ['http://localhost:3001'], credentials: true });
  app.use(cookieParser());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

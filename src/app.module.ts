import { Logger, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(envs.db.url, {
      dbName: 'AuthDB',
      onConnectionCreate: () => {
        const logger = new Logger('Database');
        logger.log('Database connected');
      },
    }),
    JwtModule.register({
      global: true,
      secret: envs.jwtSecretKey,
      signOptions: {
        expiresIn: '3h',
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';

@Module({
  imports: [AuthModule, MongooseModule.forRoot(envs.db.url)],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
@Module({
  imports: [
    RoomModule,
    UserModule,
    AuthModule,

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_USER,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User],
      autoLoadModels: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

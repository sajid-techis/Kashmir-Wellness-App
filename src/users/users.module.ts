import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Argon2Module } from '@nestjs/argon2';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/user.schema'; // Import User and UserSchema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    Argon2Module,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService so AuthModule (and others) can use it
})
export class UsersModule {}
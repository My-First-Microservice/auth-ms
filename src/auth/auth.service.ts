import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.userModel.findOne({ email });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const savedUser = await this.userModel.create({
        email,
        name,
        password: await bcrypt.hash(password, 10),
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, password: __, ...restUser } = savedUser.toJSON();

      return {
        user: restUser,
      };
    } catch (error) {
      throw new RpcException({
        status: error.status,
        message: error.message,
      });
    }
  }
}

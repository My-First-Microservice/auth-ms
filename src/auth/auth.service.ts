import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
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
        token: await this.signJWT({
          email: restUser.email,
          name: restUser.name,
          id: savedUser.id,
        }),
      };
    } catch (error) {
      throw new RpcException({
        status: error.status,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new RpcException({
          status: 404,
          message: 'User not found',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'Invalid password',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, password: __, ...restUser } = user.toJSON();

      return {
        user: restUser,

        token: await this.signJWT({
          email: restUser.email,
          name: restUser.name,
          id: user.id,
        }),
      };
    } catch ({ error }) {
      throw new RpcException({
        status: error.status,
        message: error.message,
      });
    }
  }

  signJWT(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }
}

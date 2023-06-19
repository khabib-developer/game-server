import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto, UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async login(userDto: UserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async registration(userDto: UserDto) {
    const candidate = await this.usersService.getByUsername(userDto.username);
    if (candidate)
      throw new HttpException(
        'User with this username exists',
        HttpStatus.BAD_REQUEST,
      );
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.usersService.create({
      ...userDto,
      password: hashPassword,
    });
    return this.generateToken(user);
  }

  private async generateToken(payload: User) {
    const user = {
      username: payload.username,
      id: payload.id,
    };
    return {
      token: await this.jwtService.signAsync(user),
      user,
    };
  }

  private async validateUser(payload: UserDto) {
    const user = await this.usersService.getByUsername(payload.username);
    if (user) {
      const password = await bcrypt.compare(payload.password, user.password);
      if (user && password) return user;
      throw new UnauthorizedException({
        message: 'incorrect password or username',
      });
    }
    throw new UnauthorizedException({
      message: 'User not found',
    });
  }
}

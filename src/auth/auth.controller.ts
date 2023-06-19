import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserDto, UserService } from 'src/user/user.service';
import { Response } from 'express';

interface AuthRequest extends Request {
  user: UserDto;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/login')
  async login(
    @Body() userDto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(userDto);

    response.cookie('token', data.token).json(data.user);
  }

  @Post('/register')
  async registration(
    @Body() userDto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.registration(userDto);
    response.cookie('token', data.token).json(data.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/check')
  check(@Req() req: AuthRequest) {
    return this.userService.getSelfData(req.user.id);
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    console.log(123);
    res.clearCookie('token').json({ logout: true });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

export interface UserDto {
  id?: number;
  username: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async create(dto: UserDto) {
    const user = await this.userRepository.create(dto);
    return user;
  }

  async getByUsername(username: string) {
    return await this.userRepository.findOne({ where: { username } });
  }

  async getSelfData(id: number) {
    const user = await this.userRepository.findByPk(id);
    if (user)
      return {
        id: user.id,
        username: user.username,
      };
    return null;
  }
}

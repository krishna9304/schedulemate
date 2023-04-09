import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async validate(
    email: string,
    password: string,
    type = 'student',
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    delete user.password;
    delete user.metadata;
    return { ...user, type };
  }
  async getUser(filterQuery: any) {}
}

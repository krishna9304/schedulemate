import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserRequest } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    await this.validateCreateUserRequest(request);
    const user = await this.usersRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
    });

    delete user.password;
    delete user.metadata;

    return user;
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    delete user.password;
    delete user.metadata;
    return user;
  }

  async getUser(filterQuery: Partial<User>): Promise<User> {
    const user: User = await this.usersRepository.findOne(filterQuery);

    delete user.password;
    delete user.metadata;
    return user;
  }

  async validateCreateUserRequest(request: Partial<CreateUserRequest>) {
    let exists: any;
    try {
      exists = await this.usersRepository.exists({
        $or: [{ email: request.email }, { primaryPhone: request.primaryPhone }],
      });
    } catch (err) {}

    if (exists) {
      throw new UnprocessableEntityException(
        'User with similar details already exists.',
      );
    }
  }
}

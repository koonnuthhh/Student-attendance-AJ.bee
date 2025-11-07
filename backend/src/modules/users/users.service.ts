import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id }, relations: ['roles'] });
  }

  async findAll() {
    return this.userRepo.find({ relations: ['roles'] });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
  ) {}

  async create(teacherId: string, name: string, subject?: string) {
    const cls = this.classRepo.create({ teacherId, name, subject });
    return this.classRepo.save(cls);
  }

  async findByTeacher(teacherId: string) {
    return this.classRepo.find({ where: { teacherId }, relations: ['enrollments', 'enrollments.student'] });
  }

  async findOne(id: string) {
    return this.classRepo.findOne({ where: { id }, relations: ['enrollments', 'enrollments.student'] });
  }
}

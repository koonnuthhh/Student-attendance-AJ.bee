import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCodesController } from './student-codes.controller';
import { StudentCodesService } from './student-codes.service';
import { User } from '../users/user.entity';
import { Class } from '../classes/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Class])],
  controllers: [StudentCodesController],
  providers: [StudentCodesService],
  exports: [StudentCodesService],
})
export class StudentCodesModule {}
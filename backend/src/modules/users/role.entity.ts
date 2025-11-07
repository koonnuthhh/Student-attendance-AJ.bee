import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from './user.entity';

export enum RoleName {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
  EMPLOYEE = 'Employee',
}

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name: RoleName;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}

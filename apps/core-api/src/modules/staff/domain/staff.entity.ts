import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DddBaseAggregate } from '@libs/ddd';
import type { CalendarDate } from '@libs/types';
import { stripUndefined } from '@libs/utils';

export enum StaffRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
}

export enum StaffStatus {
  READY = 'ready',
  ACTIVE = 'active',
  EXITED = 'exited',
}

@Entity()
export class Staff extends DddBaseAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '로그인 아이디' })
  email: string;

  @Column({ comment: '비밀번호' })
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: StaffRole })
  role: StaffRole;

  @Column({ type: 'enum', enum: StaffStatus })
  status: StaffStatus;

  @Column({ type: 'varchar', length: 30, nullable: true, comment: '마지막 로그인 일시 (YYYY-MM-DD HH:mm:ss)' })
  lastLoginOn?: CalendarDate | null;

  update(args: { name?: string; password?: string }) {
    const changed = stripUndefined(args);

    if (changed) {
      Object.assign(this, changed);
    }
  }
}

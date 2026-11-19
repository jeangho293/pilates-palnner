import { DddBaseAggregate } from '@libs/ddd';
import type { CalendarDate } from '@libs/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer extends DddBaseAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '카카오 고유 ID(식별자)' })
  kakaoId: string;

  @Column()
  name: string;

  @Column({ comment: '휴대폰 번호 (본인 및 직원만 열람 가능)' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 30, comment: '개인정보 수집 동의 시각' })
  privacyAgreedOn: CalendarDate;
}

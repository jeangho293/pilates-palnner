import { DddBaseAggregate } from '@libs/ddd';
import type { CalendarDate } from '@libs/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member extends DddBaseAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '고객 ID' })
  customerId: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'text', nullable: true, comment: '직원용 메모 (부상 이력 등)' })
  memo?: string | null;

  @Column({ comment: '등록으로 이어진 상담 신청' })
  sourceConsultationId: number;

  @Column({ type: 'varchar', length: 30, comment: '최초 등록일 (YYYY-MM-DD)' })
  registeredOn: CalendarDate;
}

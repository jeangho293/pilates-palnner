import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class DddBaseAggregate {
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 60, select: false, nullable: true, comment: '생성 txId' })
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 60, select: false, nullable: true, comment: '수정 txId' })
  updatedBy: string;
}

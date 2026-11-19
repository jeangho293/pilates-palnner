import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class DddBaseAggregate {
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 60, select: false, nullable: true })
  createdBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 60, select: false, nullable: true })
  updatedBy: string;
}

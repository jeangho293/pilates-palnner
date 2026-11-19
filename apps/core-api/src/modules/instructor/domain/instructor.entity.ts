import { DddBaseAggregate } from '@libs/ddd';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Instructor extends DddBaseAggregate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '강사의 직원 ID' })
  staffId: number;

  @Column({ comment: '웹사이트에서 보여지는 강사 이름' })
  name: string;

  @Column({ comment: '강사 프로필 사진 URL' })
  profileImageUrl: string;

  @Column({ type: 'text', comment: '경력' })
  career: string;

  @Column({ type: 'simple-array', comment: '전문 분야 (예: 재활, 체형 교정)' })
  specialties: string[];

  @Column({ type: 'text', comment: '강사 소개 및 자기 소개' })
  introduction: string;

  @Column({ type: 'boolean', comment: '공개 여부' })
  isPublic: boolean;
}

import { InjectDataSource } from '@nestjs/typeorm';
import { DddBaseAggregate } from './ddd-base-aggregate';
import { DataSource, EntityManager, ObjectType } from 'typeorm';
import { Context, ContextKey } from '@libs/context';

export abstract class DddRepository<T extends DddBaseAggregate> {
  constructor(
    @InjectDataSource() private readonly datasource: DataSource,
    private readonly context: Context
  ) {}

  abstract entityClass: ObjectType<T>;

  get entityManager(): EntityManager {
    // NOTE: 컨텍스트에서 엔티티메니저를 가져오거나 테이터소스에서 가져옴(트랜잭션)
    return this.context.get<EntityManager>(ContextKey.ENTITY_MANAGER) || this.datasource.manager;
  }

  createQueryBuilder(alias: string) {
    return this.entityManager.createQueryBuilder(this.entityClass, alias);
  }

  async save(entities: T[]) {
    this.registerTxId(entities);

    await this.entityManager.save(this.entityClass, entities);
  }

  async remove(entities: T[]) {
    this.registerTxId(entities);

    await this.entityManager.remove(this.entityClass, entities);
  }

  private registerTxId(entities: T[]) {
    const txId = this.context.get<string>(ContextKey.TXID);
    entities.forEach((entity) => entity.setTxId(txId));
  }
}

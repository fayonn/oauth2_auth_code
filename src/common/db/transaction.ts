import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { QueryRunner } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { LoggerService } from '../../modules/logger/logger.service';

export class Transaction {
  private readonly DEFAULT_ISOLATION_LEVEL: IsolationLevel = 'READ COMMITTED';
  private isDestroyed = false;
  private transactedQueryRunners: QueryRunner[] = [];
  handlers: Record<string, any> = {};
  readonly id: string;
  readonly logger = new LoggerService();

  constructor(
    private readonly queryRunners: {
      handlerName: string;
      queryRunner: QueryRunner;
      isolationLevel?: IsolationLevel;
    }[],
    loggerContext?: string,
  ) {
    this.id = uuid4();
    this.logger.setContext(`${loggerContext}==transaction-${this.id}`);
  }

  async start() {
    if (this.isDestroyed) throw new Error('Transaction is destroyed');

    for (const qr of this.queryRunners) {
      await qr.queryRunner.connect();
      await qr.queryRunner.startTransaction(qr.isolationLevel || this.DEFAULT_ISOLATION_LEVEL);
      this.transactedQueryRunners.push(qr.queryRunner);
      this.handlers[qr.handlerName] = qr.queryRunner;
    }

    this.logger.info('[start]');
  }

  async commit() {
    if (this.isDestroyed) throw new Error('Transaction is destroyed');
    for (const tqr of this.transactedQueryRunners) {
      await tqr.commitTransaction();
    }
    this.isDestroyed = true;
    this.logger.info('[commit]');
  }

  async rollback() {
    if (this.isDestroyed) throw new Error('Transaction is destroyed');
    for (const tqr of this.transactedQueryRunners) {
      await tqr.rollbackTransaction();
    }
    this.isDestroyed = true;
    this.logger.info('[rollback]');
  }

  async release() {
    this.isDestroyed = true;
    for (const tqr of this.transactedQueryRunners) {
      await tqr.release();
    }

    this.logger.info('[release]');
  }

  async run(blocks: {
    tryBlock: (...queryRunners: QueryRunner[]) => Promise<any>;
    catchBlock?: (...queryRunners: QueryRunner[]) => Promise<any>;
    finallyBlock?: (...queryRunners: QueryRunner[]) => Promise<any>;
  }) {
    await this.start();

    try {
      const response = await blocks.tryBlock(...this.transactedQueryRunners);
      await this.commit();
      return response;
    } catch (e) {
      await blocks.catchBlock?.(...this.transactedQueryRunners);
      await this.rollback();
      throw e;
    } finally {
      await this.release();
      await blocks.finallyBlock?.(...this.transactedQueryRunners);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class ExtractReposForTransactions {
  constructor(@InjectDataSource() private ds: DataSource) {}

  async extract(entities: EntityTarget<any>[]) {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    let repositories: Repository<any>[] = [];
    try {
        repositories = entities.map((entity) => qr.manager.getRepository(entity))
    } catch (e) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: e + " at ExtractRepositoriesForTransactions",
        field: "None"
      });
    }
    return {
      queryRunner: qr,
      repositories: repositories
    }
  }
}
import pg, { Pool } from '@types/pg';
import user from '../../storage/main/repository/user';
import session from '../../storage/main/repository/session';
import root from '../../storage/main/index';

type Query = Pool['query'];

declare global {
  interface Postgres {
    pool: Pool;
    query: Pool['query'];
    QueryParameters: Parameters<Query>;
  }

  interface StorageApi extends ReturnType<typeof root> {
    repository: {
      user: typeof user;
      session: typeof session;
    };
  }
}

export {};

export default ({ npm, app, config }: TransportDependencies) => {
  const Pool = npm.pg.Pool;
  const pg = config.storage.pg;
  const logger = app.logger;
  let pool: Postgres['pool'] | null = null;
  const error = logger.error.bind(null, 'postgres connection error');
  return {
    async start() {
      if (pool !== null) throw new Error('postgres is already running');
      pool = new Pool(pg);
      (pool as Postgres['pool']).on('error', error);
      logger.log(`postgres connected on ${pg.host}:${pg.port}`);
    },
    async stop() {
      if (!pool) return;
      pool.end();
      pool = null;
      logger.log('postgres connection has been winded');
    },
    query(...args: Partial<Postgres['QueryParameters']>): Promise<any> {
      if (!pool) throw new Error('postgres connection pool down');
      return pool.query.apply(pool, args as any) as any;
    },
    async transaction(fn: (client: any) => Promise<any>) {
      const client = new npm.pg.Client(pg);
      await client.connect();
      try {
        await client.query('BEGIN');
        await fn(client.query.bind(client));
        await client.query('COMMIT');
      } catch (e: any) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        await client.end();
      }
    },
  };
};

export default ({ npm, app, config }: StorageContext) => {
  const { Pool } = npm.pg;
  const pg = config.storage.pg;
  const logger = app.logger;
  let pool: Pool | null = null;
  const error = logger.error.bind(null, "postgres connection error");
  return {
    async start() {
      if (pool !== null) {
        throw new Error("postgres is already running");
      }
      pool = new Pool(pg);
      (pool as Pool).on("error", error);
      logger.log(`postgres connected on ${pg.host}:${pg.port}`);
    },
    async stop() {
      if (!pool) return;
      pool.end();
      pool = null;
      logger.log("postgres connection has been winded");
    },
    query(...args: QueryParameters): Promise<any> {
      if (!pool) throw new Error('postgres connection pool down');
      return pool.query.apply(pool, args);
    },
  }
}
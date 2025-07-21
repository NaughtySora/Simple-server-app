export default ({ app }: TransportDependencies) => {
  return {
    async start() {
      app.logger.info('Mock storage started');
    },
    async stop() {
      app.logger.info('Mock storage ended');
    },
    query(...args: any) {
      app.logger.info('Mock storage query used with parameters: ', args);
      return args.pop();
    },
    async transaction(fn: any) {
      app.logger.info('Mock storage transaction');
      await fn((...args: any[]) => {
        app.logger.info(
          'Mock storage transaction query used with parameters: ',
          args,
        );
        return args.pop();
      });
    },
  };
};

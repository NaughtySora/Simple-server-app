declare global {
  type Restartable = { start(): Promise<void>; stop(): Promise<void> };

  interface Independent {
    npm: Npm;
    node: NodeApi;
  }

  interface LowDependent {
    config: Config;
    utils: Utils;
  }

  type ApplicationDependencies = LowDependent & Independent;

  type TransportDependencies = ApplicationDependencies & {
    app: ApplicationServices;
  };

  interface Transports {
    http(routing: HTTPRoute[]): Restartable;
  }

  type DomainServicesDependencies = {
    app: ApplicationServices;
    storage: StorageApi;
    utils: LowDependent['utils'];
  } & Independent;
}

export { };

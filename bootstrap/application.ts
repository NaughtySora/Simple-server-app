import loader from 'naughty-loader';
import path from 'node:path';
import bootstrap from './config.json';

const find = (query: string) => path.resolve(__dirname, '../', query);

const paths = {
  config: find('src/config'),
  utils: find('src/utils'),
  package: find('package.json'),
  storage: find('src/storage'),
  application: find('src/application'),
  transport: find('src/transport'),
  domain: {
    services: find('src/domain/services'),
    modules: find('src/domain/modules'),
  },
  routing: find('src/routing'),
};

const independent_load = (bootstrap: any) => {
  const node = loader.node(bootstrap.node) as any;
  const npm = loader.npm(paths.package, bootstrap.npm) as any;
  return { node, npm } as Independent;
};

const low_dependent_load = (context: any) => {
  const config = loader.module(paths.config, context);
  const utils = loader.module(paths.utils, context);
  return { config, utils } as LowDependent;
};

const app_services_load = (bootstrap: any, context: any) => {
  const load = bootstrap.application;
  const api = {} as any;
  for (const name of Object.keys(load)) {
    const implementation = load[name];
    const module_path = path.resolve(paths.application, name, implementation);
    const module = loader.module(module_path, { context });
    if (Object.keys(module).length === 1 && module.index !== undefined) {
      api[name] = module.index;
    } else {
      api[name] = module;
    }
  }
  return api;
};

const transport_load = (bootstrap: any, context: any) => {
  const load = bootstrap.transport;
  const api = {} as any;
  for (const name of Object.keys(load)) {
    const implementation = load[name];
    const module_path = path.resolve(paths.transport, name, implementation);
    api[name] = loader.root(module_path, { context });
  }
  return api;
};

const data_access_load = (bootstrap: any, context: any) => {
  const module_path = path.resolve(paths.storage, bootstrap.storage);
  const root = loader.root(module_path, { context });
  const repository = loader.module(path.resolve(module_path, 'repository'));
  return Object.freeze(Object.assign({}, root, { repository }));
};

const services_load = loader.dir.bind(null, paths.domain.services);
const modules_load = loader.dir.bind(null, paths.domain.modules);
const routing_load = loader.module.bind(null, paths.routing);

const application = () => {
  const independent = independent_load(bootstrap);
  const low_dependent = low_dependent_load(independent);
  const app = app_services_load(bootstrap, {
    ...independent,
    ...low_dependent,
  });
  const context = { ...independent, ...low_dependent, app };
  const transport = transport_load(bootstrap, context);
  const storage = data_access_load(bootstrap, context);
  const services = services_load({
    shared: {
      context: {
        ...independent,
        storage,
        app,
        utils: low_dependent.utils,
      }
    }
  });
  const modules = modules_load({ shared: { context: services } });
  const routing = routing_load({ context: modules });
  return {
    modules,
    transport,
    routing,
    storage,
    app,
  };
};

export {
  application,
  independent_load,
  low_dependent_load,
  app_services_load,
  transport_load,
  data_access_load,
  services_load,
  modules_load,
  routing_load,
  paths,
};

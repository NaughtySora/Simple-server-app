import { loadDir, loadModule, loadNode, loadNPM } from "./loader";
import path from "node:path";

const paths = {
  config: path.resolve(__dirname, "./src/config"),
  utils: path.resolve(__dirname, "./src/utils"),
  package: path.resolve("package.json"),
  storage: path.resolve(__dirname, "./src/storage"),
  application: path.resolve(__dirname, "./src/application"),
  transport: path.resolve(__dirname, "./src/transport"),
  domain: {
    services: path.resolve(__dirname, "./src/domain/services"),
    modules: path.resolve(__dirname, "./src/domain/modules"),
  },
  routing: path.resolve(__dirname, "./src/routing"),
};

const independent_load = async (bootstrap: any) => {
  const [node, npm] = await Promise.all([
    loadNode(bootstrap.node),
    loadNPM(paths.package, bootstrap.npm),
  ]);
  return { node, npm };
};

const low_dependent_load = async (context: any) => {
  const [config, utils] = await Promise.all([
    loadModule(paths.config, context),
    loadModule(paths.utils, context),
  ]);
  return { config, utils };
};

const app_services_load = async (bootstrap: any, context: any) => {
  const load = bootstrap.application;
  const api = {} as any;
  for (const name of Object.keys(load)) {
    const implementation = load[name];
    const module_path = path.resolve(paths.application, name, implementation);
    api[name] = await loadModule(module_path, context);
  }
  return api;
};

const transport_load = async (bootstrap: any, context: any) => {
  const load = bootstrap.transport;
  const api = {} as any;
  for (const name of Object.keys(load)) {
    const implementation = load[name];
    const module_path = path.resolve(paths.transport, name, implementation);
    api[name] = await loadModule(module_path, context);
  }
  return api;
};

const data_access_load = async (bootstrap: any, context: any) => {
  const module_path = path.resolve(paths.storage, bootstrap.storage);
  return await loadModule(module_path, context);
};

const services_load = loadDir.bind(null, paths.domain.services)
const modules_load = loadDir.bind(null, paths.domain.modules);
const routing_load = loadModule.bind(null, paths.routing);

const application = async (bootstrap: any) => {
  const independent = await independent_load(bootstrap);
  const low_dependent = await low_dependent_load(independent);
  const app = await app_services_load(bootstrap, { ...independent, ...low_dependent });
  const context = { ...independent, ...low_dependent, app };
  const [transport, storage] = await Promise.all([
    transport_load(bootstrap, context),
    data_access_load(bootstrap, context),
  ]);
  const services = await services_load({ ...independent, storage, app, utils: low_dependent.utils });
  const modules = await modules_load(services);
  const routing = await routing_load(modules);
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
};

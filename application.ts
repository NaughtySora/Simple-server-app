import { loadDir, loadModule, loadNode, loadNPM } from "./loader";
import path from "node:path";

const paths = {
  config: path.resolve(__dirname, "./src/config"),
  utils: path.resolve(__dirname, "./src/utils"),
  package: path.resolve("package.json"),
  storage: path.resolve(__dirname, "./src/storage"),
  application: path.resolve(__dirname, "./src/application"),
  transport: path.resolve(__dirname, "./src/transport"),
  domain: path.resolve(__dirname, "./src/domain"),
  routing: path.resolve(__dirname, "./src/routing"),
};

const loadEssentials = async (): Promise<Essentials> => {
  const essentials = await Promise.all([
    loadNPM(paths.package, {
      omit: ["dotenv"],
      rename: { "jsonwebtoken": "jwt" }
    }),
    loadModule(paths.config),
    loadModule(paths.utils),
  ]);
  const config = essentials[1];
  return {
    npm: essentials[0],
    config,
    utils: essentials[2],
    node: await loadNode(config.node),
  };
};

const loadStorage = async (context: any) => {
  const storages = await loadDir(paths.storage, context);
  const entries = Object.entries(storages);
  const api = {} as any;
  const use = context.config.storage.use;
  for (const entry of entries) {
    const name = entry[0];
    if (name !== use) continue;
    const bootstrap = entry[1];
    const repository = path.resolve(paths.storage, name, "repository");
    api[name] = await loadModule(repository, { context, bootstrap });
  }
  return { api: api[use], ...storages[use] };
};

const loadLayers = async (essentials: Essentials) => {
  const app = await loadDir(paths.application, essentials);
  const context = { ...essentials, app };
  const layers = await Promise.all([
    loadStorage(context),
    loadDir(paths.transport, context),
  ]);
  return {
    app,
    storage: layers[0],
    transport: layers[1],
  };
};

const loadDomainLayers = async (context: any) => {
  const root = paths.domain;
  const services = await loadDir(
    path.resolve(root, "services"),
    context,
  );
  const { config, ...rest } = context;
  const modules = await loadDir(
    path.resolve(root, "modules"),
    { services, ...rest },
  );
  return modules;
};

const application = async () => {
  const essentials = await loadEssentials();
  const { storage, app, transport } = await loadLayers(essentials);
  const modules = await loadDomainLayers({ ...essentials, storage: storage.api, app, });
  const routing = await loadModule(paths.routing, modules);
  return { transport, routing, storage, essentials, app };
};

export {
  application,
  loadLayers,
  loadDomainLayers,
  loadStorage,
  loadEssentials
};

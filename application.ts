import { loadDir, loadModule, loadNode, loadNPM, LoadFiles } from "./loader";
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
      rename: {
        "jsonwebtoken": "jwt",
        "json-schema": "jsonschema"
      },
    }),
    loadModule(paths.config),
    LoadFiles(paths.utils),
  ]);
  const config = essentials[1];
  return {
    npm: essentials[0],
    config,
    utils: essentials[2],
    node: await loadNode(config.node),
  };
};

const loadStorage = async (context: LayerContext) => {
  const storages = await loadDir(paths.storage, context);
  const entries = Object.entries(storages);
  const api = {} as any;
  const use = context.config.storage.use;
  for (const entry of entries) {
    const name = entry[0];
    if (name !== use) continue;
    const bootstrap = entry[1] as any;
    const repository = path.resolve(paths.storage, name, "repository");
    api[name] = await loadModule(repository, { context, ...bootstrap });
  }
  return { api: api[use], ...storages[use] };
};

const loadLayers = async (essentials: Essentials) => {
  const app = await loadDir(paths.application, essentials) as Application;
  const context = { ...essentials, app } as LayerContext;
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

const loadDomainLayers = async (context: LayerContext & { storage: Layers["storage"]["api"] }) => {
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
  const { storage, app, transport } = await loadLayers(essentials) as Layers;
  const modules = await loadDomainLayers({ ...essentials, storage: storage.api, app, }) as Modules;
  const routing = await loadModule(paths.routing, modules) as PathFinder;
  return { transport, routing, storage, essentials, app };
};

export {
  application,
  loadLayers,
  loadDomainLayers,
  loadStorage,
  loadEssentials
};

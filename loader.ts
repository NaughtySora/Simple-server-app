import fs from "node:fs";
import path from "node:path";

const ALLOWED_EXTS = [".js", ".json", ".ts"];

interface LoadNPMOptions {
  omit?: string[];
  rename?: Record<string, string>;
  specific?: string[];
}

export const loadNPM = async (packageJSON: string, options: LoadNPMOptions = {}) => {
  const { omit = [], rename = {}, specific = [] } = options;
  const json = (await import(packageJSON) as any) ?? {};
  const libs = Object.keys(json.dependencies ?? {});
  const dependencies = [...libs, ...specific].filter(key => !omit.includes(key));
  const npm = [];
  for (const name of dependencies) {
    const module = Object.freeze(await import(name)
      .then(lib => lib.default));
    npm.push([rename[name as keyof typeof rename] ?? name, module]);
  }
  return Object.freeze(Object.fromEntries(npm));
};

export const loadModule = async (dir: string, context = {}) => {
  const files = fs.readdirSync(dir, "utf-8");
  const promises = [];
  const names = [];
  for (const pathname of files) {
    const ext = path.extname(pathname);
    if (!ALLOWED_EXTS.includes(ext)) continue;
    const name = path.basename(pathname, ext);
    names.push(name);
    const promise = import(path.resolve(dir, pathname))
      .then(Module => {
        const defaultExport = Module?.default !== undefined;
        if (defaultExport) {
          if (typeof Module.default === "function") {
            return Module.default(context);
          }
          return Module.default;
        }
        const keys = Object.keys(Module);
        const api = {} as any;
        for (const key of keys) {
          const entity = Module[key];
          if (entity === "function") api[key] = entity(context);
          api[key] = entity;
        }
        return api;
      });
    promises.push(promise);
  }
  const modules = await Promise.all(promises);
  const api = names.reduce((acc, name, idx) =>
    (acc[name] = Object.freeze(modules[idx]), acc), {} as any);
  const rootModule = names.length === 1 && names[0] === "index";
  if (rootModule) {
    const root = api.index;
    if (typeof root === "function") return Object.freeze(root);
    else return Object.freeze({ ...api.index });
  }
  return Object.freeze(api);
};

export const loadDir = async (root: string, context?: any) => {
  const dir = fs.readdirSync(root);
  const app = {} as any;
  for (const file of dir) {
    app[file] = await loadModule(
      path.resolve(root, file),
      context,
    );
  }
  return app;
};

export const loadNode = async (modules: string[]) => {
  const promises = [];
  for (const module of modules) {
    promises.push(import(`node:${module}`)
      .then(module => module.default))
  }
  const node = await Promise.all(promises);
  return Object.freeze(
    Object.fromEntries(
      modules.map((name, i) => [name, node[i]])
    )
  ) as any;
};

export const LoadFiles = async (dir: string) => {
  const files = fs.readdirSync(dir, "utf-8");
  const promises = [];
  const names = [];
  for (const pathname of files) {
    const ext = path.extname(pathname);
    if (!ALLOWED_EXTS.includes(ext)) continue;
    const name = path.basename(pathname, ext);
    names.push(name);
    const promise = import(path.resolve(dir, pathname))
      .then(Module => {
        const defaultExport = Module?.default !== undefined;
        if (defaultExport) return Module.default;
        const keys = Object.keys(Module);
        const api = {} as any;
        for (const key of keys) {
          const entity = Module[key];
          api[key] = entity;
        }
        return api;
      });
    promises.push(promise);
  }
  const modules = await Promise.all(promises);
  const api = names.reduce((acc, name, idx) =>
    (acc[name] = Object.freeze(modules[idx]), acc), {} as any);
  const rootModule = names.length === 1 && names[0] === "index";
  if (rootModule) {
    const root = api.index;
    if (typeof root === "function") return Object.freeze(root);
    else return Object.freeze({ ...api.index });
  }
  return Object.freeze(api);
}
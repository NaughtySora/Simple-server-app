'use strict';

const fs = require('node:fs');
const { extname, resolve, basename } = require('node:path');

const ALLOWED_EXTS = ['.js', '.json', '.ts'];

const npm = (path, { omit = [], rename = {}, specific = [] }) => {
  const json = require(path);
  if (typeof json?.dependencies !== 'object' || json === null) {
    throw new Error(`Can't find dependencies directive with path ${path}`);
  }
  const dependencies = [...Object.keys(json.dependencies), ...specific].filter(
    (key) => !omit.includes(key),
  );
  const npm = {};
  for (const name of dependencies) {
    const module = require(name);
    npm[rename[name] ?? name] = Object.freeze(module?.default ?? module);
  }
  return Object.freeze(npm);
};

const api = (module, context) => {
  const keys = Object.keys(module);
  const api = {};
  for (const key of keys) {
    const entity = module[key];
    if (entity === 'function') api[key] = entity(context);
    api[key] = entity;
  }
  return api;
};

const _default = (module, context) => {
  if (typeof module.default === 'function') {
    const isClass = module.default.toString().startsWith('class');
    if (isClass) return module.default;
    return module.default(context);
  }
  return module.default;
};

const _module = (path, context = {}) => {
  const files = fs.readdirSync(path, 'utf-8');
  const result = {};
  let count = 0;
  for (const pathname of files) {
    const ext = extname(pathname);
    if (!ALLOWED_EXTS.includes(ext)) continue;
    const module = require(resolve(path, pathname));
    const isDefaultExport = module?.default !== undefined;
    result[basename(pathname, ext)] = Object.freeze(
      isDefaultExport ? _default(module, context) : api(module, context),
    );
    count++;
  }
  const index = result.index;
  const rootModule = count === 1 && index !== undefined;
  if (rootModule) {
    if (typeof index === 'function') return Object.freeze(index);
    else return Object.freeze({ ...index });
  }
  return Object.freeze(result);
};

const dir = (path, context) => {
  const dir = fs.readdirSync(path);
  const app = {};
  for (const file of dir) app[file] = _module(resolve(path, file), context);
  return Object.freeze(app);
};

const node = (modules) => {
  const api = [];
  for (const module of modules) {
    const lib = require(`node:${module}`);
    api[module] = lib?.default ?? lib;
  }
  return Object.freeze(api);
};

module.exports = {
  node,
  dir,
  npm,
  module: _module,
};

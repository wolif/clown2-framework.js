/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const _ = require('lodash');
const { EventEmitter } = require('events');
const Container = require('./container');
const config = require('./config');
const envLoader = require('./envLoader');

class Application extends EventEmitter {
  constructor(basePath = '.', configPath = '.') {
    super();
    this.basePath(basePath);
    this.configPath(configPath);
    this.env = envLoader;
    this.config = config;
    this.components_ = new Container();
    this.plugins_ = new Container();
  }

  configPath(configPath = null) {
    if (configPath) {
      this.configPath_ = configPath;
      return null;
    }
    return this.configPath_;
  }

  basePath(basePath = null) {
    if (basePath) {
      this.basePath_ = basePath;
      return null;
    }
    return this.basePath_;
  }

  loadConfigFile(name, file) {
    this.config.loadFile(name, `${this.configPath()}/${file}`);
  }

  loadEnvFile(envFileName = '.env', envFilePath = '') {
    envLoader.load(`${envFilePath || this.basePath()}/${envFileName}`);
  }

  addComponent(name, component, cover = true) {
    this.components_.set(name, component, cover);
  }

  addPlugin(name, plugin, cover = true) {
    this.plugins_.set(name, plugin, cover);
  }

  init() {
    this.components_.names.forEach(async (name) => {
      const component = this.components_.get(name);
      if ('init' in component && _.isFunction(component.init)) {
        await new Promise((resolve, reject) => {
          try {
            component.init(this.config, this);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
      if (component instanceof EventEmitter) {
        component.emit('init', this.config, this);
      }
    });
    this.plugins_.names.forEach(async (name) => {
      const plugin = this.plugins_.get(name);
      if ('init' in plugin && _.isFunction(plugin.init)) {
        await new Promise((resolve, reject) => {
          try {
            plugin.init(this.config, this);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
      if (plugin instanceof EventEmitter) {
        plugin.emit('init', this.config, this);
      }
    });
  }

  shutdown() {
    this.components_.names.forEach(async (name) => {
      const component = this.components_.get(name);
      if ('shutdown' in component && _.isFunction(component.init)) {
        await new Promise((resolve, reject) => {
          try {
            component.shutdown(this.config, this);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
      if (component instanceof EventEmitter) {
        component.emit('shutdown', this.config, this);
      }
    });
    this.plugins_.names.forEach(async (name) => {
      const plugin = this.plugins_.get(name);
      if ('shutdown' in plugin && _.isFunction(plugin.init)) {
        await new Promise((resolve, reject) => {
          try {
            plugin.shutdown(this.config, this);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      }
      if (plugin instanceof EventEmitter) {
        plugin.emit('shutdown', this.config, this);
      }
    });
  }
}

const clown = new Proxy(new Application(), {
  get: (target, prop) => {
    if (prop in target) {
      return target[prop];
    }
    if (target.components_.has(prop)) {
      return target.components_.get(prop);
    }
    if (target.plugins_.has(prop)) {
      return target.plugins_.get(prop);
    }
    return null;
  },
});

global.clown = clown;
module.exports = clown;

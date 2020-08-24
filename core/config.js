/* eslint-disable no-case-declarations */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class Config {
  constructor() {
    this.props = {};
  }

  loadFile(name, file) {
    // eslint-disable-next-line no-restricted-syntax
    for (const fileExt of ['', '.js', '.json']) {
      if (_.isString(file)) {
        const filename = `${file}${fileExt}`;
        if (fs.existsSync(filename)) {
          switch (fileExt) {
            case 'js':
            case 'json':
            default:
              const conf = require(filename);
              this.set(name, conf);
              break;
          }
          break;
        }
      }
    }
  }

  get(name, defVal = null) {
    return _.get(this.props, name, defVal);
  }

  set(name, value) {
    _.set(this.props, name, value);
  }
}

const config = new Proxy(new Config(), {
  set: (target, prop, value) => {
    if (!(prop in target)) {
      target.set(prop, value);
    }
  },
  get: (target, prop) => {
    if (prop in target) {
      return target[prop];
    }
    return target.get(prop);
  },
  has: (target, prop) => {
    if (prop in target) {
      return true;
    }
    return prop in target.props;
  },
});

module.exports = config;

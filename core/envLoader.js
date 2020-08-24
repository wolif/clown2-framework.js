const fs = require('fs');

const envLoader = {
  /**
   * @param {String} name
   * @param {String|Number} defVal
   * @returns {String|Number}
   */
  get: (name = null, defVal = '') => {
    if (name === null) {
      return process.env;
    }
    if (name in process.env) {
      return process.env[name];
    }
    return defVal;
  },

  /**
   * @param {String} file
   */
  load: (file) => {
    if (!fs.existsSync(file)) {
      throw new Error(`file [${file}] not found`);
    }
    fs.readFileSync(file, 'utf-8').toString().split('/\r|\n|\r\n/').forEach((line) => {
      const matches = line.match(/^\s*([\w.-]+)\s*=(.*)\s*$/);
      if (matches.length > 1) {
        process.env[matches[1].trim().toUpperCase()] = matches[2].trim() || '';
      }
    });
  },
};

module.exports = new Proxy(envLoader, {
  get: (target, prop) => {
    if (prop in target) {
      return target[prop];
    }
    return target.get(prop);
  },
});

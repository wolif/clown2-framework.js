class Container {
  constructor() {
    this.container = {};
    this.names = new Set();
  }

  has(name) {
    return name in this.container;
  }

  set(name, value, cover = true) {
    if (this.has(name) || cover) {
      this.container[name] = value;
      this.names.add(name);
    }
  }

  get(name) {
    if (this.has(name)) {
      return this.container[name];
    }
    return null;
  }
}

module.exports = Container;

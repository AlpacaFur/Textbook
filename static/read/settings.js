class Settings {
  constructor(settingsManifest) {
    this._manifest = {...settingsManifest}
    this._state = {...this._loadData(settingsManifest)}
    this.listeners = {};
  }
  set(pathStr, value) {
    let path = pathStr.split(".");
    if (this._validate(path)) {
      if (this._state[path[0]][path[1]] === value) return;
      this._state[path[0]][path[1]] = value;
      this._publish(pathStr, value);
    }
  }
  reset(pathStr) {
    let path = pathStr.split(".");
    if (this._validate(path)) {
      let defaultVal = this._manifest[path[0]][path[1]];
      if (this._state[path[0]][path[1]] === defaultVal) return;
      this._state[path[0]][path[1]] === defaultVal;
    }
  }
  get(pathStr) {
    let path = pathStr.split(".")
    if (this._validate(path)) {
      return this._state[path[0]][path[1]]
    }
  }
  listen(pathStr, callback, preventInitialFire) {
    let path = pathStr.split(".");
    if (this._validate(path)) {
      if (!this.listeners[pathStr]) {
        this.listeners[pathStr] = []
      }
      let index = this.listeners[pathStr].push(callback);
      if (!preventInitialFire) callback(this.get(pathStr))
      return ()=>{this._stopListening(pathStr, index)};
    }
  }
  _stopListening(pathStr, index) {
    delete this.listeners[pathStr][index];
  }
  _publish(pathStr, value) {
    let listeners = this.listeners[pathStr];
    if (listeners) {
      listeners.forEach(callback=>callback(value));
    }
  }
  _loadData(manifest) {
    // Override defualts with data from local storage
    return manifest;
  }
  _validate(path) {
    if (path.length !== 2) throw new Error("Invalid Path!");
    let [group, property] = path;
    if (!this._state.hasOwnProperty(group)) throw new Error("Invalid Group!");
    let stateGroup = this._state[path[0]];
    if (!stateGroup.hasOwnProperty(path[1])) throw new Error("Invalid Property!");
    return true;
  }
}

const settingsManifest = {
  display: {
    theme: "dark",
  },
  test: {
    test1: true,
    test2: false,
    test3: 0,
    test4: 1,
  },
}

let settings = new Settings(settingsManifest);

let stop = settings.listen("display.theme", (value)=>{
  console.log("theme", value)
})

class Store {
  constructor(reducers) {
    let state = {};
    this.reducers = reducers;
    this.propSubscribers = {};
    this.subscribers = [];
    Object.entries(reducers).forEach(([prop, reducer])=>{
      let returnVal = reducer();
      if (returnVal === undefined) throw new Error(`Reducer "${prop}" should never return undefined`)
      state[prop] = reducer();
    })
    this.state = state;
  }
  dispatch(action) {
    Object.entries(this.reducers).find(([prop, reducer])=>{
      let oldState = this.state;
      let newState = reducer(action, this.state);
      if (oldState !== newState) {
        this.state = {...this.state, [prop]:newState}
        this.subscribers.forEach((callback)=>{callback(this.state)})
        return true;
      }
      return false;
    })
  }
  _unsubscribe(property, index) {
    delete this.propSubscribers[property][index];
  }
  subscribe(callback) {
    let length = this.subscribers.push(callback);
    return ()=>{this._unsubscribe(property, length-1)};
  }
  getState() {
    return {...this.state};
  }
  connect(instance, stateNameMap) {
    instance.state = stateNameMap(this.state);
    let unsubscribe = this.subscribe((state)=>{
      instance.state = stateNameMap(this.state);
    })
  }
}

const stateNameMap = (state)=>({
  theme: state.theme,
})

class Element {
  constructor(element) {
    this._state = {};
    this.element = this.resolveElement(element);

  }
  set state(value) {
    if (this._shallowCompare(this._state, value)) {
      this.render();
    }
  }
  render() {
    console.warn("All classes should override the render method.")
  }
  resolveElement(element) {
    if (element.tagName) return element;
    else {
      return document.getElementById("element")
    }
  }
  _shallowCompare(oldObj, newObj) {
    return Object.entries(newObj).every(([prop, value])=>{
      return oldObj[prop] === newObj[prop];
    })
  }
}

class Content extends Element {
  constructor(element) {
    super(element);
  }
  setData(data) {
    this.data = data;
    this.position = 0;
  }
  render() {

  }
  forward() {

  }
  backward() {

  }
}

class ReadApp extends Element {
  constructor(element) {
    super(element);

  }
}
const p = string => string.split(".");

const theme = (action = {}, state = "light") => {
  switch (action.type) {
    case "LIGHT_MODE":
      return "light";
      break;
    case "DARK_MODE":
      return "dark";
      break;
    default:
      return state;
  }
}

const store = new Store({theme:theme});

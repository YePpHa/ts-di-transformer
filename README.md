# Dependency Injection with Interfaces for TypeScript
[![](https://img.shields.io/npm/v/ts-di-transformer.svg?style=flat)](https://npmjs.com/package/ts-di-transformer)

This is a proof-of-concept of using interfaces with dependency injection. The
only requirement for this to work is using a custom transformer.

All the neccessary information is resolved on compile-time. The runtime part get
fed the needed information through `.bind()` and `.resolve()`.

__Disclaimer: This has only been tested on TypeScript v3.2.2. Any other version
may break this.__

## How does it work?
The interfaces are converted into symbols when calling `InterfaceSymbol<T>()`
(replace `T` with the interface). The symbol that's returned will always be the
same for each interface.

As this example is not using `reflect-metadata` it's also resolving the
parameters of the constructor. It will automatically append an extra parameter
to both `.bind()` and `.resolve()` with an array of the parameters.

See https://github.com/YePpHa/ts-di-transformer-example for a proper example of
how to use it.

### Before custom transformer
```TypeScript
interface IBird {
  canFly(): boolean;
}

class Crow implements IBird {
  public canFly() {
    return true;
  }
}

class App {
  constructor(bird: IBird) {
    if (bird.canFly()) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }
  }
}

const container = new Container();
container.bind(InterfaceSymbol<IBird>(), Crow);

container.resolve(App);
```

### After custom transformer
```TypeScript
interface IBird {
  canFly(): boolean;
}

class Crow implements IBird {
  public canFly() {
    return true;
  }
}

class App {
  constructor(bird: IBird) {
    if (bird.canFly()) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }
  }
}

const container = new Container();
container.bind(Symbol.for("2ef34e55ca621e95ab608501c23d72201fb80158c44cbfe6d3d509d8d2a418d8"), Crow, []);

container.resolve(App, [Symbol.for("2ef34e55ca621e95ab608501c23d72201fb80158c44cbfe6d3d509d8d2a418d8")]);
```

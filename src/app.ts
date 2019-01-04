import { InterfaceSymbol, Container } from '../transformer/api';

interface IBird {
  canFly: boolean;
}

interface IDog {
  goodBoy: boolean;
}

class Crow implements IBird {
  canFly = true;
}

class Penguin implements IBird {
  canFly = false;
}

class App {
  constructor(bird: IBird) {
    if (bird.canFly) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }
  }
}

const container = new Container();
container.bind(InterfaceSymbol<IBird>(), Crow);

container.startBootstrap(App);
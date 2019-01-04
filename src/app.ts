import { InterfaceSymbol, Container } from '../transformer/api';

interface IBird {
  canFly(): boolean;
}

interface IOperator {
  add(x: number, y: number): number;
}

class MyOperator implements IOperator {
  public add(x: number, y: number) {
    return x + y;
  }
}

class MyBrokenOperator implements IOperator {
  public add(x: number, y: number) {
    return x*2 + y;
  }
}

class Crow implements IBird {
  constructor(op: IOperator) {
    console.log(op.add(2, 2));
  }

  public canFly() {
    return true;
  }
}

class Penguin implements IBird {
  public canFly() {
    return false;
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
container.bind(InterfaceSymbol<IOperator>(), MyBrokenOperator);

container.startBootstrap(App);
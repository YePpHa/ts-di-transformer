import { InterfaceSymbol, Container } from 'api';

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
  constructor(ops: IOperator[]) {
    for (const op of ops) {
      console.log(op.add(2, 2));
    }
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
  constructor(bird: IBird, test: Test) {
    if (bird.canFly()) {
      console.log("Bird can fly");
    } else {
      console.log("Bird can't fly");
    }

    test.say("Amy");
  }
}

class Test {
  say(name: string): void {
    console.log("Hello " + name);
  }
}

class MyTest extends Test {
  say(name: string): void {
    console.log("Hello, " + name);
  }
}

const container = new Container();
container.bind(InterfaceSymbol<IBird>()).to(Crow);
container.bind(InterfaceSymbol<IOperator>()).toConstantValue(new MyBrokenOperator());
container.bind(Test).to(MyTest);
container.bind(Crow).to(Crow);

container.resolve(App);
import { InterfaceSymbol, Container } from 'api';

import { IOperator } from './models/IOperator';
import { IBird } from './models/IBird';
import { Crow } from './impl/Crow';
import { MyBrokenOperator } from './impl/MyBrokenOperator';
import { MyTest } from './impl/MyTest';
import { Test } from './impl/Test';
import { App } from './impl/App';

const container = new Container();
container.bind(InterfaceSymbol<IBird>(), Crow);
container.bindToConstant(InterfaceSymbol<IOperator>(), new MyBrokenOperator());
container.bind(Test, MyTest);

container.resolve(App);
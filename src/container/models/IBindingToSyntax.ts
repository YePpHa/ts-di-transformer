import { Newable } from "./Identifier";

export interface IBindingToSyntax<T> {
  to(constructor: Newable<T>, params?: any[]): void;
  toConstructor(constructor: Newable<T>): void;
  toConstantValue(value: T): void;
  toSelf(): void;
}
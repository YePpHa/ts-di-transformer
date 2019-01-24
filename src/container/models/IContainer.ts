import { ServiceIdentifier, Newable } from "./Identifier";
import { IBindingToSyntax } from "./IBindingToSyntax";

export interface IContainer {
  parent: IContainer | null;
  bind<T>(serviceIdentifier: ServiceIdentifier<T>, params?: any[]): IBindingToSyntax<T>;
  get<T>(key: ServiceIdentifier<T>): any;
  resolve<T>(service: Newable<T>, params: any[]): T;
  createChild(): IContainer;
}
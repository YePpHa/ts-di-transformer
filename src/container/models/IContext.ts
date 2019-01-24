import { ILookupContainer } from "./ILookupContainer";
import { IBinding } from "./IBinding";
import { ServiceIdentifier } from "./Identifier";

export interface IContext {
  container: ILookupContainer<IBinding<any>>;

  getFirstBinding<T>(key: ServiceIdentifier<T>): IBinding<T> | null;
  getBindings<T>(key: ServiceIdentifier<T>): IBinding<T>[];
  getParentContext(): IContext | null;
}
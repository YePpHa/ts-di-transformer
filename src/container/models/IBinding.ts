import { Newable, ServiceIdentifier } from "./Identifier";
import { BindingType } from "./BindingType";

export interface IBinding<T> {
  // A runtime identifier because at runtime we don't have interfaces
  serviceIdentifier: ServiceIdentifier<T>;

  // The constructor of a class which must implement T
  implementationType: Newable<T> | null;

  // The parameters of the constructor
  implementationTypeParameters: any[] | null;
  
  // Cache used to allow singleton scope and BindingType.ConstantValue bindings
  cache: T | null;

  // The kind of binding
  type: BindingType;
}
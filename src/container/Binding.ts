import { ServiceIdentifier, Newable } from "./models/Identifier";
import { IBinding } from "./models/IBinding";
import { BindingType } from "./models/BindingType";

export class Binding<T> implements IBinding<T> {
  // A runtime identifier because at runtime we don't have interfaces
  public serviceIdentifier: ServiceIdentifier<T>;

  // The constructor of a class which must implement T
  public implementationType: Newable<T> | null = null;

  // The parameters of the constructor
  public implementationTypeParameters: any[] | null = null;
  
  // Cache used to allow singleton scope and BindingType.ConstantValue bindings
  public cache: T | null = null;

  // The kind of binding
  public type = BindingType.Invalid;

  constructor(serviceIdentifier: ServiceIdentifier<T>) {
    this.serviceIdentifier = serviceIdentifier;
  }
}
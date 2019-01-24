import { Newable } from "./models/Identifier";
import { Binding } from "./Binding";
import { IBindingToSyntax } from "./models/IBindingToSyntax";
import { BindingType } from "./models/BindingType";

export class BindingToSyntax<T> implements IBindingToSyntax<T> {
  private _binding: Binding<T>;

  constructor(binding: Binding<T>) {
    this._binding = binding;
  }

  public to(constructor: Newable<T>, params?: any[]): void {
    this._binding.type = BindingType.Instance;
    this._binding.implementationType = constructor;
    if (params) {
      this._binding.implementationTypeParameters = params;
    }
  }

  public toConstructor(constructor: Newable<T>): void {
    this._binding.type = BindingType.Constructor;
    this._binding.implementationType = constructor;
  }

  public toConstantValue(value: T): void {
    this._binding.type = BindingType.ConstantValue;
    this._binding.cache = value;
    this._binding.implementationType = null;
  }

  public toSelf(): void {
    if (typeof this._binding.serviceIdentifier !== "function") {
      throw new Error("Only constructors can be passed");
    }
    this.to(this._binding.serviceIdentifier);
  }
}
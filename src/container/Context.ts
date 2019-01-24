import { IContext } from "./models/IContext";
import { ILookupContainer } from "./models/ILookupContainer";
import { IBinding } from "./models/IBinding";
import { ServiceIdentifier } from "./models/Identifier";
import { Request } from "./Request";

export class Context implements IContext {
  public container: ILookupContainer<IBinding<any>>;

  public constructor(container: ILookupContainer<IBinding<any>>) {
    this.container = container;
  }

  public getFirstBinding<T>(key: ServiceIdentifier<T>): IBinding<T>|null {
    const lookup = this.container.getLookup();
    if (lookup.has(key)) {
      return lookup.get(key)[0];
    }

    const parentContext = this.getParentContext();
    if (parentContext) {
      return parentContext.getFirstBinding(key);
    }

    return null;
  }

  public getBindings<T>(key: ServiceIdentifier<T>): IBinding<T>[] {
    let bindings: IBinding<T>[] = [];

    const lookup = this.container.getLookup();
    if (lookup.has(key)) {
      bindings = lookup.get(key);
    }

    const parentContext = this.getParentContext();
    if (parentContext) {
      bindings = parentContext.getBindings(key).concat(bindings);
    }

    return bindings;
  }

  public getParentContext(): IContext | null {
    if (this.container.parent !== null) {
      return new Context(this.container.parent);
    }
    return null;
  }
}
import { ServiceIdentifier, Newable } from "./models/Identifier";
import { Binding } from "./Binding";
import { BindingToSyntax } from "./BindingToSyntax";
import { Lookup } from "./Lookup";
import { Resolver } from "./Resolver";
import { RequestTarget } from "./RequestTarget";
import { Request } from "./Request";
import { IContainer } from "./models/IContainer";
import { Context } from "./Context";
import { ILookupContainer } from "./models/ILookupContainer";
import { IBinding } from "./models/IBinding";
import { IBindingToSyntax } from "./models/IBindingToSyntax";

export class Container implements IContainer, ILookupContainer<IBinding<any>> {
  private _bindings: Lookup<IBinding<any>> = new Lookup();
  public parent: IContainer & ILookupContainer<IBinding<any>> | null = null;

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, params?: any[]): IBindingToSyntax<T> {
    const binding = new Binding<T>(serviceIdentifier);
    this._bindings.add(serviceIdentifier, binding);
    if (params) {
      binding.implementationTypeParameters = params;
    }
    
    return new BindingToSyntax<T>(binding);
  }
  
  public get<T>(key: ServiceIdentifier<T>): any {
    const resolver = new Resolver();

    const target = new RequestTarget<T>(key, false);
    const context = new Context(this);

    const request = new Request<T>(
      context,
      target
    );

    return resolver.resolve(request);
  }
  
  public resolve<T>(constructorFunction: Newable<T>, params: any[] = []): T {
    const tempContainer = this.createChild();
    tempContainer.bind<T>(constructorFunction, params).toSelf();

    return tempContainer.get<T>(constructorFunction);
  }

  public createChild(): IContainer {
    const child = new Container();
    child.parent = this;

    return child;
  }

  public getLookup(): Lookup<IBinding<any>> {
    return this._bindings;
  }
}
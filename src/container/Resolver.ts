import { Binding } from "./Binding";
import { Request } from "./Request";
import { BindingType } from "./models/BindingType";
import { IContext } from "./models/IContext";
import { RequestTarget } from "./RequestTarget";

export class Resolver {
  public resolve<T>(request: Request<T>) {
    const context = request.context;

    const bindings = request.getBindings();
    return bindings.map(binding => {
      switch (binding.type) {
        case BindingType.ConstantValue:
          return binding.cache;
        case BindingType.Constructor:
          return binding.implementationType;
        case BindingType.Instance:
          return this._resolveInstance(context, binding)
        default:
          throw new Error("Invalid binding");
      }
    });
  }

  private _resolveInstance<T>(context: IContext, binding: Binding<T>): any {
    const type = binding.implementationType;
    const parameters = binding.implementationTypeParameters;
    if (!type) throw new Error("Implementation not defined");
    if (!parameters) throw new Error("Implementation parameters not found");

    const resolvedParameters = parameters.map(parameter => {
      const isArray = Array.isArray(parameter);
      if (isArray) {
        parameter = parameter[0];
      }

      const resolver = new Resolver();

      const target = new RequestTarget<T>(parameter, isArray);
      const request = new Request<T>(context, target);

      return resolver.resolve(request);
    });

    return new type(...resolvedParameters);
  }
}
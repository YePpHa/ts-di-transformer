import { IRequest } from "./models/IRequest";
import { IContext } from "./models/IContext";
import { IRequestTarget } from "./models/IRequestTarget";

export class Request<T> implements IRequest<T> {
  public context: IContext;
  public target: IRequestTarget<T>;

  public constructor(
    context: IContext,
    target: IRequestTarget<T>
  ) {
    this.context = context;
    this.target = target;
  }

  public getBindings() {
    const context = this.context;
    const targetIsAnArray = this.target.isArray;

    if (targetIsAnArray) {
      return context.getBindings<T>(this.target.serviceIdentifier);
    } else {
      const binding = context.getFirstBinding<T>(this.target.serviceIdentifier);
      if (binding === null) {
        return [];
      } else {
        return [binding];
      }
    }
  }
}
import { IBinding } from "./IBinding";
import { IRequestTarget } from "./IRequestTarget";
import { IContext } from "./IContext";

export interface IRequest<T> {
  context: IContext;
  target: IRequestTarget<T>;
}
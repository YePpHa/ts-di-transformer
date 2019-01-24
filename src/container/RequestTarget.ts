import { ServiceIdentifier } from "./models/Identifier";
import { IRequestTarget } from "./models/IRequestTarget";

export class RequestTarget<T> implements IRequestTarget<T> {
  public serviceIdentifier: ServiceIdentifier<T>;
  public isArray: boolean;

  constructor(
    serviceIdentifier: ServiceIdentifier<T>,
    isMultiInject: boolean
  ) {
    this.serviceIdentifier = serviceIdentifier;
    this.isArray = isMultiInject;
  }
}
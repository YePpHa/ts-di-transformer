import { RequestTarget } from "./RequestTarget";

export class RequestScope<T> {
  public target: RequestTarget<T>;

  constructor(target: RequestTarget<T>) {
    this.target = target;
  }
}
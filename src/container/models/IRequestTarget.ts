import { ServiceIdentifier } from "./Identifier";

export interface IRequestTarget<T> {
  serviceIdentifier: ServiceIdentifier<T>;
  isArray: boolean;
}
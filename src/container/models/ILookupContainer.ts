import { Lookup } from "../Lookup";

export interface ILookupContainer<T> {
  parent: ILookupContainer<T> | null;
  getLookup(): Lookup<T>;
}
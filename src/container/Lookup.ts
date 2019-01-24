import { ServiceIdentifier } from "./models/Identifier";

export class Lookup<T> {
  private _map: Map<ServiceIdentifier<any>, T[]> = new Map();

  public get(serviceIdentifier: ServiceIdentifier<any>): T[] {
    const entry = this._map.get(serviceIdentifier);

    if (entry !== undefined) {
      return entry;
    } else {
      throw new Error("Service identifier not found");
    }
  }

  public add(serviceIdentifier: ServiceIdentifier<any>, value: T): void {
    let entry = this._map.get(serviceIdentifier);
    if (entry !== undefined) {
      entry.push(value);
    } else {
      entry = [value];
    }
    this._map.set(serviceIdentifier, entry);
  }

  public remove(serviceIdentifier: ServiceIdentifier<any>): void {
    if (!this._map.delete(serviceIdentifier)) {
      throw new Error("Service identifier not found");
    }
  }

  public has(serviceIdentifier: ServiceIdentifier<any>) {
    return this._map.has(serviceIdentifier);
  }
}
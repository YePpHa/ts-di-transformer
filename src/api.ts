export interface Newable<T> {
  new (...args: any[]): T;
}

export interface Abstract<T> {
  prototype: T;
}

export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

export declare function InterfaceSymbol<T extends Object>(): symbol;

export class Container {
  private _map: Map<ServiceIdentifier<any>, {
    constructor: Newable<any>,
    params: any[],
    instance: any
  }> = new Map();

  public get<T>(key: ServiceIdentifier<T>): any {
    const entry = this._map.get(key);
    if (!entry) throw new Error("Missing binding of `" + key.toString() + "`.");

    if (!entry.instance) {
      entry.instance = this.resolve(entry.constructor, entry.params);
    }

    return entry.instance;
  }

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: Newable<T>, params: any[] = []): void {
    this._map.set(serviceIdentifier, {
      constructor,
      params,
      instance: undefined
    });
  }

  public resolve(service: new (...args: any[]) => any, params: any[] = []): void {
    const args: any = [];
    for (const val of params) {
      args.push(this.get(val));
    }

    return new service(...args);
  }
}
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

  private _getService<T>(key: ServiceIdentifier<T>): any {
    const entry = this._map.get(key);
    if (!entry) throw new Error("Missing binding of `" + key.toString() + "`.");

    if (!entry.instance) {
      entry.instance = this.startBootstrap(entry.constructor, entry.params);
    }

    return entry.instance;
  }

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: Newable<T>, params: any[] = []) {
    this._map.set(serviceIdentifier, {
      constructor,
      params,
      instance: undefined
    });
  }

  public startBootstrap(service: new (...args: any[]) => any, params: any[] = []) {
    const args: any = [];
    for (const val of params) {
      args.push(this._getService(val));
    }

    return new service(...args);
  }
}
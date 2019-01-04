export interface Newable<T> {
  new (...args: any[]): T;
}

export interface Abstract<T> {
  prototype: T;
}

export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

export declare function InterfaceSymbol<T extends Object>(): symbol;

export class Container {
  private _map: Map<ServiceIdentifier<any>, any> = new Map();

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: Newable<T>, params: any[] = []) {
    this._map.set(serviceIdentifier, this.startBootstrap(constructor, params));
  }

  public startBootstrap(service: new (...args: any[]) => any, params: any[] = []) {
    const args: any = [];
    for (const val of params) {
      if (!this._map.has(val)) throw new Error("Missing binding of `" + val + "`.");

      const entry = this._map.get(val);
      args.push(entry);
    }

    return new service(...args);
  }
}
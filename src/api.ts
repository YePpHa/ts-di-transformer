export interface Newable<T> {
  new (...args: any[]): T;
}

export interface Abstract<T> {
  prototype: T;
}

export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

export declare function InterfaceSymbol<T extends Object>(): symbol;

interface IContainerNewable {
  kind: 'newable';
  newable: Newable<any>;
  params: any[];
  value?: any;
}

interface IContainerConstant {
  kind: 'constant';
  value: any;
}

export class Container {
  private _map: Map<ServiceIdentifier<any>, IContainerNewable|IContainerConstant> = new Map();

  public get<T>(key: ServiceIdentifier<T>): any {
    const entry = this._map.get(key);
    if (!entry) throw new Error("Missing binding of `" + key.toString() + "`.");

    if (entry.kind === 'newable' && !entry.value) {
      entry.value = this.resolve(entry.newable, entry.params);
    }

    return entry.value;
  }

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: Newable<T>, params: any[] = []): void {
    this._map.set(serviceIdentifier, {
      kind: 'newable',
      newable: constructor,
      params
    });
  }

  public bindToConstant<T>(serviceIdentifier: ServiceIdentifier<T>, constant: any): void {
    this._map.set(serviceIdentifier, {
      kind: 'constant',
      value: constant
    });
  }

  public resolve<T>(service: Newable<T>, params: any[] = []): T {
    const args: any = [];
    for (const val of params) {
      args.push(this.get(val));
    }

    return new service(...args);
  }
}
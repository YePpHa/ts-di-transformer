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
  private _map: Map<ServiceIdentifier<any>, (IContainerNewable|IContainerConstant)[]> = new Map();

  public get<T>(key: ServiceIdentifier<T>|ServiceIdentifier<T>[]): any {
    const isMultiInject = Array.isArray(key);
    if (Array.isArray(key)) {
      if (key.length > 0) {
        key = key[0];
      } else {
        throw new Error("Invalid multi inject of `" + key.toString() + "`.");
      }
    }

    const entries = this._map.get(key);
    if (!entries || entries.length === 0) {
      throw new Error("Missing binding of `" + key.toString() + "`.");
    }

    const resolvedEntries = [];
    for (const entry of entries) {
      if (entry.kind === 'newable' && !entry.value) {
        entry.value = this.resolve(entry.newable, entry.params);
      }

      if (isMultiInject) {
        resolvedEntries.push(entry.value);
      } else {
        return entry.value;
      }
    }
    
    return resolvedEntries;
  }

  public bind<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: Newable<T>, params: any[] = []): void {
    let entries = this._map.get(serviceIdentifier) || [];
    entries.push({
      kind: 'newable',
      newable: constructor,
      params
    });

    this._map.set(serviceIdentifier, entries);
  }

  public bindToConstant<T>(serviceIdentifier: ServiceIdentifier<T>, constant: any): void {
    let entries = this._map.get(serviceIdentifier) || [];
    entries.push({
      kind: 'constant',
      value: constant
    });

    this._map.set(serviceIdentifier, entries);
  }

  public resolve<T>(service: Newable<T>, params: any[] = []): T {
    const args: any = [];
    for (const val of params) {
      args.push(this.get(val));
    }

    return new service(...args);
  }
}
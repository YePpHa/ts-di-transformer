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
  newable: Newable<unknown>;
  params: any[];
  value?: unknown;
}

interface IContainerConstant {
  kind: 'constant';
  value: unknown;
}

interface IContainerFactory<T> {
  kind: 'factory';
  factory: (container: Container) => T;
  value?: T;
}

export class Container {
  private _map: Map<ServiceIdentifier<unknown>, (IContainerNewable|IContainerConstant|IContainerFactory<unknown>)[]> = new Map();

  public get<T>(key: ServiceIdentifier<T>|ServiceIdentifier<T>[]): unknown {
    const isMultiInject = Array.isArray(key);
    if (Array.isArray(key)) {
      if (key.length > 0) {
        key = key[0];
      } else {
        throw new Error("Invalid multi inject of `" + key.toString() + "`.");
      }
    }

    const entries = this._map.get(key);
    if (isMultiInject && (!entries || entries.length === 0)) {
      return [];
    }
    
    if (!entries || entries.length === 0) {
      throw new Error("Missing binding of `" + key.toString() + "`.");
    }

    const resolvedEntries = [];
    for (const entry of entries) {
      if (entry.kind === 'newable' && !entry.value) {
        entry.value = this.resolve(entry.newable, entry.params);
      }
      if (entry.kind === 'factory' && !entry.value) {
        entry.value = entry.factory(this);
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
    const entries = this._map.get(serviceIdentifier) || [];
    entries.push({
      kind: 'newable',
      newable: constructor,
      params
    });

    this._map.set(serviceIdentifier, entries);
  }

  public bindToConstant<T>(serviceIdentifier: ServiceIdentifier<T>, constant: T): void {
    const entries = this._map.get(serviceIdentifier) || [];
    entries.push({
      kind: 'constant',
      value: constant
    });

    this._map.set(serviceIdentifier, entries);
  }

  /**
   * Bind the implementations of the class to the class.
   * @param constructor 
   * @param params 
   * @param serviceIdentifiers 
   */
  public bindToImplements<T>(constructor: Newable<T>, params: any[] = [], serviceIdentifiers: ServiceIdentifier<T>[] = []) {
    const entry = {
      kind: 'newable',
      newable: constructor,
      params
    } as IContainerNewable;

    for (const serviceIdentifier of serviceIdentifiers) {
      const entries = this._map.get(serviceIdentifier) || [];
      entries.push(entry);

      this._map.set(serviceIdentifier, entries);
    }
  }

  public bindToFactory<T>(serviceIdentifier: ServiceIdentifier<T>, factory: (container: Container) => T) {
    const entries = this._map.get(serviceIdentifier) || [];
    entries.push({
      kind: 'factory',
      factory
    });

    this._map.set(serviceIdentifier, entries);
  }

  public resolve<T>(service: Newable<T>, params: any[] = []): T {
    const args: unknown[] = [];
    for (const val of params) {
      args.push(this.get(val));
    }

    return new service(...args);
  }

  public resolveFactory<T>(service: Newable<T>, params: any[] = []): Newable<T> {
    const args: unknown[] = [];
    for (const val of params) {
      args.push(this.get(val));
    }

    return service.bind(undefined, ...args);
  }
}
declare module Paperbits {
    interface IInjector {
        bind(name: string, transient: any): void;
        bindSingleton(name: string, singletone: any): void;
        bindComponent<T>(name: string, factory: (ctx: IInjector, params?: any) => T): void;
        bindInstance<T>(name: string, instance: T): void;
        bindFactory<T>(name, factory: (ctx: IInjector) => T): void;
        resolve<TImplementationType>(runtimeIdentifier: string): TImplementationType;
    }

    interface IRegistration {
    }

    interface IEventManager {
        dispatchEvent(eventName: string, args: any);
    }

    module Permalinks {
        interface IPermalink {
        }
    }

    module Persistence {
        interface IObjectStorage { }
        interface IFileStorage { }
        class CachedObjectStorage {
            constructor(objectStorage, eventManager);
        }
    }

    module Configuration {
        export interface ISettingsProvider {
            getSettings(): Promise<Object>;
            getSetting(name: string): Promise<Object>;
            setSetting(name: string, value: Object): void;
        }
    }
}

declare class ProgressPromise<T> {
    constructor(resolve?, reject?, progress?);
}

declare var _;
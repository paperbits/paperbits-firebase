module Paperbits.Registrations {
    export class FirebaseRegistration implements IRegistration {
        public register(injector: IInjector): void {
            injector.bindSingleton("firebaseService", Paperbits.Firebase.FirebaseService);
            injector.bindSingleton("fileStorage", Paperbits.Firebase.FirebaseFileStorage);

            injector.bindFactory<Paperbits.Persistence.IObjectStorage>("objectStorage", (ctx: Paperbits.IInjector) => {
                var firebaseService = ctx.resolve<Paperbits.Firebase.FirebaseService>("firebaseService");
                var objectStorage = new Paperbits.Firebase.FirebaseObjectStorage(firebaseService);
                var eventManager = ctx.resolve<Paperbits.IEventManager>("eventManager");
                
                return new Paperbits.Persistence.CachedObjectStorage(objectStorage, eventManager);
            });
        }
    }
}
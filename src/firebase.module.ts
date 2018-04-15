import { IObjectStorage, OfflineObjectStorage } from "@paperbits/common/persistence";
import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./firebaseObjectStorage";
import { FirebaseBlobStorage } from "./firebaseBlobStorage";
import { FirebaseService } from "./firebaseService";
import { FirebaseUserService } from "./firebaseUserService";
import { FirebaseAdminObjectStorage } from "./firebaseAdminObjectStorage";
import { FirebaseAdminBlobStorage } from "./firebaseAdminBlobStorage";
import { FirebaseAdminService } from "./firebaseAdminService";


export class FirebaseModule implements IInjectorModule {
    constructor() {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("userService", FirebaseUserService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);

        injector.bindSingletonFactory<IObjectStorage>("objectStorage", (ctx: IInjector) => {
            const firebaseService = ctx.resolve<FirebaseService>("firebaseService");
            const objectStorage = new FirebaseObjectStorage(firebaseService);
            const offlineObjectStorage = ctx.resolve<OfflineObjectStorage>("offlineObjectStorage");

            offlineObjectStorage.registerUnderlyingStorage(objectStorage);

            return offlineObjectStorage;
        });
    }
}
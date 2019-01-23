import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./firebaseObjectStorage.admin";
import { FirebaseBlobStorage } from "./firebaseBlobStorage.admin";
import { FirebaseService } from "./firebaseService.admin";


export class FirebaseAdminModule implements IInjectorModule {
    constructor() {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);
        injector.bindSingleton("objectStorage", FirebaseObjectStorage);
    }
}
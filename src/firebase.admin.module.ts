import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./firebaseObjectStorage.admin";
import { FirebaseBlobStorage } from "./firebaseBlobStorage.admin";
import { FirebaseService } from "./services/firebaseService.admin";


export class FirebaseModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);
        injector.bindSingleton("objectStorage", FirebaseObjectStorage);
    }
}
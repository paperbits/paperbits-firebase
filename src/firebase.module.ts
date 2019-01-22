import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./firebaseObjectStorage";
import { FirebaseBlobStorage } from "./firebaseBlobStorage";
import { FirebaseService } from "./firebaseService";
import { FirebaseUserService } from "./firebaseUserService";


export class FirebaseModule implements IInjectorModule {
    constructor() {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("userService", FirebaseUserService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);
        injector.bindSingleton("objectStorage", FirebaseObjectStorage);
    }
}
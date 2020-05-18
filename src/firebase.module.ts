import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./persistence/firebaseObjectStorage";
import { FirebaseBlobStorage } from "./persistence/firebaseBlobStorage";
import { FirebaseService } from "./services/firebaseService";
import { FirebaseUserService } from "./services/firebaseUserService";


export class FirebaseModule implements IInjectorModule {
    constructor() {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("userService", FirebaseUserService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);
        injector.bindSingleton("objectStorage", FirebaseObjectStorage);
        injector.bindSingletonFactory("customFirebaseAuthService",
            (injector: IInjector) => {
                try {
                    return injector.resolve("customFirebaseAuthServiceFactory");
                }
                catch {
                    return undefined;
                }
            });
    }
}
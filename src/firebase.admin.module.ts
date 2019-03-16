import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseObjectStorage } from "./persistence/firebaseObjectStorage.admin";
import { FirebaseBlobStorage } from "./persistence/firebaseBlobStorage.admin";
import { FirebaseService } from "./services/firebaseService.admin";
import { CustomCredentialProvider } from "./services/customCredentialProvider";


export class FirebaseModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseService", FirebaseService);
        injector.bindSingleton("blobStorage", FirebaseBlobStorage);
        injector.bindSingleton("objectStorage", FirebaseObjectStorage);
        injector.bindSingleton("customCredentialsProvider", CustomCredentialProvider);
        injector.bindSingletonFactory("customFirebaseAuthService", 
            (injector: IInjector) => {
                try {
                    return injector.resolve("customFirebaseAuthServiceFactory")
                } catch {
                    return undefined
                }
            });
    }
}
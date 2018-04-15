import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { FirebaseAdminObjectStorage } from "./firebaseAdminObjectStorage";
import { FirebaseAdminBlobStorage } from "./firebaseAdminBlobStorage";
import { FirebaseAdminService } from "./firebaseAdminService";


export class FirebaseAdminModule implements IInjectorModule {
    constructor() {
        this.register = this.register.bind(this);
    }

    public register(injector: IInjector): void {
        injector.bindSingleton("firebaseAdminService", FirebaseAdminService);
        injector.bindSingleton("adminBlobStorage", FirebaseAdminBlobStorage);
        injector.bindSingleton("adminObjectStorage", FirebaseAdminObjectStorage);
    }
}
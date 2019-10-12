import { UserService, RoleModel, BuiltInRoles } from "@paperbits/common/user";
import { FirebaseService } from "./firebaseService";


export class FirebaseUserService implements UserService {
    constructor(private readonly firebaseService: FirebaseService) { }

    public async getUserPhotoUrl(): Promise<string> {
        await this.firebaseService.getFirebaseRef();

        if (!this.firebaseService.authenticatedUser) {
            return null;
        }

        return this.firebaseService.authenticatedUser.photoURL;
    }

    public async getUserRoles(): Promise<string[]> {
        await this.firebaseService.getFirebaseRef();

        if (this.firebaseService.authenticatedUser) {
            return [BuiltInRoles.authenticated.key];
        }
        else {
            return [BuiltInRoles.anonymous.key];
        }
    }
}
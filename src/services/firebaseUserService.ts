import { IUserService, RoleModel, BuiltInRoles } from "@paperbits/common/user";
import { FirebaseService } from "./firebaseService";


export class FirebaseUserService implements IUserService {
    constructor(private readonly firebaseService: FirebaseService) { }

    public async getUserPhotoUrl(): Promise<string> {
        await this.firebaseService.getFirebaseRef();

        if (!this.firebaseService.authenticatedUser) {
            return null;
        }

        return this.firebaseService.authenticatedUser.photoURL;
    }

    public async getUserRole(): Promise<RoleModel[]> {
        await this.firebaseService.getFirebaseRef();

        if (this.firebaseService.authenticatedUser) {
            return [BuiltInRoles.authenticated];
        }
        else {
            return [BuiltInRoles.anonymous];
        }
    }

    public async getRoles(): Promise<RoleModel[]> {
        return [BuiltInRoles.anonymous, BuiltInRoles.authenticated];
    }
}
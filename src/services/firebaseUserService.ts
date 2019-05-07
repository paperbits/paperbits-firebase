import { IUserService } from "@paperbits/common/user/IUserService";
import { IUser } from "@paperbits/common/user/IUser";
import { FirebaseService } from "./firebaseService";

export class FirebaseUserService implements IUserService {
    constructor(private firebaseService: FirebaseService) {
    }

    public async signIn(username: string, password: string): Promise<any> {
        throw new Error("Method is not supported.");
    }

    public signOut(): void {
        throw new Error("Method is not supported.");
    }

    public isCurrentUserLoggedIn(): boolean {
        return !!this.firebaseService.authenticatedUser;
    }

    public async getCurrentUser(): Promise<IUser> {
        await this.firebaseService.getFirebaseRef();

        if (!this.firebaseService.authenticatedUser) {
            return null;
        }

        return { 
            id: this.firebaseService.authenticatedUser.uid,
            displayName: this.firebaseService.authenticatedUser.displayName,
            email: this.firebaseService.authenticatedUser.email,
            claims: [],
            photoUrl: this.firebaseService.authenticatedUser.photoURL 
        };
    }
}
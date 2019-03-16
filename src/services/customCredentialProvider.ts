import * as admin from "firebase-admin";
import { ICustomAuthenticationService } from "./ICustomAuthenticationService";

export class CustomCredentialProvider implements admin.credential.Credential {
    constructor(
        private customFirebaseAuthService: ICustomAuthenticationService) {
        
    }
    
    getAccessToken(): Promise<admin.GoogleOAuthAccessToken> {
        return this.customFirebaseAuthService.acquireFirebaseCustomAccessToken();
    }
}
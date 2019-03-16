import * as admin from "firebase-admin";

export interface ICustomAuthenticationService {
    acquireFirebaseCustomAccessToken(): Promise<admin.GoogleOAuthAccessToken>
} 
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ICustomAuthenticationService } from "./ICustomAuthenticationService";

export interface BasicFirebaseAuth {
    email: string;
    password: string;
}

export interface GithubFirebaseAuth {
    scopes: string[];
}

export interface GoogleFirebaseAuth {
    scopes: string[];
}

export interface FirebaseAuth {
    github: GithubFirebaseAuth;
    google: GoogleFirebaseAuth;
    basic: BasicFirebaseAuth;
    serviceAccount: any;
    custom: boolean;
}

export interface FirebaseSettings {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    rootKey: string;
    storageBasePath: string;
    auth: FirebaseAuth;
}

export class FirebaseService {
    private rootKey: string;
    private initializationPromise: Promise<any>;
    private authenticationPromise: Promise<any>;

    public firebaseApp: firebase.app.App;
    public authenticatedUser: firebase.User;

    constructor(
        private settingsProvider: ISettingsProvider,
        private customFirebaseAuthService: ICustomAuthenticationService) {
    }

    private async applyConfiguration(firebaseSettings: FirebaseSettings): Promise<void> {
        const appName = firebaseSettings.rootKey;
        this.firebaseApp = firebase.initializeApp(firebaseSettings, appName); // This can be called only once
    }

    private async trySignIn(auth: FirebaseAuth): Promise<void> {
        if (!auth) {
            console.info("Firebase: Signing-in anonymously...");
            await this.firebaseApp.auth().signInAnonymously();
            return;
        }

        if (auth.github) {
            console.info("Firebase: Signing-in with Github...");
            const provider = new firebase.auth.GithubAuthProvider();

            if (auth.github.scopes) {
                auth.github.scopes.forEach(scope => {
                    provider.addScope(scope);
                });
            }

            const redirectResult = await firebase.auth().getRedirectResult();

            if (!redirectResult.credential) {
                await this.firebaseApp.auth().signInWithRedirect(provider);
                return;
            }
            return;
        }

        if (auth.google) {
            console.info("Firebase: Signing-in with Google...");
            const provider = new firebase.auth.GoogleAuthProvider();

            if (auth.google.scopes) {
                auth.google.scopes.forEach(scope => {
                    provider.addScope(scope);
                });
            }

            const redirectResult = await firebase.auth().getRedirectResult();

            if (!redirectResult.credential) {
                await this.firebaseApp.auth().signInWithRedirect(provider);
                return;
            }
            return;
        }

        if (auth.basic) {
            console.info("Firebase: Signing-in with email and password...");
            await this.firebaseApp.auth().signInWithEmailAndPassword(auth.basic.email, auth.basic.password);
            return;
        }

        if (auth.custom) {
            console.info("Firebase: Signing-in with custom access token...");
            const customAccessToken = await this.customFirebaseAuthService.acquireFirebaseCustomAccessToken();

            await this.firebaseApp.auth().signInWithCustomToken(customAccessToken.access_token).catch((error) => {
                console.error(error);
            });

            return;
        }
    }

    private async authenticate(auth: FirebaseAuth): Promise<void> {
        if (this.authenticationPromise) {
            return this.authenticationPromise;
        }

        this.authenticationPromise = new Promise<void>((resolve) => {
            firebase.auth(this.firebaseApp).onAuthStateChanged(async (user: firebase.User) => {
                if (user) {
                    this.authenticatedUser = user;
                    console.info(`Logged in as ${user.displayName || user.email || user.isAnonymous ? "anonymous" : "custom"}.`);
                    resolve();
                    return;
                }

                await this.trySignIn(auth);
                resolve();
            });
        });

        return this.authenticationPromise;
    }

    public async getFirebaseRef(): Promise<firebase.app.App> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise(async (resolve, reject) => {
            const firebaseSettings = await this.settingsProvider.getSetting<FirebaseSettings>("firebase");
            this.rootKey = firebaseSettings.rootKey || "/";

            await this.applyConfiguration(firebaseSettings);
            await this.authenticate(firebaseSettings.auth);

            resolve(this.firebaseApp);
        });

        return this.initializationPromise;
    }

    public async getDatabaseRef(): Promise<firebase.database.Reference> {
        const firebaseRef = await this.getFirebaseRef();
        const databaseRef = await firebaseRef.database().ref(this.rootKey);

        return databaseRef;
    }

    public async getStorageRef(): Promise<firebase.storage.Reference> {
        const firebaseRef = await this.getFirebaseRef();
        const storageRef = firebaseRef.storage().ref(this.rootKey);

        return storageRef;
    }
}
import * as admin from "firebase-admin";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { CustomCredentialProvider } from "./customCredentialProvider";
import { FirebaseAuth } from "./firebaseService";


export class FirebaseService {
    public rootKey: string;
    public storageBasePath: string;
    private initializationPromise: Promise<any>;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly customCredentialsProvider: CustomCredentialProvider) { }

    private async applyConfiguration(firebaseSettings: Object): Promise<any> {
        this.rootKey = firebaseSettings["rootKey"];
        this.storageBasePath = firebaseSettings["storageBasePath"];

        const auth: FirebaseAuth = firebaseSettings["auth"];

        const credential = auth.custom === true ? this.customCredentialsProvider :  admin.credential.cert(auth.serviceAccount)

        admin.initializeApp({
            credential,
            databaseURL: firebaseSettings["databaseURL"],
            storageBucket: firebaseSettings["storageBucket"]
        });
    }

    public async getDatabaseRef(): Promise<admin.database.Reference> {
        await this.getFirebaseRef();
        const databaseRef = await admin.database().ref(this.rootKey);

        return databaseRef;
    }

    public async getStorageRef(): Promise<any> {
        await this.getFirebaseRef();

        const bucket = admin.storage().bucket();

        return bucket;
    }

    private async getFirebaseRef(): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise(async (resolve, reject) => {
            const firebaseSettings = await this.settingsProvider.getSetting<any>("firebase");
            this.rootKey = this.rootKey = firebaseSettings.rootKey || "/";

            await this.applyConfiguration(firebaseSettings);

            resolve();
        });

        return this.initializationPromise;
    }
}
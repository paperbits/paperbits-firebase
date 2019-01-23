import * as admin from "firebase-admin";
import { ISettingsProvider } from "@paperbits/common/configuration";


export class FirebaseService {
    private rootKey: string;
    private initializationPromise: Promise<any>;

    constructor(private readonly settingsProvider: ISettingsProvider) { }

    private async applyConfiguration(firebaseSettings: Object): Promise<any> {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseSettings["auth"]["serviceAccount"]),
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
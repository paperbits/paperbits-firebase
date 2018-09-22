import * as admin from "firebase-admin";
import { ISettingsProvider } from "@paperbits/common/configuration";


export class FirebaseAdminService {
    private tenantRoot: string;
    private initPromise: Promise<any>;

    constructor(private readonly settingsProvider: ISettingsProvider) { }

    private async applyConfiguration(tenantId: string, firebaseSettings: Object): Promise<any> {
        this.tenantRoot = `tenants/${tenantId}`;

        admin.initializeApp({
            credential: admin.credential.cert(firebaseSettings["auth"]["serviceAccount"]),
            databaseURL: firebaseSettings["databaseURL"],
            storageBucket: firebaseSettings["storageBucket"]
        });
    }

    public async getDatabaseRef(): Promise<admin.database.Reference> {
        await this.initFirebase();
        const databaseRef = await admin.database().ref(this.tenantRoot);

        return databaseRef;
    }

    public async getStorageRef(): Promise<any> {
        await this.initFirebase();

        const bucket = admin.storage().bucket();

        return bucket;
    }

    private async initFirebase(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve, reject) => {
            const tenantId = <string>await this.settingsProvider.getSetting("tenantId");
            const firebaseSettings = await this.settingsProvider.getSetting("firebase");

            await this.applyConfiguration(tenantId, firebaseSettings);

            resolve();
        });

        return this.initPromise;
    }
}
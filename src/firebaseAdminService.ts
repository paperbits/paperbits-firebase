import * as admin from "firebase-admin";
import { ISettingsProvider } from '@paperbits/common/configuration/ISettingsProvider';
import { IFirebaseAdminService } from "./IFirebaseAdminService";
import { Bucket } from "@google-cloud/storage";

export class FirebaseAdminService implements IFirebaseAdminService {
    private readonly settingsProvider: ISettingsProvider;

    private tenantId: string;
    private tenantRoot: string;
    private initPromise: Promise<any>;
    private authenticationPromise: Promise<any>;

    constructor(settingsProvider: ISettingsProvider) {
        this.settingsProvider = settingsProvider;
    }

    private async applyConfiguration(tenantId: string, firebaseAdminAppOptions: admin.AppOptions, appName?: string): Promise<any> {
        this.tenantRoot = `tenants/${tenantId}`;

        // {
        //     credential: admin.credential.cert(serviceAccount),
        //     databaseURL: "https://databaseName.firebaseio.com",
        //     storageBucket: tenantId,
        //     projectId: projectId
        //   })
        
        admin.initializeApp(firebaseAdminAppOptions, appName); // This can be called only once
    }

    public async getDatabaseRef(): Promise<admin.database.Reference> {
        await this.initFirebase();
        let databaseRef = await admin.database().ref(this.tenantRoot);

        return databaseRef;
    }

    public async getBucket(): Promise<Bucket> {
        await this.initFirebase();
        let bucket = admin.storage().bucket();

        return bucket;
    }
    
    private async initFirebase(): Promise<firebase.app.App> {
        if (this.initPromise) {
            return this.initPromise
        }

        this.initPromise = new Promise(async (resolve, reject) => {
            let tenantId = <string> await this.settingsProvider.getSetting("tenantId");
            let firebaseSettings = await this.settingsProvider.getSetting("firebase");
            await this.applyConfiguration(tenantId, firebaseSettings);
        });

        return this.initPromise;
    }
}
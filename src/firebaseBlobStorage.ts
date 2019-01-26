import { ProgressPromise } from "@paperbits/common";
import { IBlobStorage } from "@paperbits/common/persistence";
import { FirebaseService } from "./firebaseService";


export class FirebaseBlobStorage implements IBlobStorage {
    private readonly firebaseService: FirebaseService;

    constructor(firebaseService: FirebaseService) {
        this.firebaseService = firebaseService;
    }

    public uploadBlob(name: string, content: Uint8Array, contentType?: string): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, progress) => {
            const storageRef = await this.firebaseService.getStorageRef();
            const metaData = contentType ? { contentType: contentType } : null;
            const uploadTask = storageRef.child(name).put(content, metaData);

            uploadTask.on("state_changed",
                (snapshot: any) => {
                    progress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                },
                (error: Error) => {
                    console.error(error);
                    reject();
                },
                resolve);
        });
    }

    public async getDownloadUrl(blobKey: string): Promise<string> {
        if (!blobKey) {
            throw new Error(`Parameter "blobKey" not specified.`);
        }

        const storageRef = await this.firebaseService.getStorageRef();

        try {
            const downloadUrl = await storageRef.child(blobKey).getDownloadURL();
            return downloadUrl;
        }
        catch (error) {
            if (error && error.code_ === "storage/object-not-found") {
                return null;
            }
            throw error;
        }
    }

    public async deleteBlob(filename: string): Promise<void> {
        const storageRef = await this.firebaseService.getStorageRef();

        await storageRef.child(filename).delete();
    }
}
import { ProgressPromise } from "@paperbits/common";
import { IBlobStorage } from "@paperbits/common/persistence";
import { FirebaseService } from "./firebaseService.admin";


export class FirebaseBlobStorage implements IBlobStorage {
    constructor(private readonly firebaseService: FirebaseService) { }

    public async uploadBlob(name: string, content: Uint8Array, contentType?: string): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, progress) => {
            const storageRef = await this.firebaseService.getStorageRef();
            const metaData = contentType ? { contentType: contentType } : null;

            progress(0);
            
            await storageRef.file(name).save(new Buffer(content), {
                metadata: {
                    contentType: contentType
                }
            });
            progress(100);
        });
    }

    public async getDownloadUrl(blobKey: string): Promise<string> {
        const storageRef = await this.firebaseService.getStorageRef();

        debugger;
        const downloadUrl = await storageRef.file(blobKey).getSignedUrl();

        return downloadUrl["0"];
    }

    public async deleteBlob(filename: string): Promise<void> {
        const storageRef = await this.firebaseService.getStorageRef();

        await storageRef.file(filename).delete();
    }
}
import { IBlobStorage } from "@paperbits/common/persistence";
import { FirebaseService } from "../services/firebaseService.admin";


export class FirebaseBlobStorage implements IBlobStorage {
    constructor(private readonly firebaseService: FirebaseService) { }

    public async uploadBlob(name: string, content: Uint8Array, contentType?: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const storageRef = await this.firebaseService.getStorageRef();

            await storageRef.file(name).save(Buffer.from(content.buffer), {
                metadata: {
                    contentType: contentType
                }
            });
        });
    }

    public async downloadBlob?(blobKey: string): Promise<Uint8Array> {
        // TODO: Enable proper download
        // const storageRef = await this.firebaseService.getStorageRef();
        // const file = storageRef.file(blobKey);

        return null;
    }

    public async getDownloadUrl(blobKey: string): Promise<string> {
        const storageRef = await this.firebaseService.getStorageRef();
        const file = storageRef.file(`${this.firebaseService.storageBasePath}/${blobKey}`);
        const downloadUrls = await file.getSignedUrl({ action: "read", expires: "01-01-2100" });

        if (downloadUrls.length > 0) {
            return downloadUrls[0];
        }

        return null;
    }

    public async deleteBlob(filename: string): Promise<void> {
        const storageRef = await this.firebaseService.getStorageRef();

        await storageRef.file(filename).delete();
    }
}
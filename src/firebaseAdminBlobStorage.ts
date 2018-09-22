import { ProgressPromise } from "@paperbits/common";
import { IBlobStorage } from "@paperbits/common/persistence";
import { FirebaseAdminService } from "./firebaseAdminService";


export class FirebaseAdminBlobStorage implements IBlobStorage {
    private readonly firebaseAdminService: FirebaseAdminService;

    constructor(firebaseAdminService: FirebaseAdminService) {
        this.firebaseAdminService = firebaseAdminService;
    }

    public async uploadBlob(name: string, content: Uint8Array, contentType?: string): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, progress) => {
            const storageRef = await this.firebaseAdminService.getStorageRef();
            const metaData = contentType ? {contentType: contentType} : null;
            
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
        const storageRef = await this.firebaseAdminService.getStorageRef();

        debugger;
        const downloadUrl = await storageRef.file(blobKey).getSignedUrl();

        return downloadUrl["0"];
    }

    public async deleteBlob(filename: string): Promise<void> {
        const storageRef = await this.firebaseAdminService.getStorageRef();

        await storageRef.file(filename).delete();
    }
}
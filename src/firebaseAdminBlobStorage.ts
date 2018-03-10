import { ProgressPromise } from '@paperbits/common/progressPromise';
import { IBlobStorage } from '@paperbits/common/persistence/IBlobStorage';
import { IFirebaseAdminService } from './IFirebaseAdminService';

export class FirebaseAdminBlobStorage implements IBlobStorage {
    private readonly firebaseAdminService: IFirebaseAdminService;

    constructor(firebaseAdminService: IFirebaseAdminService) {
        this.firebaseAdminService = firebaseAdminService;
    }

    public async uploadBlob(name: string, content: Uint8Array, contentType?:string): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, progress) => {
            let storageRef = await this.firebaseAdminService.getBucket();
            let metaData = contentType ? {contentType: contentType} : null;
            
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
        const storageRef = await this.firebaseAdminService.getBucket();
        const downloadUrl = await storageRef.file(blobKey).getSignedUrl();

        return downloadUrl["0"];
    }

    public async deleteBlob(filename: string): Promise<void> {
        let storageRef = await this.firebaseAdminService.getBucket();

        await storageRef.file(filename).delete();
    }
}
import { ProgressPromise } from '@paperbits/common/progressPromise';
import { IBlobStorage } from '@paperbits/common/persistence/IBlobStorage';
import { FirebaseService } from './firebaseService';

export class FirebaseBlobStorage implements IBlobStorage {
    private readonly firebaseService: FirebaseService;

    constructor(firebaseService: FirebaseService) {
        this.firebaseService = firebaseService;
    }

    public uploadBlob(name: string, content: Uint8Array, contentType?:string): ProgressPromise<void> {
        return new ProgressPromise<void>(async (resolve, reject, progress) => {
            let storageRef = await this.firebaseService.getStorageRef();
            let metaData = contentType ? {contentType: contentType} : null;
            let uploadTask = storageRef.child(name).put(content, metaData);

            uploadTask.on("state_changed",
                (snapshot: any) => {
                    progress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                },
                (error: Error) => {
                    console.error(error);
                    reject()
                },
                resolve);
        });
    }

    public async getDownloadUrl(blobKey: string): Promise<string> {
        const storageRef = await this.firebaseService.getStorageRef();
        const downloadUrl = await storageRef.child(blobKey).getDownloadURL();

        return downloadUrl;
    }

    public async deleteBlob(filename: string): Promise<void> {
        let storageRef = await this.firebaseService.getStorageRef();

        await storageRef.child(filename).delete();
    }
}
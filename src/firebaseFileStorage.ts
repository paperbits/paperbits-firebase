module Paperbits.Firebase {
    export class FirebaseFileStorage implements Paperbits.Persistence.IFileStorage {
        private firebaseService: FirebaseService;

        constructor(firebaseService: FirebaseService) {
            this.firebaseService = firebaseService;
        }

        public uploadFile(name: string, file: Blob): ProgressPromise<void> {
            return new ProgressPromise<void>((resolve, reject, progress) => {
                this.firebaseService.getStorageRef().then((storageRef) => {
                    var uploadTask = storageRef
                        .child(name)
                        .put(file);

                    uploadTask.on("state_changed",
                        (snapshot: FirebaseUploadSnapshot) => {
                            progress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        },
                        (error: FirebaseUploadError) => {
                            console.error(error);
                            reject()
                        },
                        resolve);
                });
            });
        }

        public getDownloadUrl(filename: string): Promise<string> {
            return this.firebaseService.getStorageRef().then((storageRef) => {
                return storageRef.child(filename).getDownloadURL();
            });
        }

        public deleteFile(filename: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                this.firebaseService.getStorageRef().then((storageRef) => {
                    storageRef
                        .child(filename)
                        .delete().then(() => {
                            resolve();
                        });
                });
            });
        }
    }
}

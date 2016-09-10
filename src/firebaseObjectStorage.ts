module Paperbits.Firebase {
    import IObjectStorage = Paperbits.Persistence.IObjectStorage;
    import FirebaseService = Paperbits.Firebase.FirebaseService;

    export class FirebaseObjectStorage implements IObjectStorage {
        private firebaseService: FirebaseService;

        constructor(firebaseService: FirebaseService) {
            this.firebaseService = firebaseService;
        }

        public addObject<T>(path: string, dataObject: T): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                this.firebaseService.getDatabaseRef().then((databaseRef) => {
                    if (path) {
                        databaseRef.child(path).set(dataObject, (error) => {
                            if (error) {
                                reject([`Could not add object '${path}'. Error: ${error}.`]);
                            } else {
                                resolve();
                            }
                        });
                    }
                    else {
                        databaseRef.update(dataObject, (error) => {
                            if (error) {
                                reject([`Could not add object '${path}'. Error: ${error}.`]);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }

        public getObject<T>(path: string): Promise<T> {
            return new Promise<T>((resolve, reject) => {
                this.firebaseService.getDatabaseRef().then((databaseRef) => {
                    databaseRef.child(path).once("value",
                        (snapshot) => {
                            resolve(snapshot.val());
                        }, (error) => {
                            reject([`Could not retrieve object '${path}'. Error: ${error}.`]);
                        });
                });
            });
        }

        public deleteObject(path: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                this.firebaseService.getDatabaseRef().then((databaseRef) => {
                    databaseRef.child(path).remove((error: string) => {
                        if (error) {
                            reject([`Could not delete object '${path}'. Error: ${error}.`]);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        }

        public updateObject<T>(path: string, dataObject: T): Promise<T> {
            return new Promise<T>((resolve, reject) => {
                this.firebaseService.getDatabaseRef().then((databaseRef) => {
                    databaseRef.child(path).update(dataObject,
                        error => {
                            if (error) {
                                reject([`Could not update object '${path}'. Error: ${error}`]);
                            } else {
                                resolve(dataObject);
                            }
                        });
                });
            });
        }

        public searchObjects<T>(path: string, propertyNames?: Array<string>, searchValue?: string, startAtSearch?: boolean, skipLoadObject?: boolean): Promise<Array<T>> {
            return new Promise<Array<T>>((resolve, reject) => {
                this.firebaseService.getDatabaseRef().then((databaseRef) => {
                    if (propertyNames && propertyNames.length && searchValue) {
                        var searchTasks = propertyNames.map((propertyName) => {
                            let query: FirebaseQuery = startAtSearch
                                ? databaseRef.child(path).orderByChild(propertyName).startAt(searchValue)
                                : databaseRef.child(path).orderByChild(propertyName).equalTo(searchValue);

                            return query.once("value").then((result) => this.collectResult(result));
                        });

                        Promise.all(searchTasks).then(
                            (searchTaskResults) => {
                                resolve(_.flatten(searchTaskResults));
                            },
                            (error) => {
                                return [`Could not search object '${path}'. Error: ${error}.`];
                            });
                    }
                    else {
                        //return all objects

                        databaseRef.child(path).once("value",
                            (objectData) => {
                                let result = this.collectResult(objectData);
                                resolve(result);
                            },
                            (error) => {
                                reject([`Could not search object '${path}'. Error: ${error}.`]);
                            }
                        );
                    }
                });
            });
        }

        private collectResult(objectData) {
            let result = [];

            if (objectData.hasChildren()) {
                let items = objectData.val();

                if (items) {
                    if (_.isArray(items)) {
                        items.map((item) => result.push(item));
                    } else {
                        _.mapObject(items, (item) => {
                            result.push(item)
                        });
                    }
                }
            }
            return result;
        };
    }
}
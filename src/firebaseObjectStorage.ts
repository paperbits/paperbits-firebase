import * as _ from "lodash";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage } from "@paperbits/common/persistence";
import { FirebaseService } from "./firebaseService";


export class FirebaseObjectStorage implements IObjectStorage {
    constructor(private readonly firebaseService: FirebaseService) { }

    private normalizeDataObject<T>(dataObject: T): void {
        if (dataObject instanceof Object) {
            Object.keys(dataObject).forEach(key => {
                const child = dataObject[key];

                if (child instanceof Object) {
                    this.normalizeDataObject(child);
                }
                else if (child === undefined) {
                    dataObject[key] = null;
                }
            });
        }
    }

    public async addObject<T>(path: string, dataObject: T): Promise<void> {
        this.normalizeDataObject(dataObject);

        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();

            if (path) {
                await databaseRef.child(path).set(dataObject);
            }
            else {
                await databaseRef.update(dataObject);
            }
        }
        catch (error) {
            throw new Error(`Could not add object '${path}'. Error: ${error}.`);
        }
    }

    public async getObject<T>(path: string): Promise<T> {
        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            const snapshot = await databaseRef.child(path).once("value");

            return snapshot.val();
        }
        catch (error) {
            throw new Error(`Could not retrieve object '${path}'. Error: ${error}.`);
        }
    }

    public async deleteObject(path: string): Promise<void> {
        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            databaseRef.child(path).remove();
        }
        catch (error) {
            throw new Error(`Could not delete object '${path}'. Error: ${error}.`);
        }
    }

    public async updateObject<T>(path: string, dataObject: T): Promise<void> {
        this.normalizeDataObject(dataObject);

        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            return await databaseRef.child(path).update(dataObject);
        }
        catch (error) {
            throw new Error(`Could not update object '${path}'. Error: ${error}`);
        }
    }

    public async searchObjects<T>(path: string, propertyNames?: string[], searchValue?: string): Promise<T> {
        const searchResultObject: any = {};

        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            const pathRef = databaseRef.child(path);

            if (propertyNames && propertyNames.length && searchValue) {
                const searchPromises = propertyNames.map(async (propertyName) => {
                    const query = pathRef.orderByChild(propertyName).equalTo(searchValue);
                    const objectData = await query.once("value");
                    return objectData.val();
                });

                const searchTaskResults = await Promise.all(searchPromises);

                searchTaskResults.forEach(x => {
                    Objects.mergeDeepAt(path, searchResultObject, x);
                });
            }
            else {
                // return all objects
                const objectData = await pathRef.once("value");
                Objects.mergeDeepAt(path, searchResultObject, objectData.val());
            }

            const resultObject = Objects.getObjectAt(path, searchResultObject);

            return <T>(resultObject || {});
        }
        catch (error) {
            throw new Error(`Could not search object '${path}'. Error: ${error}.`);
        }
    }

    public async saveChanges(delta: Object): Promise<void> {
        console.log("Saving changes...");

        const saveTasks = [];
        const keys = [];

        Object.keys(delta).map(key => {
            const firstLevelObject = delta[key];

            Object.keys(firstLevelObject).forEach(subkey => {
                keys.push(`${key}/${subkey}`);
            });
        });

        keys.forEach(key => {
            const changeObject = Objects.getObjectAt(key, delta);

            if (changeObject) {
                saveTasks.push(this.updateObject(key, changeObject));
            }
            else {
                saveTasks.push(this.deleteObject(key));
            }
        });

        await Promise.all(saveTasks);
    }
}
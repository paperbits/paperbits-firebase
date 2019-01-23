import * as _ from "lodash";
import { IObjectStorage } from "@paperbits/common/persistence";
import { FirebaseService } from "./firebaseService.admin";


export class FirebaseObjectStorage implements IObjectStorage {
    private readonly firebaseService: FirebaseService;

    constructor(firebaseService: FirebaseService) {
        this.firebaseService = firebaseService;
    }

    public async addObject<T>(path: string, dataObject: T): Promise<void> {
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
        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            return await databaseRef.child(path).update(dataObject);
        }
        catch (error) {
            throw new Error(`Could not update object '${path}'. Error: ${error}`);
        }
    }

    public async searchObjects<T>(path: string, propertyNames?: string[], searchValue?: string, startAtSearch?: boolean): Promise<T[]> {
        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            const pathRef = databaseRef.child(path);

            if (propertyNames && propertyNames.length && searchValue) {
                const searchPromises = propertyNames.map(async (propertyName) => {
                    const query = startAtSearch
                        ? pathRef.orderByChild(propertyName).startAt(searchValue)
                        : pathRef.orderByChild(propertyName).equalTo(searchValue);

                    const result = await query.once("value");
                    return this.collectResult(result);
                });

                const searchTaskResults = await Promise.all(searchPromises);
                return _.flatten(searchTaskResults);
            }
            else {
                // return all objects
                const objectData = await pathRef.once("value");
                const result = this.collectResult(objectData);
                return result;
            }
        }
        catch (error) {
            throw new Error(`Could not search object '${path}'. Error: ${error}.`);
        }
    }

    private collectResult(objectData): any[] {
        const result = [];

        if (objectData.hasChildren()) {
            const items = objectData.val();

            if (items) {
                if (Array.isArray(items)) {
                    items.map((item) => result.push(item));
                }
                else {
                    _.map(items, (item) => result.push(item));
                }
            }
        }
        return result;
    }
}
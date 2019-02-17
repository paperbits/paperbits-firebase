import * as _ from "lodash";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage, Query, Operator } from "@paperbits/common/persistence";
import { FirebaseService } from "../services/firebaseService.admin";


export class FirebaseObjectStorage implements IObjectStorage {
    constructor(private readonly firebaseService: FirebaseService) { }

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

    public async searchObjects<T>(path: string, query: Query<T>): Promise<T> {
        const searchResultObject: any = {};

        try {
            const databaseRef = await this.firebaseService.getDatabaseRef();
            const pathRef = databaseRef.child(path);

            if (query && query.filters.length > 0) {
                if (query.filters.length > 1) {
                    console.warn("Firebase Realtime Database doesn't support filtering by more than 1 property.");
                }

                const filter = query.filters[0];
                let firebaseQuery = pathRef.orderByChild(filter.left);

                switch (filter.operator) {
                    case Operator.contains:
                        firebaseQuery = firebaseQuery.startAt(filter.right);
                        break;
                    case Operator.equals:
                        firebaseQuery = firebaseQuery.equalTo(filter.right);
                        break;

                    default:
                        throw new Error("Cannot translate operator into Firebase Realtime Database query.");
                }

                const searchResultObject = await firebaseQuery.once("value");
                return searchResultObject.val();

                Objects.mergeDeepAt(path, searchResultObject, searchResultObject);
            }
            else {
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
}
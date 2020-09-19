import { Page } from "@paperbits/common/persistence";
import { collectionPageSize } from "./contants";

export class FirebaseCollectionPage<T> implements Page<T> {
    constructor(
        public readonly value: T[],
        private readonly collection: any,
        private readonly skip: number,
        private readonly take: number
    ) {
        if (skip + take > this.collection.length) {
            this.takeNext = null;
        }
    }

    public async takePrev?(): Promise<Page<T>> {
        throw new Error("Not implemented");
    }

    public async takeNext?(): Promise<Page<T>> {
        const value = this.collection.slice(this.skip, this.skip + collectionPageSize);
        const skipNext = this.skip + collectionPageSize;
        const takeNext = collectionPageSize || this.take;

        const nextPage = new FirebaseCollectionPage<T>(value, this.collection, skipNext, takeNext);


        return nextPage;
    }
}

import * as admin from "firebase-admin";
import { Bucket } from "@google-cloud/storage";

export interface IFirebaseAdminService{
    getDatabaseRef(): Promise<admin.database.Reference>;
    getBucket(): Promise<Bucket>;
}
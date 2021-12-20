import * as admin from "firebase-admin";


const databaseURL = "";
const serviceAccount: any = {};

describe("FirebaseObjectStorage", async () => {
    it("Create container", async () => {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: databaseURL
        });

        const ref = admin.database().ref();
        const firebaseQuery = ref.child("pages");
        const result = await firebaseQuery
            .orderByChild("locales/en-us/title")
            // .limitToFirst(1)
            .once("value");

        console.log(JSON.stringify(result.val(), null, 4));
    });
});
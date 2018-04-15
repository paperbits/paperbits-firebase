import { IEventManager } from "@paperbits/common/events";
import { FirebaseService } from './firebaseService';


export class FirebaseConnection {
    private readonly firebaseService: FirebaseService;
    private readonly eventManager: IEventManager;

    constructor(firebaseService: FirebaseService, eventManager: IEventManager) {
        this.firebaseService = firebaseService;
        this.eventManager = eventManager;

        const connectedRef = firebase.database().ref(".info/connected");

        connectedRef.on("value", (snapshot) => {
            if (snapshot.val() === true) {
                this.eventManager.dispatchEvent("onOnlineStatusChanged", "online");
            }
            else {
                this.eventManager.dispatchEvent("onOnlineStatusChanged", "offline");
            }
        });
    }
}
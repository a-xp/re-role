import firebase from "firebase";
import "firebase/firestore";
import firebaseCred from "../cred";

firebase.initializeApp({
    apiKey: firebaseCred.apiKey,
    authDomain: firebaseCred.authDomain,
    projectId: firebaseCred.projectId
});

const db = firebase.firestore();

export default db;
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPhURWgl4SpQBGosU1foFzzF7wRFOnGGI",
  authDomain: "incrementalrnggame-50554.firebaseapp.com",
  projectId: "incrementalrnggame-50554",
  storageBucket: "incrementalrnggame-50554.appspot.com",
  messagingSenderId: "949571648099",
  appId: "1:949571648099:web:1bed76509faa967755d656",
  measurementId: "G-LNCLNPRSPY"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjZBoiZ1vgnvixt6U_KqcQXlyEr-2ofKU",
  authDomain: "study-with-power-f6914.firebaseapp.com",
  databaseURL:
    "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "study-with-power-f6914",
  storageBucket: "study-with-power-f6914.firebasestorage.app",
  messagingSenderId: "26217270395",
  appId: "1:26217270395:web:322ab200fc64110fda26de",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);

export { app, auth, googleProvider, db };

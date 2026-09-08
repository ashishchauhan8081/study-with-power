import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjZBoiZ1vgnvixt6U_KqcQXlyEr-2ofKU",
  authDomain: "study-with-power-f6914.firebaseapp.com",
  projectId: "study-with-power-f6914",
  storageBucket: "study-with-power-f6914.firebasestorage.app",
  messagingSenderId: "26217270395",
  appId: "1:26217270395:web:322ab200fc64110fda26de"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;

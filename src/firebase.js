import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getDatabase,
  ref,
  set,
  get,
  remove,
} from "firebase/database";

// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// =====================================
// INITIALIZE FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);

// =====================================
// AUTH
// =====================================

export const auth = getAuth(app);

export const googleProvider =
  new GoogleAuthProvider();

// =====================================
// REALTIME DATABASE
// =====================================

export const db = getDatabase(app);

// =====================================
// GENERATE 6 DIGIT OTP
// =====================================

export const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// =====================================
// SAVE OTP
// =====================================

export const saveOTP = async (
  mobile,
  otp
) => {
  const expiresAt =
    Date.now() + 5 * 60 * 1000;

  await set(
    ref(db, `otp/${mobile}`),
    {
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
    }
  );
};

// =====================================
// GET OTP
// =====================================

export const getOTP = async (mobile) => {
  const snapshot = await get(
    ref(db, `otp/${mobile}`)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val();
};

// =====================================
// DELETE OTP
// =====================================

export const deleteOTP = async (
  mobile
) => {
  await remove(
    ref(db, `otp/${mobile}`)
  );
};

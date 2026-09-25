import React, { useState } from "react";
import "./UserAuth.css";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  getDatabase,
  ref,
  set,
  get,
} from "firebase/database";

import { getApps, getApp, initializeApp } from "firebase/app";

import firebaseConfig from "../firebase-config.json";


// ======================================================
// FIREBASE
// ======================================================

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      databaseURL:
        firebaseConfig.databaseURL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);


// ======================================================
// MAKE SAFE EMAIL FROM MOBILE
// ======================================================

function mobileToEmail(mobile) {
  const clean = String(mobile)
    .replace(/\D/g, "")
    .replace(/^91/, "");

  return `${clean}@mobile.examtest.local`;
}


// ======================================================
// USER AUTH
// ======================================================

export default function UserAuth({
  onClose,
  onLoginSuccess,
}) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [exam, setExam] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ====================================================
  // RESET MESSAGE
  // ====================================================

  const clearMessages = () => {
    setMessage("");
    setError("");
  };


  // ====================================================
  // REGISTER
  // ====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim()) {
      setError("कृपया अपना नाम डालें।");
      return;
    }

    if (!mobile.trim()) {
      setError("कृपया मोबाइल नंबर डालें।");
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");

    if (
      cleanMobile.length !== 10 &&
      cleanMobile.length !== 12
    ) {
      setError(
        "कृपया सही 10 अंकों का मोबाइल नंबर डालें।"
      );
      return;
    }

    if (!email.trim()) {
      setError("कृपया Email ID डालें।");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password और Confirm Password समान नहीं हैं।"
      );
      return;
    }

    if (!exam) {
      setError(
        "कृपया बताएं कि आप किस परीक्षा की तैयारी कर रहे हैं।"
      );
      return;
    }

    try {
      setLoading(true);

      // Firebase Auth account
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      const firebaseUser = result.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: name.trim(),
      });

      // Save user profile in Realtime Database
      await set(
        ref(
          db,
          `users/${firebaseUser.uid}`
        ),
        {
          uid: firebaseUser.uid,
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim().toLowerCase(),
          exam: exam,
          createdAt: Date.now(),
          role: "user",
          status: "active",
        }
      );

      setMessage(
        "✅ Registration सफल हो गया।"
      );

      if (onLoginSuccess) {
        onLoginSuccess(firebaseUser);
      }

    } catch (err) {
      console.error(
        "Registration Error:",
        err
      );

      if (
        err.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "यह Email पहले से registered है। Login करें।"
        );
      } else if (
        err.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Email ID सही नहीं है।"
        );
      } else if (
        err.code ===
        "auth/weak-password"
      ) {
        setError(
          "Password बहुत कमजोर है। कम से कम 6 characters रखें।"
        );
      } else {
        setError(
          "Registration नहीं हुआ: " +
            err.message
        );
      }
    } finally {
      setLoading(false);
    }
  };


  // ====================================================
  // LOGIN
  // ====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!mobile.trim()) {
      setError(
        "मोबाइल नंबर या Email ID डालें।"
      );
      return;
    }

    if (!password) {
      setError(
        "Password डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      let loginEmail =
        mobile.trim().toLowerCase();

      // If user entered mobile number
      if (
        /^[0-9+\-\s]+$/.test(
          mobile.trim()
        )
      ) {
        const cleanMobile =
          mobile.replace(/\D/g, "");

        const mobileWithout91 =
          cleanMobile.replace(/^91/, "");

        // Search user by mobile
        const usersRef =
          ref(db, "users");

        const snapshot =
          await get(usersRef);

        if (!snapshot.exists()) {
          setError(
            "User account नहीं मिला। पहले Registration करें।"
          );
          return;
        }

        let foundUser = null;

        snapshot.forEach(
          (child) => {
            const data =
              child.val();

            if (
              String(
                data?.mobile || ""
              ).replace(/\D/g, "").replace(/^91/, "") ===
              mobileWithout91
            ) {
              foundUser = data;
            }
          }
        );

        if (!foundUser?.email) {
          setError(
            "इस मोबाइल नंबर से कोई account नहीं मिला।"
          );
          return;
        }

        loginEmail =
          foundUser.email;
      }

      const result =
        await signInWithEmailAndPassword(
          auth,
          loginEmail,
          password
        );

      setMessage(
        "✅ Login सफल हो गया।"
      );

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }

    } catch (err) {
      console.error(
        "Login Error:",
        err
      );

      if (
        err.code ===
          "auth/invalid-credential" ||
        err.code ===
          "auth/wrong-password"
      ) {
        setError(
          "❌ Mobile/Email या Password गलत है।"
        );
      } else if (
        err.code ===
        "auth/user-not-found"
      ) {
        setError(
          "यह account नहीं मिला। पहले Registration करें।"
        );
      } else if (
        err.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Email ID सही नहीं है।"
        );
      } else {
        setError(
          "Login Error: " +
            err.message
        );
      }
    } finally {
      setLoading(false);
    }
  };


  // ====================================================
  // FORGOT PASSWORD
  // ====================================================

  const handleForgotPassword =
    async () => {
      clearMessages();

      const value =
        window.prompt(
          "अपनी registered Email ID डालें:"
        );

      if (!value) {
        return;
      }

      try {
        setLoading(true);

        await sendPasswordResetEmail(
          auth,
          value.trim().toLowerCase()
        );

        setMessage(
          "✅ Password reset link आपके Email पर भेज दिया गया है।"
        );

      } catch (err) {
        console.error(
          "Forgot Password Error:",
          err
        );

        if (
          err.code ===
          "auth/user-not-found"
        ) {
          setError(
            "इस Email से कोई account नहीं मिला।"
          );
        } else {
          setError(
            "Password reset नहीं हुआ: " +
              err.message
          );
        }
      } finally {
        setLoading(false);
      }
    };


  // ====================================================
  // REGISTER PAGE
  // ====================================================

  if (mode === "register") {
    return (
      <div className="user-auth-overlay">
        <div className="user-auth-box">

          <button
            className="user-auth-close"
            onClick={onClose}
          >
            ×
          </button>

          <div className="user-auth-header">
            <div className="user-auth-logo">
              📚
            </div>

            <h1>
              Create Account
            </h1>

            <p>
              Exam Test पर अपना account बनाएं
            </p>
          </div>

          {error && (
            <div className="auth-error">
              ❌ {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <form
            onSubmit={
              handleRegister
            }
          >

            <label>
              👤 आपका नाम
            </label>

            <input
              type="text"
              placeholder="पूरा नाम"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />


            <label>
              📱 मोबाइल नंबर
            </label>

            <input
              type="tel"
              placeholder="10 अंकों का मोबाइल नंबर"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                )
              }
              maxLength={13}
            />


            <label>
              📧 Email ID
            </label>

            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />


            <label>
              🎯 किस परीक्षा की तैयारी कर रहे हैं?
            </label>

            <select
              value={exam}
              onChange={(e) =>
                setExam(
                  e.target.value
                )
              }
            >
              <option value="">
                परीक्षा चुनें
              </option>

              <option value="UPSC">
                UPSC
              </option>

              <option value="UPPCS">
                UPPCS
              </option>

              <option value="UP PET">
                UP PET
              </option>

              <option value="BPSC">
                BPSC
              </option>

              <option value="MPPSC">
                MPPSC
              </option>

              <option value="SSC">
                SSC
              </option>

              <option value="Railway">
                Railway / RRB
              </option>

              <option value="Banking">
                Banking
              </option>

              <option value="UPSSSC">
                UPSSSC
              </option>

              <option value="RO/ARO">
                RO/ARO
              </option>

              <option value="Police">
                Police
              </option>

              <option value="Teaching">
                Teaching
              </option>

              <option value="Other">
                Other
              </option>
            </select>


            <label>
              🔐 Create Password
            </label>

            <input
              type="password"
              placeholder="कम से कम 6 characters"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />


            <label>
              🔐 Confirm Password
            </label>

            <input
              type="password"
              placeholder="Password फिर से डालें"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />


            <button
              type="submit"
              className="auth-main-btn"
              disabled={loading}
            >
              {loading
                ? "⏳ Account बन रहा है..."
                : "✅ Create Account"}
            </button>

          </form>


          <div className="auth-switch">
            Account पहले से है?

            <button
              onClick={() => {
                clearMessages();
                setMode(
                  "login"
                );
              }}
            >
              Login करें
            </button>
          </div>

        </div>
      </div>
    );
  }


  // ====================================================
  // LOGIN PAGE
  // ====================================================

  return (
    <div className="user-auth-overlay">

      <div className="user-auth-box">

        <button
          className="user-auth-close"
          onClick={onClose}
        >
          ×
        </button>


        <div className="user-auth-header">

          <div className="user-auth-logo">
            📚
          </div>

          <h1>
            Exam Test Login
          </h1>

          <p>
            Mobile या Email से Login करें
          </p>

        </div>


        {error && (
          <div className="auth-error">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}


        <form
          onSubmit={
            handleLogin
          }
        >

          <label>
            📱 Mobile Number / Email ID
          </label>

          <input
            type="text"
            placeholder="Mobile या Email"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value
              )
            }
          />


          <label>
            🔐 Password
          </label>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />


          <button
            type="submit"
            className="auth-main-btn"
            disabled={loading}
          >
            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Login करें"}
          </button>

        </form>


        <button
          className="forgot-btn"
          onClick={
            handleForgotPassword
          }
          disabled={loading}
        >
          🔑 Forgot Password?
        </button>


        <div className="auth-divider">
          <span>
            या
          </span>
        </div>


        <button
          className="create-account-btn"
          onClick={() => {
            clearMessages();
            setMode(
              "register"
            );
          }}
        >
          📝 नया Account बनाएं
        </button>


        <div className="auth-note">
          Mobile से Login करने के लिए
          Registration के समय Mobile Number,
          Email और Password सही भरें।
        </div>

      </div>

    </div>
  );
}

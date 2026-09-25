import React, { useState } from "react";
import "./Login.css";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getDatabase,
  ref,
  get,
} from "firebase/database";

import { auth } from "../firebase";

// ======================================================
// GOOGLE PROVIDER
// ======================================================

const googleProvider = new GoogleAuthProvider();

// ======================================================
// LOGIN PAGE
// ======================================================

export default function Login({
  onBack,
  onCreateAccount,
  onForgotPassword,
  onLoginSuccess,
}) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  // ====================================================
  // USER ID CHECK
  // ====================================================

  const isEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };

  const isMobile = (value) => {
    return /^[6-9]\d{9}$/.test(
      value.trim()
    );
  };

  // ====================================================
  // MOBILE -> EMAIL FIND
  // ====================================================

  const findEmailByMobile = async (mobile) => {
    try {
      const db = getDatabase();

      const usersRef = ref(
        db,
        "users"
      );

      const snapshot =
        await get(usersRef);

      if (!snapshot.exists()) {
        return null;
      }

      const users =
        snapshot.val();

      for (
        const key in users
      ) {
        const currentUser =
          users[key];

        if (
          currentUser &&
          String(
            currentUser.mobile || ""
          ) === mobile
        ) {
          return (
            currentUser.email ||
            null
          );
        }
      }

      return null;
    } catch (error) {
      console.error(
        "Mobile Search Error:",
        error
      );

      return null;
    }
  };

  // ====================================================
  // NORMAL LOGIN
  // ====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    const id =
      userId.trim();

    if (!id) {
      alert(
        "📱 Mobile Number या 📧 Email ID डालें।"
      );
      return;
    }

    if (!password) {
      alert(
        "🔐 Password डालें।"
      );
      return;
    }

    // Mobile validation
    if (
      !isEmail(id) &&
      !isMobile(id)
    ) {
      alert(
        "❌ सही Mobile Number या Email ID डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      let loginEmail = id;

      // ==================================================
      // MOBILE LOGIN
      // ==================================================

      if (isMobile(id)) {
        const foundEmail =
          await findEmailByMobile(
            id
          );

        if (!foundEmail) {
          alert(
            "❌ इस Mobile Number से कोई Account नहीं मिला।\n\nपहले Create Account करें।"
          );

          setLoading(false);
          return;
        }

        loginEmail =
          foundEmail;
      }

      // ==================================================
      // FIREBASE LOGIN
      // ==================================================

      const result =
        await signInWithEmailAndPassword(
          auth,
          loginEmail,
          password
        );

      alert(
        "✅ Login सफल हुआ!"
      );

      if (
        onLoginSuccess
      ) {
        onLoginSuccess(
          result.user
        );
      }

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        alert(
          "❌ User ID या Password गलत है।"
        );
      } else if (
        error.code ===
        "auth/user-not-found"
      ) {
        alert(
          "❌ Account नहीं मिला। पहले Create Account करें।"
        );
      } else if (
        error.code ===
        "auth/wrong-password"
      ) {
        alert(
          "❌ Password गलत है।"
        );
      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        alert(
          "⚠️ बहुत ज्यादा Login प्रयास हुए हैं। कुछ समय बाद प्रयास करें।"
        );
      } else {
        alert(
          "❌ Login Error:\n" +
            error.message
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // GOOGLE LOGIN
  // ====================================================

  const handleGoogleLogin =
    async () => {
      try {
        setGoogleLoading(true);

        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        alert(
          "✅ Google Login सफल हुआ!"
        );

        if (
          onLoginSuccess
        ) {
          onLoginSuccess(
            result.user
          );
        }

      } catch (error) {
        console.error(
          "Google Login Error:",
          error
        );

        alert(
          "❌ Google Login नहीं हुआ:\n" +
            error.message
        );

      } finally {
        setGoogleLoading(false);
      }
    };

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ICON */}

        <div className="login-icon">
          🔐
        </div>

        {/* TITLE */}

        <h1>
          Login
        </h1>

        <p className="login-subtitle">
          अपने Exam Test account में
          login करें
        </p>

        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* USER ID */}

          <label>
            📱 / 📧 User ID
          </label>

          <input
            className="login-input"
            type="text"
            value={userId}
            onChange={(e) =>
              setUserId(
                e.target.value
              )
            }
            placeholder="Mobile Number या Email ID"
            autoComplete="username"
          />

          <div className="login-help">
            Mobile Number या Email ID से
            Login करें
          </div>

          {/* PASSWORD */}

          <label>
            🔐 Password
          </label>

          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Password"
            autoComplete="current-password"
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Login"}
          </button>

        </form>

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <button
          type="button"
          className="forgot-btn"
          onClick={() => {
            if (
              onForgotPassword
            ) {
              onForgotPassword();
            } else {
              alert(
                "Forgot Password / OTP व्यवस्था अगले चरण में जोड़ी जाएगी।"
              );
            }
          }}
        >
          🔑 Forgot Password?
        </button>

        {/* =================================================
            OR
        ================================================= */}

        <div className="login-or">
          या
        </div>

        {/* =================================================
            GOOGLE LOGIN
        ================================================= */}

        <button
          type="button"
          className="google-login"
          onClick={
            handleGoogleLogin
          }
          disabled={
            googleLoading
          }
        >
          {googleLoading
            ? "⏳ Google Login..."
            : "🇬 Google से Login"}
        </button>

        {/* =================================================
            CREATE ACCOUNT
        ================================================= */}

        <div className="create-account-box">

          <span>
            नया account बनाना है?
          </span>

          <button
            type="button"
            className="create-account-btn"
            onClick={() => {
              if (
                onCreateAccount
              ) {
                onCreateAccount();
              } else {
                alert(
                  "Create Account page अगले चरण में जोड़ा जाएगा।"
                );
              }
            }}
          >
            Create Account
          </button>

        </div>

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          className="login-back"
          onClick={() => {
            if (onBack) {
              onBack();
            }
          }}
        >
          ← Website पर वापस जाएँ
        </button>

      </div>

    </div>
  );
}

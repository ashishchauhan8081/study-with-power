import React, { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth, googleProvider } from "./firebase";

function Login({ onBack }) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================
  // LOGIN
  // =====================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("✅ Login सफल हुआ!");

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-credential") {
        alert("❌ Email या Password गलत है।");
      } else if (error.code === "auth/user-not-found") {
        alert("❌ इस Email से कोई Account नहीं मिला।");
      } else if (error.code === "auth/wrong-password") {
        alert("❌ Password गलत है।");
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Email सही नहीं है।");
      } else {
        alert("❌ Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // CREATE ACCOUNT
  // =====================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    if (password.length < 6) {
      alert("Password कम से कम 6 characters का होना चाहिए।");
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("✅ Account सफलतापूर्वक बन गया!");

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("❌ यह Email पहले से Registered है।");
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Email सही नहीं है।");
      } else if (error.code === "auth/weak-password") {
        alert("❌ Password बहुत कमजोर है।");
      } else {
        alert("❌ Account नहीं बन पाया: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // GOOGLE LOGIN
  // =====================================

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await signInWithPopup(
        auth,
        googleProvider
      );

      alert("✅ Google Login सफल हुआ!");

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error(error);

      alert(
        "❌ Google Login failed: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // FORGOT PASSWORD
  // =====================================

  const handleForgotPassword = async () => {
    if (!email) {
      alert("पहले अपना Email डालें।");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        email
      );

      alert(
        "✅ Password Reset Link आपके Email पर भेज दिया गया है।"
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        alert(
          "❌ इस Email से कोई Account नहीं मिला।"
        );
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Email सही नहीं है।");
      } else {
        alert(
          "❌ Reset Email नहीं भेजा जा सका: " +
            error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef6ff,#ffffff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "30px",
          boxSizing: "border-box",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.10)",
        }}
      >

        {/* BACK BUTTON */}

        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "#eef4ff",
            color: "#0868f5",
            padding: "10px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ⬅️ वापस
        </button>

        {/* ICON */}

        <div
          style={{
            width: "75px",
            height: "75px",
            margin: "0 auto 15px",
            borderRadius: "20px",
            background: "#0868f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}
        >
          👤
        </div>

        {/* TITLE */}

        <h1
          style={{
            textAlign: "center",
            color: "#10235d",
            margin: "5px 0",
          }}
        >
          {mode === "login"
            ? "Login"
            : "Create Account"}
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Exam Test में आपका स्वागत है
        </p>

        {/* FORM */}

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : handleRegister
          }
        >

          {/* EMAIL */}

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
              color: "#1e293b",
            }}
          >
            📧 Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your Email"
            style={{
              width: "100%",
              padding: "14px",
              boxSizing: "border-box",
              border: "1px solid #dbe3ef",
              borderRadius: "12px",
              outline: "none",
              marginBottom: "18px",
              fontSize: "16px",
            }}
          />

          {/* PASSWORD */}

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
              color: "#1e293b",
            }}
          >
            🔐 Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your Password"
            style={{
              width: "100%",
              padding: "14px",
              boxSizing: "border-box",
              border: "1px solid #dbe3ef",
              borderRadius: "12px",
              outline: "none",
              marginBottom: "15px",
              fontSize: "16px",
            }}
          />

          {/* FORGOT PASSWORD */}

          {mode === "login" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                border: "none",
                background: "transparent",
                color: "#0868f5",
                fontWeight: "700",
                cursor: "pointer",
                padding: "5px 0",
                marginBottom: "15px",
              }}
            >
              Forgot Password?
            </button>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: loading
                ? "#94a3b8"
                : "#0868f5",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: "800",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "⏳ Please Wait..."
              : mode === "login"
              ? "🔐 Login"
              : "📝 Create Account"}
          </button>
        </form>

        {/* DIVIDER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "22px 0",
            color: "#94a3b8",
          }}
        >
          <div
            style={{
              height: "1px",
              background: "#e2e8f0",
              flex: 1,
            }}
          />

          OR

          <div
            style={{
              height: "1px",
              background: "#e2e8f0",
              flex: 1,
            }}
          />
        </div>

        {/* GOOGLE */}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px solid #dbe3ef",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#1e293b",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🔵 Continue with Google
        </button>

        {/* SWITCH */}

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#64748b",
          }}
        >
          {mode === "login"
            ? "Account नहीं है?"
            : "पहले से Account है?"}

          <button
            onClick={() =>
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#0868f5",
              fontWeight: "800",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            {mode === "login"
              ? "Create Account"
              : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

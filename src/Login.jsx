import React, { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth, googleProvider } from "./firebase";

function Login({ onBack, onCreateAccount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // EMAIL LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("⚠️ कृपया Email और Password भरें।");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      alert("✅ Login सफल हुआ!");

      // App component में onLogin / navigation
      // हो तो यहाँ handle किया जा सकता है
      window.location.reload();

    } catch (error) {
      console.error("Login Error:", error);

      let message = "Login नहीं हो सका।";

      if (error.code === "auth/invalid-credential") {
        message = "❌ Email या Password गलत है।";
      } else if (error.code === "auth/user-not-found") {
        message = "❌ इस Email से Account नहीं मिला।";
      } else if (error.code === "auth/wrong-password") {
        message = "❌ Password गलत है।";
      } else if (error.code === "auth/invalid-email") {
        message = "❌ Email सही नहीं है।";
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GOOGLE LOGIN
  // =========================
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await signInWithPopup(auth, googleProvider);

      alert("✅ Google Login सफल हुआ!");

      window.location.reload();

    } catch (error) {
      console.error("Google Login Error:", error);

      alert(
        "❌ Google Login failed: " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async () => {
    if (!email) {
      alert("⚠️ पहले अपना Email डालें।");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      alert(
        "✅ Password reset link आपके Email पर भेज दिया गया है।"
      );

    } catch (error) {
      console.error(
        "Password Reset Error:",
        error
      );

      if (error.code === "auth/user-not-found") {
        alert(
          "❌ इस Email से कोई Account नहीं मिला।"
        );
      } else {
        alert(
          "❌ Password reset नहीं हो सका।"
        );
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef7ff,#ffffff)",
        padding: "30px 20px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "#ffffff",
          borderRadius: "30px",
          padding: "35px 25px",
          boxSizing: "border-box",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.10)",
        }}
      >

        {/* BACK */}
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "#eef4ff",
            color: "#0868f5",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          ⬅️ वापस
        </button>

        {/* ICON */}
        <div
          style={{
            width: "130px",
            height: "130px",
            margin: "0 auto 20px",
            borderRadius: "30px",
            background: "#0868f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "65px",
          }}
        >
          👤
        </div>

        {/* TITLE */}
        <h1
          style={{
            textAlign: "center",
            color: "#10235d",
            fontSize: "48px",
            margin: "10px 0",
          }}
        >
          Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "24px",
            marginBottom: "35px",
          }}
        >
          Exam Test में आपका स्वागत है
        </p>

        {/* EMAIL */}
        <label
          style={{
            display: "block",
            fontSize: "20px",
            fontWeight: "600",
            color: "#26364d",
            marginBottom: "10px",
          }}
        >
          📧 Email
        </label>

        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "18px",
            boxSizing: "border-box",
            borderRadius: "15px",
            border: "1px solid #d9e0e8",
            fontSize: "19px",
            outline: "none",
            marginBottom: "22px",
          }}
        />

        {/* PASSWORD */}
        <label
          style={{
            display: "block",
            fontSize: "20px",
            fontWeight: "600",
            color: "#26364d",
            marginBottom: "10px",
          }}
        >
          🔐 Password
        </label>

        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "18px",
            boxSizing: "border-box",
            borderRadius: "15px",
            border: "1px solid #d9e0e8",
            fontSize: "19px",
            outline: "none",
            marginBottom: "12px",
          }}
        />

        {/* FORGOT PASSWORD */}
        <div
          style={{
            textAlign: "right",
            marginBottom: "25px",
          }}
        >
          <button
            onClick={handleForgotPassword}
            style={{
              border: "none",
              background: "transparent",
              color: "#0868f5",
              fontSize: "17px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </button>
        </div>

        {/* LOGIN */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "17px",
            border: "none",
            borderRadius: "14px",
            background: "#0868f5",
            color: "#ffffff",
            fontSize: "21px",
            fontWeight: "800",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "⏳ Please Wait..."
            : "🔐 Login"}
        </button>

        {/* OR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            margin: "30px 0",
            color: "#94a3b8",
            fontSize: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#dce2e8",
            }}
          />

          OR

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#dce2e8",
            }}
          />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #d9e0e8",
            background: "#ffffff",
            color: "#26364d",
            fontSize: "19px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🔵 Continue with Google
        </button>

        {/* CREATE ACCOUNT */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            color: "#64748b",
            fontSize: "19px",
          }}
        >
          Account नहीं है?{" "}

          <button
            onClick={onCreateAccount}
            style={{
              border: "none",
              background: "transparent",
              color: "#0868f5",
              fontSize: "19px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;

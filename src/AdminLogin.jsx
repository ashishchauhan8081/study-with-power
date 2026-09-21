import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "./firebase";

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = "cciashish@gmail.com";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert("❌ यह Admin Email नहीं है।");
      return;
    }

    try {
      setLoading(true);

      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      alert("✅ Admin Login सफल!");

      if (onLogin) {
        onLogin(result.user);
      }

    } catch (error) {
      console.error(error);

      let message = "Admin Login नहीं हुआ।";

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        message =
          "❌ Email या Password गलत है।";
      }

      if (
        error.code ===
        "auth/user-not-found"
      ) {
        message =
          "❌ यह Admin Email Firebase में मौजूद नहीं है।";
      }

      if (
        error.code ===
        "auth/wrong-password"
      ) {
        message =
          "❌ Password गलत है।";
      }

      if (
        error.code ===
        "auth/invalid-email"
      ) {
        message =
          "❌ Email गलत है।";
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef4ff,#ffffff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >

        <div
          style={{
            textAlign: "center",
            fontSize: "55px",
            marginBottom: "10px",
          }}
        >
          🔐
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#10235d",
            marginBottom: "5px",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Exam Test Admin Panel
        </p>

        <form onSubmit={handleLogin}>

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            Admin Email
          </label>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#0868f5",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Admin Login"}
          </button>

        </form>

        <button
          onClick={onBack}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            background: "#eef4ff",
            color: "#0868f5",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ← वापस जाएँ
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;

import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import "./Login.css";

export default function Login({ onBack }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    try {

      setLoading(true);

      // =========================
      // FIREBASE LOGIN
      // =========================

      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = result.user;

      // =========================
      // USER ROLE CHECK
      // =========================

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {

        alert(
          "Login सफल हुआ, लेकिन User Profile नहीं मिला।"
        );

        return;
      }

      const userData =
        userSnap.data();

      const role =
        userData.role || "user";

      // =========================
      // ADMIN
      // =========================

      if (role === "admin") {

        window.location.href =
          "/admin";

        return;
      }

      // =========================
      // NORMAL USER
      // =========================

      window.location.href =
        "/";

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      let message =
        "Login नहीं हो पाया।";

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        message =
          "Email या Password गलत है।";
      }

      if (
        error.code ===
        "auth/user-not-found"
      ) {
        message =
          "यह User मौजूद नहीं है।";
      }

      if (
        error.code ===
        "auth/wrong-password"
      ) {
        message =
          "Password गलत है।";
      }

      if (
        error.code ===
        "auth/invalid-email"
      ) {
        message =
          "Email सही नहीं है।";
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
        background: "#f5f8ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#ffffff",
          padding: 30,
          borderRadius: 22,
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.10)",
        }}
      >

        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          style={{
            border: "none",
            background: "#eff6ff",
            color: "#0868f5",
            padding: "10px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          ⬅️ वापस
        </button>

        {/* TITLE */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >

          <div
            style={{
              fontSize: 55,
            }}
          >
            👤
          </div>

          <h1
            style={{
              margin: "8px 0",
              color: "#10235d",
            }}
          >
            Login
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            User और Admin दोनों के लिए
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 700,
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="अपना Email डालें"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border:
                "1px solid #cbd5e1",
              fontSize: 16,
              marginBottom: 18,
              boxSizing: "border-box",
            }}
          />

          {/* PASSWORD */}

          <label
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 700,
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="अपना Password डालें"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border:
                "1px solid #cbd5e1",
              fontSize: 16,
              marginBottom: 22,
              boxSizing: "border-box",
            }}
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: 12,
              background: "#0868f5",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 800,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Login"}
          </button>

        </form>

        {/* INFO */}

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 12,
            background: "#f8fafc",
            color: "#64748b",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          Login के बाद आपका Account Type
          अपने आप पहचाना जाएगा।
        </div>

      </div>

    </div>
  );
}

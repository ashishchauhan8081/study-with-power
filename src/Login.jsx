import React, { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function Login({ onBack }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOGIN FUNCTION
  // ==========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!email.trim() || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    try {

      setLoading(true);

      // ======================================
      // FIREBASE EMAIL/PASSWORD LOGIN
      // ======================================

      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = result.user;

      console.log("Login User:", user);

      // ======================================
      // FIRESTORE USER PROFILE
      // ======================================

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const userSnap =
        await getDoc(userRef);

      // ======================================
      // USER PROFILE NOT FOUND
      // ======================================

      if (!userSnap.exists()) {

        alert(
          "Login सफल हुआ, लेकिन User Profile नहीं मिला।"
        );

        return;
      }

      // ======================================
      // USER DATA
      // ======================================

      const userData =
        userSnap.data();

      const role =
        userData.role || "user";

      console.log("User Role:", role);

      // ======================================
      // ADMIN LOGIN
      // ======================================

      if (role === "admin") {

        window.location.href = "/admin";

        return;
      }

      // ======================================
      // NORMAL USER LOGIN
      // ======================================

      window.location.href = "/";

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      let message =
        "Login नहीं हो पाया।";

      // ======================================
      // FIREBASE ERROR HANDLING
      // ======================================

      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        message =
          "Email या Password गलत है।";

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        message =
          "यह Email Firebase में मौजूद नहीं है।";

      } else if (
        error.code ===
        "auth/wrong-password"
      ) {

        message =
          "Password गलत है।";

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message =
          "Email सही नहीं है।";

      } else if (
        error.code ===
        "auth/user-disabled"
      ) {

        message =
          "यह Account Disable है।";

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        message =
          "बहुत ज्यादा Login प्रयास हुए हैं। कुछ समय बाद फिर कोशिश करें।";

      } else if (
        error.code ===
        "auth/network-request-failed"
      ) {

        message =
          "Internet connection check करें।";

      }

      alert(message);

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eff6ff, #f8fafc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >

      {/* =====================================
          LOGIN CARD
      ===================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "22px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >

        {/* ===================================
            BACK BUTTON
        =================================== */}

        <button
          type="button"
          onClick={onBack}
          style={{
            border: "none",
            background: "#eff6ff",
            color: "#0868f5",
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            marginBottom: "20px",
            fontSize: "15px",
          }}
        >
          ⬅️ वापस
        </button>

        {/* ===================================
            TITLE
        =================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >

          <div
            style={{
              fontSize: "55px",
              lineHeight: "1",
              marginBottom: "10px",
            }}
          >
            👤
          </div>

          <h1
            style={{
              margin: "8px 0",
              color: "#10235d",
              fontSize: "32px",
            }}
          >
            Login
          </h1>

          <p
            style={{
              margin: "8px 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            User और Admin दोनों के लिए
          </p>

        </div>

        {/* ===================================
            LOGIN FORM
        =================================== */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              color: "#1e293b",
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
            autoComplete="email"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border:
                "1px solid #cbd5e1",
              fontSize: "16px",
              marginBottom: "18px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* PASSWORD */}

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "700",
              color: "#1e293b",
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
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border:
                "1px solid #cbd5e1",
              fontSize: "16px",
              marginBottom: "22px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* =================================
              LOGIN BUTTON
          ================================= */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background:
                loading
                  ? "#93c5fd"
                  : "#0868f5",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "800",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              transition:
                "0.2s",
            }}
          >

            {loading
              ? "⏳ Login हो रहा है..."
              : "🔐 Login"}

          </button>

        </form>

        {/* ===================================
            INFORMATION
        =================================== */}

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "#f8fafc",
            color: "#64748b",
            textAlign: "center",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          Login के बाद आपका Account Type
          अपने आप पहचाना जाएगा।
        </div>

      </div>

    </div>

  );
}

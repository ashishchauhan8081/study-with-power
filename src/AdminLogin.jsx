import React, { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("cciashish@gmail.com");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const ADMIN_EMAIL = "cciashish@gmail.com";

  // =========================================================
  // NORMAL EMAIL + PASSWORD LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      alert("कृपया Email और Password भरें।");
      return;
    }

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      alert("❌ यह Admin Email नहीं है।");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // Extra admin email verification
      if (
        result.user.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        alert("❌ यह Admin Account नहीं है।");
        return;
      }

      alert("✅ Admin Login सफल!");

      if (onLogin) {
        onLogin(result.user);
      }
    } catch (error) {
      console.error("Admin Login Error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        alert(
          "❌ Email या Password गलत है।\n\n" +
            "अगर इस Admin account में अभी Password सेट नहीं है, " +
            "तो नीचे 'Google से Password Setup' करें।"
        );

        setShowSetup(true);
      } else if (error.code === "auth/invalid-email") {
        alert("❌ Email गलत है।");
      } else if (error.code === "auth/too-many-requests") {
        alert(
          "⚠️ बहुत बार Login प्रयास हुआ है। कुछ समय बाद फिर प्रयास करें।"
        );
      } else if (error.code === "auth/network-request-failed") {
        alert(
          "❌ Internet connection की समस्या है।"
        );
      } else if (
        error.code === "auth/operation-not-allowed"
      ) {
        alert(
          "❌ Firebase में Email/Password Login Enabled नहीं है।\n\n" +
            "Firebase Console → Authentication → Sign-in providers → Email/Password → Enable करें।"
        );
      } else {
        alert(
          "❌ Admin Login Error:\n" +
            error.code +
            "\n\n" +
            error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE ADMIN VERIFICATION + PASSWORD LINK
  // =========================================================

  const handleGooglePasswordSetup = async () => {
    if (!newPassword || !confirmPassword) {
      alert("कृपया नया Password और Confirm Password भरें।");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "❌ Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ दोनों Password समान नहीं हैं।");
      return;
    }

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      // केवल Admin Google account के लिए login hint
      provider.setCustomParameters({
        login_hint: ADMIN_EMAIL,
      });

      const result = await signInWithPopup(
        auth,
        provider
      );

      const googleUser = result.user;

      // =====================================================
      // IMPORTANT ADMIN CHECK
      // =====================================================

      if (
        googleUser.email?.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
      ) {
        await signOut(auth);

        alert(
          "❌ गलत Google Account!\n\n" +
            "कृपया केवल " +
            ADMIN_EMAIL +
            " से Google Login करें।"
        );

        return;
      }

      // =====================================================
      // CHECK WHETHER PASSWORD ALREADY LINKED
      // =====================================================

      const providers =
        googleUser.providerData.map(
          (item) => item.providerId
        );

      if (
        providers.includes("password")
      ) {
        alert(
          "ℹ️ इस Admin account में Email/Password पहले से जुड़ा हुआ है।\n\n" +
            "अब नीचे से सामान्य Email + Password Login करें।"
        );

        await signOut(auth);

        setShowSetup(false);
        return;
      }

      // =====================================================
      // CREATE EMAIL/PASSWORD CREDENTIAL
      // =====================================================

      const credential =
        EmailAuthProvider.credential(
          ADMIN_EMAIL,
          newPassword
        );

      // =====================================================
      // LINK PASSWORD TO EXISTING GOOGLE ACCOUNT
      // =====================================================

      const linkedResult =
        await linkWithCredential(
          googleUser,
          credential
        );

      alert(
        "✅ Admin Password सफलतापूर्वक सेट हो गया!\n\n" +
          "अब Google Login की जरूरत नहीं है।\n\n" +
          "अब Email + Password से Admin Login करें।"
      );

      console.log(
        "Password linked successfully:",
        linkedResult.user
      );

      // Sign out after setup
      await signOut(auth);

      setNewPassword("");
      setConfirmPassword("");
      setShowSetup(false);

      // Login form पर email already मौजूद रहेगा
      setEmail(ADMIN_EMAIL);
    } catch (error) {
      console.error(
        "Google Password Setup Error:",
        error
      );

      if (
        error.code ===
        "auth/account-exists-with-different-credential"
      ) {
        alert(
          "❌ इस Email के साथ दूसरा Firebase account/credential मौजूद है।\n\n" +
            "Firebase Authentication Users में इस Email की providers जाँचें।"
        );
      } else if (
        error.code === "auth/credential-already-in-use"
      ) {
        alert(
          "❌ यह Email/Password credential किसी दूसरे Firebase account से जुड़ा हुआ है।"
        );
      } else if (
        error.code === "auth/provider-already-linked"
      ) {
        alert(
          "ℹ️ Email/Password पहले से इस Admin account से जुड़ा है।\n\n" +
            "अब सामान्य Login करें।"
        );

        setShowSetup(false);
      } else if (
        error.code === "auth/popup-closed-by-user"
      ) {
        alert(
          "⚠️ Google Login popup बंद कर दिया गया।"
        );
      } else if (
        error.code === "auth/popup-blocked"
      ) {
        alert(
          "❌ Browser ने Google Login popup block कर दिया।\n\n" +
            "Chrome में popup को Allow करें।"
        );
      } else if (
        error.code === "auth/unauthorized-domain"
      ) {
        alert(
          "❌ यह Website Firebase Authorized Domains में नहीं है।\n\n" +
            "Firebase Console → Authentication → Settings → Authorized domains में अपनी Vercel domain जोड़ें।"
        );
      } else {
        alert(
          "❌ Password Setup Error:\n" +
            error.code +
            "\n\n" +
            error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

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
          maxWidth: "440px",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >
        {/* ICON */}

        <div
          style={{
            textAlign: "center",
            fontSize: "55px",
            marginBottom: "10px",
          }}
        >
          🔐
        </div>

        {/* TITLE */}

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

        {/* ================================================= */}
        {/* NORMAL LOGIN FORM */}
        {/* ================================================= */}

        <form onSubmit={handleLogin}>
          {/* EMAIL */}

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            📧 Admin Email
          </label>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="username"
            style={{
              width: "100%",
              padding: "13px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "16px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* PASSWORD */}

          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "7px",
            }}
          >
            🔒 Admin Password
          </label>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "13px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "16px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: loading
                ? "#64748b"
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
              ? "⏳ Login हो रहा है..."
              : "🔐 Admin Login"}
          </button>
        </form>

        {/* ================================================= */}
        {/* PASSWORD SETUP BUTTON */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            setShowSetup(!showSetup)
          }
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "12px",
            border: "1px solid #2563eb",
            borderRadius: "10px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          {showSetup
            ? "✖ Password Setup बंद करें"
            : "🔑 Google से Admin Password Setup"}
        </button>

        {/* ================================================= */}
        {/* PASSWORD SETUP BOX */}
        {/* ================================================= */}

        {showSetup && (
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border:
                "1px solid #dbeafe",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#10235d",
              }}
            >
              🔑 Admin Password Setup
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#475569",
                lineHeight: "1.5",
              }}
            >
              पहले Google से{" "}
              <b>{ADMIN_EMAIL}</b>{" "}
              verify होगा। उसके बाद इसी Firebase
              account में Email + Password जोड़ा जाएगा।
            </p>

            {/* NEW PASSWORD */}

            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "7px",
              }}
            >
              नया Password
            </label>

            <input
              type="password"
              placeholder="नया Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "10px",
                marginBottom: "12px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

            {/* CONFIRM PASSWORD */}

            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "7px",
              }}
            >
              Password Confirm करें
            </label>

            <input
              type="password"
              placeholder="Password फिर से डालें"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "10px",
                marginBottom: "14px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

            {/* SETUP BUTTON */}

            <button
              type="button"
              onClick={
                handleGooglePasswordSetup
              }
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "10px",
                background: loading
                  ? "#64748b"
                  : "#16a34a",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "800",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "⏳ Processing..."
                : "🔐 Google Verify करके Password Set करें"}
            </button>
          </div>
        )}

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
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
          ← Website पर वापस जाएँ
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;

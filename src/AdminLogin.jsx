import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase";

const ADMIN_EMAIL = "ccjashish@gmail.com";

function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // =========================
  // ADMIN LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("❌ Email और Password दोनों भरें।");
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = result.user;

      // केवल Admin Email को अनुमति
      if (
        !user.email ||
        user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
      ) {
        await auth.signOut();

        alert("❌ यह Email Admin के लिए अधिकृत नहीं है।");
        return;
      }

      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminEmail", user.email);

      alert("✅ Admin Login सफल!");

      if (onLogin) {
        onLogin(user);
      }
    } catch (error) {
      console.error("Admin Login Error:", error);

      let message = "Login failed.";

      switch (error.code) {
        case "auth/invalid-email":
          message = "❌ Email गलत है।";
          break;

        case "auth/user-not-found":
          message = "❌ इस Email से Firebase में User नहीं मिला।";
          break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
          message = "❌ Email या Password गलत है।";
          break;

        case "auth/operation-not-allowed":
          message =
            "❌ Firebase में Email/Password Authentication Enable नहीं है।";
          break;

        case "auth/network-request-failed":
          message = "❌ Internet connection की समस्या है।";
          break;

        case "auth/too-many-requests":
          message =
            "❌ बहुत ज्यादा Login प्रयास हुए हैं। कुछ समय बाद फिर प्रयास करें।";
          break;

        case "auth/requests-from-referer-are-blocked":
          message =
            "❌ यह Vercel domain Firebase Authorized Domains में नहीं है।";
          break;

        default:
          message = `❌ Firebase Error: ${
            error.message || error.code || "Unknown error"
          }`;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async () => {
    const resetEmail = email.trim();

    if (!resetEmail) {
      alert("📧 पहले अपना Admin Email डालें।");
      return;
    }

    if (resetEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      alert("❌ यह Admin Email नहीं है।");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);

      alert(
        "✅ Password Reset Link आपके Email पर भेज दिया गया है।\n\n" +
          "अपने Gmail Inbox और Spam/Junk folder को भी चेक करें।"
      );
    } catch (error) {
      console.error("Password Reset Error:", error);

      let message = "Password reset नहीं हो पाया।";

      switch (error.code) {
        case "auth/invalid-email":
          message = "❌ Email गलत है।";
          break;

        case "auth/user-not-found":
          message = "❌ इस Email से Firebase में Admin User नहीं मिला।";
          break;

        case "auth/operation-not-allowed":
          message =
            "❌ Firebase में Email/Password Authentication Enable नहीं है।";
          break;

        case "auth/network-request-failed":
          message = "❌ Internet connection की समस्या है।";
          break;

        case "auth/too-many-requests":
          message =
            "❌ बहुत ज्यादा प्रयास हुए हैं। कुछ समय बाद फिर कोशिश करें।";
          break;

        case "auth/requests-from-referer-are-blocked":
          message =
            "❌ यह Vercel domain Firebase Authorized Domains में नहीं है।";
          break;

        default:
          message = `❌ Firebase Error: ${
            error.message || error.code || "Unknown error"
          }`;
      }

      alert(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>

        <h1 style={styles.title}>Admin Login</h1>

        <p style={styles.subtitle}>Exam Test Admin Panel</p>

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <label style={styles.label}>📧 Admin Email</label>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={styles.input}
            disabled={loading || resetLoading}
          />

          {/* PASSWORD */}
          <label style={styles.label}>🔐 Admin Password</label>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={styles.input}
            disabled={loading || resetLoading}
          />

          {/* FORGOT PASSWORD */}
          <div style={styles.forgotContainer}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || resetLoading}
              style={styles.forgotButton}
            >
              {resetLoading
                ? "⏳ Link भेजा जा रहा है..."
                : "🔑 Forgot Password?"}
            </button>
          </div>

          {/* LOGIN */}
          <button
            type="submit"
            disabled={loading || resetLoading}
            style={{
              ...styles.loginButton,
              opacity: loading || resetLoading ? 0.7 : 1,
            }}
          >
            {loading ? "⏳ Login हो रहा है..." : "🔐 Admin Login"}
          </button>
        </form>

        {/* BACK */}
        <button
          type="button"
          onClick={onBack}
          disabled={loading || resetLoading}
          style={styles.backButton}
        >
          ← Website पर वापस जाएँ
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #dbeafe 50%, #f8fafc 100%)",
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "550px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px 35px",
    boxSizing: "border-box",
    boxShadow: "0 15px 45px rgba(0,0,0,0.15)",
  },

  icon: {
    textAlign: "center",
    fontSize: "45px",
    marginBottom: "5px",
  },

  title: {
    textAlign: "center",
    color: "#123b8f",
    fontSize: "34px",
    margin: "5px 0",
    fontWeight: "800",
  },

  subtitle: {
    textAlign: "center",
    color: "#475569",
    fontSize: "18px",
    marginBottom: "30px",
  },

  label: {
    display: "block",
    fontSize: "19px",
    fontWeight: "700",
    color: "#172554",
    marginBottom: "8px",
    marginTop: "20px",
  },

  input: {
    width: "100%",
    height: "58px",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "0 16px",
    fontSize: "17px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  },

  forgotContainer: {
    textAlign: "right",
    marginTop: "10px",
  },

  forgotButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "5px 0",
  },

  loginButton: {
    width: "100%",
    height: "60px",
    marginTop: "25px",
    border: "none",
    borderRadius: "12px",
    background: "#123b8f",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    height: "55px",
    marginTop: "15px",
    border: "none",
    borderRadius: "12px",
    background: "#e2e8f0",
    color: "#172554",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default AdminLogin;

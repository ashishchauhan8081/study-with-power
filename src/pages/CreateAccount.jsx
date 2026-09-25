import React, { useState } from "react";
import "../App.css";

import {
  getApps,
  getApp,
  initializeApp,
} from "firebase/app";

import {
  getDatabase,
  ref,
  get,
  set,
} from "firebase/database";

// ===============================
// Firebase Configuration
// ===============================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "study-with-power-f6914.firebaseapp.com",
  databaseURL:
    "https://study-with-power-f6914-default-rtdb.firebaseio.com",
  projectId: "study-with-power-f6914",
  storageBucket: "study-with-power-f6914.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Firebase initialize
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const database = getDatabase(app);

// ===============================
// Component
// ===============================
function CreateAccount({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [exam, setExam] = useState("");

  const [loading, setLoading] = useState(false);

  // ===============================
  // Register Account
  // ===============================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("❌ पूरा नाम दर्ज करें");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("❌ सही 10 अंकों का Mobile Number दर्ज करें");
      return;
    }

    if (password.length < 6) {
      alert("❌ Password कम से कम 6 characters का होना चाहिए");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Password और Confirm Password समान नहीं हैं");
      return;
    }

    if (!exam) {
      alert("❌ अपना Exam चुनें");
      return;
    }

    try {
      setLoading(true);

      // Mobile को Firebase key के रूप में इस्तेमाल
      const userRef = ref(database, `users/${mobile}`);

      // पहले check करें कि account पहले से मौजूद है या नहीं
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        alert("⚠️ इस Mobile Number से account पहले से बना हुआ है।");
        setLoading(false);
        return;
      }

      // User data
      const userData = {
        name: name.trim(),
        mobile: mobile,
        password: password,
        exam: exam,
        createdAt: Date.now(),
      };

      // Firebase Database में save
      await set(userRef, userData);

      alert("✅ Account सफलतापूर्वक बन गया!");

      // Form reset
      setName("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
      setExam("");

      // Login page पर जाएँ
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      console.error("Registration Error:", error);

      alert(
        "❌ Registration Error:\n" +
          (error?.message || "कुछ समस्या हुई")
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="page-container">
      <div className="form-card">

        <div className="form-icon">📝</div>

        <h1>Create Account</h1>

        <p className="subtitle">
          Exam Test पर अपना account बनाएं
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <label>👤 पूरा नाम</label>

          <input
            type="text"
            placeholder="अपना पूरा नाम"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Mobile */}
          <label>📱 Mobile Number</label>

          <input
            type="tel"
            placeholder="10 अंकों का Mobile Number"
            maxLength="10"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value.replace(/\D/g, "")
              )
            }
          />

          {/* Password */}
          <label>🔐 Password</label>

          <input
            type="password"
            placeholder="कम से कम 6 characters"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {/* Confirm Password */}
          <label>🔒 Confirm Password</label>

          <input
            type="password"
            placeholder="Password फिर से डालें"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />

          {/* Exam */}
          <label>📚 अपना Exam चुनें</label>

          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
          >
            <option value="">
              -- Exam Select करें --
            </option>

            <option value="UPPCS">
              UPPCS
            </option>

            <option value="UP Police">
              UP Police
            </option>

            <option value="UPSSSC">
              UPSSSC
            </option>

            <option value="UP Lekhpal">
              UP Lekhpal
            </option>

            <option value="UP Home Guard">
              UP Home Guard
            </option>

            <option value="SSC">
              SSC
            </option>

            <option value="RRB">
              RRB
            </option>

            <option value="NTPC">
              NTPC
            </option>

            <option value="BPSC">
              BPSC
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading
              ? "⏳ Account बन रहा है..."
              : "🚀 Account बनाएं"}
          </button>
        </form>

        {/* Login */}
        <p className="login-text">
          Account पहले से है?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              if (onLogin) {
                onLogin();
              }
            }}
          >
            Login करें
          </button>
        </p>

        {/* Back */}
        <button
          type="button"
          className="back-button"
          onClick={() => {
            if (onBack) {
              onBack();
            }
          }}
        >
          ← वापस जाएँ
        </button>

      </div>
    </div>
  );
}

export default CreateAccount;

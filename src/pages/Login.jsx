import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin, onCreateAccount, onBack }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const id = userId.trim();
    const pass = password;

    if (!id) {
      setMessage("कृपया Mobile Number या Email दर्ज करें।");
      return;
    }

    if (!pass) {
      setMessage("कृपया Password दर्ज करें।");
      return;
    }

    setLoading(true);

    try {
      if (onLogin) {
        await onLogin(id, pass);
      } else {
        setMessage("Login system connect नहीं है।");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error?.code === "auth/invalid-credential") {
        setMessage("Mobile/Email या Password गलत है।");
      } else if (error?.code === "auth/user-not-found") {
        setMessage("यह User ID मौजूद नहीं है।");
      } else if (error?.code === "auth/wrong-password") {
        setMessage("Password गलत है।");
      } else if (error?.code === "auth/invalid-email") {
        setMessage("Email सही दर्ज करें।");
      } else if (error?.code === "auth/too-many-requests") {
        setMessage(
          "बहुत ज्यादा Login प्रयास हुए हैं। कुछ समय बाद फिर कोशिश करें।"
        );
      } else {
        setMessage("Login नहीं हो पाया। कृपया फिर कोशिश करें।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo / Lock */}
        <div className="login-logo">🔐</div>

        {/* Heading */}
        <h1 className="login-title">Login</h1>

        <p className="login-subtitle">
          अपने Exam Test account में login करें
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">

          {/* User ID */}
          <div className="form-group">
            <label htmlFor="userId">
              👤 User ID
            </label>

            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Mobile Number या Email"
              autoComplete="username"
              inputMode="email"
            />

            <small>
              Mobile Number या Email से Login करें
            </small>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              🔑 Password
            </label>

            <div className="password-box">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="अपना Password दर्ज करें"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show password"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          {/* Login */}
          <button
            type="submit"
            className="login-main-btn"
            disabled={loading}
          >
            {loading ? "⏳ Login हो रहा है..." : "🔐 Login"}
          </button>
        </form>

        {/* Forgot Password */}
        <button
          type="button"
          className="forgot-btn"
          onClick={() =>
            setMessage(
              "Password reset के लिए registered Email का उपयोग करें।"
            )
          }
        >
          🔑 Forgot Password?
        </button>

        {/* Create Account */}
        <div className="create-section">
          <span>नया account बनाना है?</span>

          <button
            type="button"
            className="create-account-btn"
            onClick={onCreateAccount}
          >
            Create Account
          </button>
        </div>

        {/* Back */}
        <button
          type="button"
          className="back-website-btn"
          onClick={onBack}
        >
          ← Website पर वापस जाएँ
        </button>

      </div>
    </div>
  );
}

export default Login;

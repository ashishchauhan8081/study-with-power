import React, { useState } from "react";
import "./ForgotPassword.css";

export default function ForgotPassword({ onBack, onLogin }) {
  const [step, setStep] = useState(1);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // SEND OTP REQUEST
  // =====================================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanMobile = mobile.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      setError(
        "कृपया 10 अंकों का सही Mobile Number डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Backend/API यहाँ OTP request handle करेगा।
       *
       * Example:
       * POST /api/forgot-password/request
       */

      const response = await fetch(
        "/api/forgot-password/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: cleanMobile,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "OTP भेजने में समस्या हुई।"
        );
      }

      setMessage(
        "✅ WhatsApp पर OTP भेज दिया गया है।"
      );

      setStep(2);
    } catch (err) {
      console.error(
        "Send OTP Error:",
        err
      );

      setError(
        err?.message ||
          "OTP भेजने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const cleanOTP = otp.replace(/\D/g, "");

    if (cleanOTP.length !== 6) {
      setError(
        "कृपया 6 अंकों का OTP डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/forgot-password/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile.replace(
              /\D/g,
              ""
            ),
            otp: cleanOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "OTP गलत है।"
        );
      }

      setMessage(
        "✅ OTP verify हो गया। अब नया password बनाएं।"
      );

      setStep(3);
    } catch (err) {
      console.error(
        "Verify OTP Error:",
        err
      );

      setError(
        err?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError(
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "दोनों passwords समान नहीं हैं।"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/forgot-password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile.replace(
              /\D/g,
              ""
            ),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Password reset नहीं हुआ।"
        );
      }

      setMessage(
        "✅ Password successfully reset हो गया।"
      );

      setTimeout(() => {
        if (onLogin) {
          onLogin();
        } else if (onBack) {
          onBack();
        }
      }, 1500);
    } catch (err) {
      console.error(
        "Reset Password Error:",
        err
      );

      setError(
        err?.message ||
          "Password reset करने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOTP = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "/api/forgot-password/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile.replace(
              /\D/g,
              ""
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "OTP resend नहीं हुआ।"
        );
      }

      setMessage(
        "✅ नया OTP WhatsApp पर भेज दिया गया है।"
      );
    } catch (err) {
      setError(
        err?.message ||
          "OTP resend करने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-icon">
          🔐
        </div>

        <h2>
          Forgot Password
        </h2>

        <p className="forgot-subtitle">
          WhatsApp OTP की मदद से password reset करें
        </p>

        {error && (
          <div className="forgot-error">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="forgot-success">
            {message}
          </div>
        )}

        {/* ============================================
             STEP 1
        ============================================ */}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>

            <label>
              Mobile Number
            </label>

            <div className="mobile-input">
              <span>+91</span>

              <input
                type="tel"
                placeholder="10 digit mobile number"
                value={mobile}
                maxLength={10}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />
            </div>

            <button
              type="submit"
              className="forgot-btn"
              disabled={loading}
            >
              {loading
                ? "⏳ OTP भेज रहे हैं..."
                : "📱 WhatsApp OTP भेजें"}
            </button>

          </form>
        )}

        {/* ============================================
             STEP 2
        ============================================ */}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>

            <div className="otp-info">
              📱 OTP भेजा गया:
              <strong>
                +91 {mobile}
              </strong>
            </div>

            <label>
              6 Digit OTP
            </label>

            <input
              className="normal-input otp-input"
              type="tel"
              placeholder="Enter OTP"
              value={otp}
              maxLength={6}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
            />

            <button
              type="submit"
              className="forgot-btn"
              disabled={loading}
            >
              {loading
                ? "⏳ Verify हो रहा है..."
                : "✅ Verify OTP"}
            </button>

            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOTP}
              disabled={loading}
            >
              🔄 OTP दोबारा भेजें
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setMessage("");
              }}
            >
              ← Mobile Number बदलें
            </button>

          </form>
        )}

        {/* ============================================
             STEP 3
        ============================================ */}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>

            <label>
              New Password
            </label>

            <input
              className="normal-input"
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
            />

            <label>
              Confirm Password
            </label>

            <input
              className="normal-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              className="forgot-btn"
              disabled={loading}
            >
              {loading
                ? "⏳ Password बदल रहे हैं..."
                : "🔐 Reset Password"}
            </button>

          </form>
        )}

        {/* BACK LOGIN */}

        <button
          type="button"
          className="login-back"
          onClick={() => {
            if (onBack) {
              onBack();
            }
          }}
        >
          ← Login पर वापस जाएँ
        </button>

      </div>
    </div>
  );
}

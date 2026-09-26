import React, { useEffect, useState } from "react";
import "../App.css";

import {
  getApps,
  getApp,
  initializeApp,
} from "firebase/app";

import {
  getDatabase,
  ref,
  set,
  get,
} from "firebase/database";

import firebaseConfig from "../firebase-config.json";

// ======================================================
// FIREBASE
// ======================================================

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      databaseURL:
        firebaseConfig.databaseURL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

const db = getDatabase(firebaseApp);

// ======================================================
// HELPERS
// ======================================================

const cleanMobile = (value) => {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
};

const generateRequestId = () => {
  return `REQ_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
};

// ======================================================
// COMPONENT
// ======================================================

export default function ForgotPassword({
  onBack,
  onLogin,
}) {
  const [mobile, setMobile] = useState("");

  const [step, setStep] = useState("mobile");

  const [requestId, setRequestId] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [remaining, setRemaining] = useState(0);

  // ====================================================
  // OTP TIMER
  // ====================================================

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((old) =>
        old > 0 ? old - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  // ====================================================
  // CLEAR MESSAGE
  // ====================================================

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // ====================================================
  // REQUEST PASSWORD RESET
  // ====================================================

  const requestReset = async () => {
    clearMessages();

    const clean = cleanMobile(mobile);

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError(
        "कृपया 6 से शुरू होने वाला सही 10 अंकों का Mobile Number डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      const requestIdValue = generateRequestId();

      const requestData = {
        id: requestIdValue,

        mobile: clean,

        status: "pending",

        otpStatus: "waiting",

        otp: "",

        otpVerified: false,

        passwordReset: false,

        createdAt: Date.now(),

        updatedAt: Date.now(),
      };

      await set(
        ref(
          db,
          `passwordResetRequests/${requestIdValue}`
        ),
        requestData
      );

      setRequestId(requestIdValue);

      setRemaining(0);

      setStep("waiting");

      setMessage(
        "✅ Password reset request Admin Panel में भेज दी गई है। Admin OTP generate करेगा।"
      );
    } catch (err) {
      console.error(
        "Password reset request error:",
        err
      );

      setError(
        "❌ Request भेजने में समस्या हुई। कृपया Internet और Firebase Rules check करें।"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // VERIFY OTP
  // ====================================================

  const checkOTP = async () => {
    clearMessages();

    if (!requestId) {
      setError(
        "❌ Reset request नहीं मिली।"
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "कृपया 6 अंकों का OTP डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      const snapshot = await get(
        ref(
          db,
          `passwordResetRequests/${requestId}`
        )
      );

      if (!snapshot.exists()) {
        setError(
          "❌ Reset request नहीं मिली।"
        );
        return;
      }

      const data = snapshot.val();

      // Admin OTP generated?
      if (data.status !== "otp_generated") {
        setError(
          "⏳ Admin ने अभी OTP generate नहीं किया है।"
        );
        return;
      }

      // OTP check
      if (
        String(data.otp || "") !==
        String(otp)
      ) {
        setError(
          "❌ OTP गलत है।"
        );
        return;
      }

      // OTP expiry
      if (
        data.otpExpiresAt &&
        Date.now() >
          Number(data.otpExpiresAt)
      ) {
        setError(
          "❌ OTP expire हो गया है। Admin से नया OTP generate करवाएँ।"
        );
        return;
      }

      // Mark verified
      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/otpVerified`
        ),
        true
      );

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/otpStatus`
        ),
        "verified"
      );

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/updatedAt`
        ),
        Date.now()
      );

      setStep("password");

      setMessage(
        "✅ OTP verify हो गया। अब नया Password बनाइए।"
      );
    } catch (err) {
      console.error(
        "OTP verification error:",
        err
      );

      setError(
        "❌ OTP verify नहीं हो पाया। कृपया दोबारा कोशिश करें।"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // SAVE NEW PASSWORD REQUEST
  // ====================================================

  const resetPassword = async () => {
    clearMessages();

    if (!requestId) {
      setError(
        "❌ Reset request नहीं मिली।"
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password कम से कम 6 characters का होना चाहिए।"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "❌ दोनों Password समान नहीं हैं।"
      );
      return;
    }

    try {
      setLoading(true);

      const snapshot = await get(
        ref(
          db,
          `passwordResetRequests/${requestId}`
        )
      );

      if (!snapshot.exists()) {
        setError(
          "❌ Reset request नहीं मिली।"
        );
        return;
      }

      const data = snapshot.val();

      // OTP verified?
      if (data.otpVerified !== true) {
        setError(
          "❌ पहले OTP verify करें।"
        );
        return;
      }

      /*
       * SECURITY:
       * New password को Realtime Database में
       * plain text में save नहीं किया जा रहा है।
       *
       * Actual Firebase Authentication password
       * बदलने के लिए backend Firebase Admin SDK
       * endpoint की जरूरत होगी।
       */

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/status`
        ),
        "password_change_requested"
      );

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/passwordReset`
        ),
        true
      );

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/updatedAt`
        ),
        Date.now()
      );

      setNewPassword("");
      setConfirmPassword("");

      setStep("done");

      setMessage(
        "✅ Password change request successfully submit हो गई।"
      );
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setError(
        "❌ Password reset request में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // BACK
  // ====================================================

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
          "linear-gradient(135deg,#eef2ff,#ffffff)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#fff",
          borderRadius: "22px",
          padding: "28px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 12px",
              borderRadius: "22px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "45px",
            }}
          >
            🔑
          </div>

          <h2
            style={{
              margin: "8px 0",
              color: "#111827",
              fontSize: "30px",
            }}
          >
            Forgot Password
          </h2>

          <p
            style={{
              color: "#64748b",
              margin: 0,
              fontSize: "16px",
            }}
          >
            Mobile Number से Password Reset करें
          </p>
        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {message && (
          <div
            style={{
              padding: "13px",
              marginBottom: "15px",
              background: "#ecfdf5",
              color: "#047857",
              border:
                "1px solid #a7f3d0",
              borderRadius: "10px",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div
            style={{
              padding: "13px",
              marginBottom: "15px",
              background: "#fef2f2",
              color: "#dc2626",
              border:
                "1px solid #fecaca",
              borderRadius: "10px",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            STEP 1 - MOBILE
        ================================================== */}

        {step === "mobile" && (
          <>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "7px",
              }}
            >
              📱 Mobile Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => {
                setMobile(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                );
                setError("");
              }}
              placeholder="10 digit mobile number"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px",
                marginBottom: "18px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "11px",
                fontSize: "17px",
                outline: "none",
              }}
            />

            <button
              onClick={requestReset}
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: 0,
                borderRadius: "11px",
                background:
                  loading
                    ? "#93c5fd"
                    : "#2563eb",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Request भेजी जा रही है..."
                : "📱 Password Reset Request"}
            </button>

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                background: "#fff7ed",
                border:
                  "1px solid #fed7aa",
                borderRadius: "10px",
                color: "#9a3412",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              🔐 Mobile Number डालने के बाद
              Admin OTP generate करेगा।
            </div>
          </>
        )}

        {/* ==================================================
            STEP 2 - OTP
        ================================================== */}

        {step === "waiting" && (
          <>
            <div
              style={{
                textAlign: "center",
                padding: "5px 0 20px",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                }}
              >
                📱
              </div>

              <h3
                style={{
                  margin: "8px 0",
                  color: "#111827",
                }}
              >
                OTP Verification
              </h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  marginBottom: "8px",
                }}
              >
                आपका Password Reset Request
                Admin Panel में पहुँच गया है।
              </p>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Admin द्वारा भेजा गया 6 digit OTP
                यहाँ डालें।
              </p>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  wordBreak: "break-all",
                }}
              >
                Request ID:
                <br />
                {requestId}
              </p>
            </div>

            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "7px",
              }}
            >
              🔐 OTP
            </label>

            <input
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="6 digit OTP"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px",
                marginBottom: "15px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "11px",
                fontSize: "22px",
                textAlign: "center",
                letterSpacing: "6px",
              }}
            />

            <button
              onClick={checkOTP}
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: 0,
                borderRadius: "11px",
                background:
                  loading
                    ? "#86efac"
                    : "#16a34a",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              {loading
                ? "Verify हो रहा है..."
                : "✅ OTP Verify करें"}
            </button>
          </>
        )}

        {/* ==================================================
            STEP 3 - NEW PASSWORD
        ================================================== */}

        {step === "password" && (
          <>
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                }}
              >
                🔐
              </div>

              <h3
                style={{
                  margin: "5px 0",
                }}
              >
                नया Password बनाएं
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                OTP successfully verify हो गया है।
              </p>
            </div>

            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "7px",
              }}
            >
              New Password
            </label>

            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="कम से कम 6 characters"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px",
                marginBottom: "15px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "11px",
                fontSize: "16px",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "7px",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Password दोबारा डालें"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "15px",
                marginBottom: "18px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "11px",
                fontSize: "16px",
              }}
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: 0,
                borderRadius: "11px",
                background:
                  loading
                    ? "#c4b5fd"
                    : "#7c3aed",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              {loading
                ? "Saving..."
                : "🔑 नया Password Save करें"}
            </button>

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: "10px",
                color: "#1d4ed8",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              ℹ️ Password को सुरक्षित रखने के लिए
              यह page password को Realtime Database
              में plain text में save नहीं करता।
            </div>
          </>
        )}

        {/* ==================================================
            STEP 4 - DONE
        ================================================== */}

        {step === "done" && (
          <div
            style={{
              textAlign: "center",
              padding: "15px 0",
            }}
          >
            <div
              style={{
                fontSize: "65px",
                marginBottom: "10px",
              }}
            >
              ✅
            </div>

            <h3
              style={{
                color: "#166534",
                marginBottom: "10px",
              }}
            >
              Request Complete
            </h3>

            <p
              style={{
                color: "#64748b",
                lineHeight: 1.7,
              }}
            >
              Password change request successfully
              submit हो गई है।
              <br />
              Admin आपकी request process करेगा।
            </p>

            {onLogin && (
              <button
                onClick={onLogin}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: 0,
                  borderRadius: "11px",
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "16px",
                  marginTop: "10px",
                }}
              >
                ← Login पर जाएँ
              </button>
            )}
          </div>
        )}

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        {step !== "done" && (
          <button
            onClick={handleBack}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "13px",
              border:
                "1px solid #d1d5db",
              borderRadius: "11px",
              background: "#fff",
              color: "#334155",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            ← वापस Login
          </button>
        )}
      </div>
    </div>
  );
}

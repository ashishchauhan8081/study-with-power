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
  push,
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

  const [requestId, setRequestId] =
    useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [remaining, setRemaining] =
    useState(0);

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
  // REQUEST PASSWORD RESET
  // ====================================================

  const requestReset = async () => {
    setError("");
    setMessage("");

    const clean = cleanMobile(mobile);

    if (clean.length !== 10) {
      setError(
        "कृपया 10 अंकों का Mobile Number डालें।"
      );
      return;
    }

    try {
      setLoading(true);

      const requestIdValue =
        generateRequestId();

      const requestData = {
        id: requestIdValue,

        mobile: clean,

        status: "pending",

        otpStatus: "waiting",

        otp: "",

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

      setStep("waiting");

      setMessage(
        "✅ Password reset request Admin Panel में भेज दी गई है। Admin OTP generate करेगा।"
      );
    } catch (err) {
      console.error(
        "Reset request error:",
        err
      );

      setError(
        "❌ Request भेजने में समस्या हुई। Firebase Database Rules और connection check करें।"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // CHECK ADMIN OTP
  // ====================================================

  const checkOTP = async () => {
    setError("");
    setMessage("");

    if (!requestId) {
      setError(
        "Reset request नहीं मिली।"
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "6 अंकों का OTP डालें।"
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

      if (
        data.status !== "otp_generated"
      ) {
        setError(
          "⏳ Admin ने अभी OTP generate नहीं किया है।"
        );
        return;
      }

      if (
        String(data.otp) !==
        String(otp)
      ) {
        setError(
          "❌ OTP गलत है।"
        );
        return;
      }

      if (
        data.otpExpiresAt &&
        Date.now() >
          Number(
            data.otpExpiresAt
          )
      ) {
        setError(
          "❌ OTP expire हो गया है। नया OTP generate करवाएँ।"
        );
        return;
      }

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
        "OTP verify error:",
        err
      );

      setError(
        "❌ OTP verify नहीं हो पाया।"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // RESET PASSWORD
  // ====================================================

  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (
      newPassword.length < 6
    ) {
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
        "दोनों Password समान नहीं हैं।"
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
          "Reset request नहीं मिली।"
        );
        return;
      }

      const data = snapshot.val();

      if (
        data.otpVerified !== true
      ) {
        setError(
          "पहले OTP verify करें।"
        );
        return;
      }

      /*
       * IMPORTANT:
       * Client-side Firebase Realtime Database में
       * Firebase Auth password सीधे change नहीं किया जा सकता।
       *
       * इसलिए यहाँ passwordReset request को
       * completed mark किया जा रहा है।
       *
       * Actual Firebase Auth password update के लिए
       * backend Firebase Admin SDK जरूरी है।
       */

      await set(
        ref(
          db,
          `passwordResetRequests/${requestId}/newPassword`
        ),
        newPassword
      );

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
          `passwordResetRequests/${requestId}/updatedAt`
        ),
        Date.now()
      );

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
        "❌ Password reset में समस्या हुई।"
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
          borderRadius: "20px",
          padding: "28px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.12)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "45px",
            }}
          >
            🔐
          </div>

          <h2
            style={{
              margin: "8px 0",
            }}
          >
            Forgot Password
          </h2>

          <p
            style={{
              color: "#666",
              margin: 0,
            }}
          >
            Mobile Number से Password Reset करें
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              background: "#ecfdf5",
              color: "#047857",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              background: "#fef2f2",
              color: "#dc2626",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================
            MOBILE
        ================================================ */}

        {step === "mobile" && (
          <>
            <label>
              Mobile Number
            </label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="10 digit mobile number"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                marginTop: "8px",
                marginBottom: "18px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                fontSize: "16px",
              }}
            />

            <button
              onClick={requestReset}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: 0,
                borderRadius: "10px",
                background:
                  "#2563eb",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Request भेजी जा रही है..."
                : "📱 Password Reset Request"}
            </button>
          </>
        )}

        {/* ================================================
            WAITING
        ================================================ */}

        {step === "waiting" && (
          <>
            <div
              style={{
                textAlign: "center",
                padding: "10px 0 20px",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
                }}
              >
                ⏳
              </div>

              <h3>
                Admin Approval का इंतजार
              </h3>

              <p
                style={{
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                आपका Password Reset Request
                Admin Panel में पहुँच गया है।
                <br />
                Admin OTP generate करेगा।
              </p>

              <p
                style={{
                  fontSize: "12px",
                  color: "#888",
                  wordBreak:
                    "break-all",
                }}
              >
                Request ID:
                <br />
                {requestId}
              </p>
            </div>

            <label>
              WhatsApp से मिला OTP
            </label>

            <input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="6 digit OTP"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                marginTop: "8px",
                marginBottom: "15px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                fontSize: "20px",
                textAlign: "center",
                letterSpacing: "5px",
              }}
            />

            <button
              onClick={checkOTP}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: 0,
                borderRadius: "10px",
                background:
                  "#16a34a",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Verify हो रहा है..."
                : "✅ OTP Verify"}
            </button>
          </>
        )}

        {/* ================================================
            NEW PASSWORD
        ================================================ */}

        {step === "password" && (
          <>
            <label>
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="New Password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                marginTop: "8px",
                marginBottom: "15px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
              }}
            />

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm Password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                marginTop: "8px",
                marginBottom: "18px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
              }}
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: 0,
                borderRadius: "10px",
                background:
                  "#7c3aed",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Saving..."
                : "🔑 नया Password Save करें"}
            </button>
          </>
        )}

        {/* ================================================
            DONE
        ================================================ */}

        {step === "done" && (
          <div
            style={{
              textAlign: "center",
              padding: "15px",
            }}
          >
            <div
              style={{
                fontSize: "60px",
              }}
            >
              ✅
            </div>

            <h3>
              Request Complete
            </h3>

            <p
              style={{
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              Password change request
              successfully submit हो गई है।
            </p>

            {onLogin && (
              <button
                onClick={onLogin}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: 0,
                  borderRadius: "10px",
                  background:
                    "#2563eb",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Login पर जाएँ
              </button>
            )}
          </div>
        )}

        {/* BACK */}

        {step !== "done" && (
          <button
            onClick={handleBack}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "12px",
              border:
                "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            ← वापस Login
          </button>
        )}
      </div>
    </div>
  );
}

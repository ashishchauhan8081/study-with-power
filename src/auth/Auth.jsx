import React, { useEffect, useRef, useState } from "react";
import {
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const recaptchaRef = useRef(null);

  // =====================================================
  // CLEANUP reCAPTCHA
  // =====================================================
  useEffect(() => {
    return () => {
      try {
        if (recaptchaRef.current) {
          recaptchaRef.current.clear();
          recaptchaRef.current = null;
        }
      } catch (error) {
        console.log("reCAPTCHA cleanup:", error);
      }
    };
  }, []);

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setMessage("");

      const result = await signInWithPopup(auth, googleProvider);

      console.log("Google Login Success:", result.user);

      if (onLogin) {
        onLogin(result.user);
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/popup-closed-by-user") {
        setMessage("Login window बंद कर दी गई।");
      } else if (error.code === "auth/popup-blocked") {
        setMessage("Browser ने popup block कर दिया।");
      } else {
        setMessage(error.message || "Google Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CREATE reCAPTCHA
  // =====================================================
  const createRecaptcha = () => {
    try {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }

      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            setMessage("reCAPTCHA expire हो गया। फिर से OTP भेजें।");
          },
        }
      );

      return recaptchaRef.current;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      setMessage("reCAPTCHA शुरू नहीं हो पाया।");
      return null;
    }
  };

  // =====================================================
  // SEND OTP
  // =====================================================
  const sendOTP = async () => {
    try {
      setMessage("");

      if (!phone.trim()) {
        setMessage("कृपया Mobile Number डालें।");
        return;
      }

      let formattedPhone = phone.trim();

      // अगर user ने केवल 10 digit number डाला है
      if (/^[6-9]\d{9}$/.test(formattedPhone)) {
        formattedPhone = "+91" + formattedPhone;
      }

      // Basic international phone validation
      if (!/^\+[1-9]\d{7,14}$/.test(formattedPhone)) {
        setMessage(
          "कृपया सही Mobile Number डालें। उदाहरण: +919876543210"
        );
        return;
      }

      setLoading(true);

      const verifier = createRecaptcha();

      if (!verifier) {
        setLoading(false);
        return;
      }

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      setConfirmationResult(result);
      setMessage("OTP आपके Mobile Number पर भेज दिया गया है।");
    } catch (error) {
      console.error("OTP Error:", error);

      try {
        if (recaptchaRef.current) {
          recaptchaRef.current.clear();
          recaptchaRef.current = null;
        }
      } catch {}

      if (error.code === "auth/invalid-phone-number") {
        setMessage("Mobile Number सही नहीं है।");
      } else if (error.code === "auth/too-many-requests") {
        setMessage(
          "बहुत ज्यादा प्रयास हो गए हैं। कुछ समय बाद फिर कोशिश करें।"
        );
      } else if (error.code === "auth/quota-exceeded") {
        setMessage(
          "SMS quota समाप्त हो गया है। Firebase Billing/Quota check करें।"
        );
      } else {
        setMessage(
          error.message || "OTP भेजने में समस्या हुई।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================
  const verifyOTP = async () => {
    try {
      setMessage("");

      if (!confirmationResult) {
        setMessage("पहले OTP भेजें।");
        return;
      }

      if (!otp.trim()) {
        setMessage("कृपया OTP डालें।");
        return;
      }

      if (!/^\d{6}$/.test(otp.trim())) {
        setMessage("OTP 6 अंकों का होना चाहिए।");
        return;
      }

      setLoading(true);

      const result = await confirmationResult.confirm(
        otp.trim()
      );

      console.log("Phone Login Success:", result.user);

      if (onLogin) {
        onLogin(result.user);
      }

      setConfirmationResult(null);
      setOtp("");
      setPhone("");
    } catch (error) {
      console.error("OTP Verification Error:", error);

      if (error.code === "auth/invalid-verification-code") {
        setMessage("OTP गलत है।");
      } else if (error.code === "auth/code-expired") {
        setMessage("OTP expire हो गया है। नया OTP भेजें।");
      } else {
        setMessage(
          error.message || "OTP verification failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const logout = async () => {
    try {
      await signOut(auth);

      setConfirmationResult(null);
      setOtp("");
      setPhone("");
      setMessage("Logout हो गया।");
    } catch (error) {
      console.error(error);
      setMessage("Logout नहीं हो पाया।");
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "25px",
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        🔐 Study With Power
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Login / Sign Up
      </p>

      {/* GOOGLE */}
      <button
        onClick={loginWithGoogle}
        disabled={loading}
        style={{
          width: "100%",
          padding: "13px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#fff",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {loading ? "Please wait..." : "🔵 Continue with Google"}
      </button>

      {/* OR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "20px 0",
          color: "#888",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "#ddd",
          }}
        />

        <span>OR</span>

        <div
          style={{
            flex: 1,
            height: "1px",
            background: "#ddd",
          }}
        />
      </div>

      {/* PHONE */}
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: "600",
        }}
      >
        📱 Mobile Number
      </label>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="9876543210"
        disabled={!!confirmationResult}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "13px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          fontSize: "16px",
          marginBottom: "12px",
        }}
      />

      {!confirmationResult ? (
        <button
          onClick={sendOTP}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          {loading ? "OTP भेजा जा रहा है..." : "📨 Send OTP"}
        </button>
      ) : (
        <>
          <label
            style={{
              display: "block",
              marginTop: "15px",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            🔢 OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            placeholder="6 digit OTP"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              fontSize: "18px",
              letterSpacing: "5px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "10px",
              background: "#16a34a",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Verify हो रहा है..."
              : "✅ Verify OTP"}
          </button>

          <button
            onClick={() => {
              setConfirmationResult(null);
              setOtp("");
              setMessage("");
            }}
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            ← दूसरा Mobile Number
          </button>
        </>
      )}

      {/* MESSAGE */}
      {message && (
        <div
          style={{
            marginTop: "18px",
            padding: "12px",
            background: "#f3f4f6",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* REQUIRED reCAPTCHA CONTAINER */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";

import firebaseConfig from "./firebase-config.json";

// ======================================================
// FIREBASE
// ======================================================

const firebaseApp = initializeApp({
  ...firebaseConfig,
  databaseURL:
    firebaseConfig.databaseURL ||
    "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(firebaseApp);

const ADMIN_EMAIL =
  "cciashish@gmail.com";


// ======================================================
// EXAMS
// ======================================================

const exams = [
  {
    id: "upsc",
    name: "UPSC",
    icon: "🇮🇳",
    color: "#fee2e2",
    description: "UPSC Civil Services परीक्षा स्तर",
  },
  {
    id: "uppcs",
    name: "UPPCS",
    icon: "🏛️",
    color: "#fef3c7",
    description: "UPPCS परीक्षा स्तर",
  },
  {
    id: "uppet",
    name: "UP PET",
    icon: "🎯",
    color: "#dcfce7",
    description: "UP PET परीक्षा स्तर",
  },
  {
    id: "bpsc",
    name: "BPSC",
    icon: "🏛️",
    color: "#ede9fe",
    description: "BPSC परीक्षा स्तर",
  },
  {
    id: "mppsc",
    name: "MPPSC",
    icon: "📚",
    color: "#dbeafe",
    description: "MPPSC परीक्षा स्तर",
  },
  {
    id: "ssc",
    name: "SSC",
    icon: "📝",
    color: "#fce7f3",
    description: "SSC परीक्षा स्तर",
  },
  {
    id: "railway",
    name: "Railway",
    icon: "🚆",
    color: "#e0f2fe",
    description: "Railway / RRB परीक्षा स्तर",
  },
  {
    id: "banking",
    name: "Banking",
    icon: "🏦",
    color: "#dcfce7",
    description: "Banking परीक्षा स्तर",
  },
  {
    id: "upsssc",
    name: "UPSSSC",
    icon: "📖",
    color: "#f3e8ff",
    description: "UPSSSC परीक्षा स्तर",
  },
  {
    id: "roaro",
    name: "RO/ARO",
    icon: "📜",
    color: "#fef3c7",
    description: "RO / ARO परीक्षा स्तर",
  },
  {
    id: "police",
    name: "Police",
    icon: "👮",
    color: "#fee2e2",
    description: "Police परीक्षा स्तर",
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: "👨‍🏫",
    color: "#dbeafe",
    description: "Teaching परीक्षा स्तर",
  },
];


// ======================================================
// RESOURCES
// ======================================================

const defaultResources = [
  {
    icon: "📚",
    title: "NCERT Books",
    text:
      "कक्षा 6 से 12 तक की NCERT पुस्तकों का अध्ययन करें।",
    page: "resources", enabled: true,
  },
  {
    icon: "📰",
    title: "Current Affairs",
    text:
      "प्रतिदिन के महत्वपूर्ण Current Affairs पढ़ें।",
    page: "current", enabled: true,
  },
  {
    icon: "📝",
    title: "MCQ Practice",
    text:
      "विषयवार महत्वपूर्ण MCQ का अभ्यास करें।",
    page: "mcq", enabled: true,
  },
  {
    icon: "📖",
    title: "Previous Year Questions",
    text:
      "पिछली परीक्षाओं के प्रश्नों का अभ्यास करें।",
    page: "resources", enabled: true,
  },
  {
    icon: "🎯",
    title: "Test Series",
    text:
      "सभी प्रमुख प्रतियोगी परीक्षाओं की Test Series।",
    page: "tests", enabled: true,
  },
  {
    icon: "🤖",
    title: "AI MCQ Generator",
    text:
      "AI की सहायता से नए MCQ तैयार करें।",
    page: "mcq", enabled: true,
  },
];


// ======================================================
// HELPERS
// ======================================================

function testId(examId, number) {
  return `${examId}_test_${number}`;
}

const MAX_TEST_QUESTIONS = 150;

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .slice(0, MAX_TEST_QUESTIONS)
    .map((q, index) => ({
      id: q.id ?? index + 1,
      question:
        q.question ??
        q.questionText ??
        q.text ??
        "",
      options: Array.isArray(q.options)
        ? q.options.slice(0, 4)
        : ["", "", "", ""],
      answer:
        typeof q.answer === "number"
          ? q.answer
          : Number(q.answer ?? 0),
      explanation:
        q.explanation ?? "",
    }));
}


// ======================================================
// APP
// ======================================================

export default function App() {

  const [page, setPage] =
    useState("home");

  const [selectedExam, setSelectedExam] =
    useState(null);

  const [selectedTest, setSelectedTest] =
    useState(null);

  const [user, setUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [cloudTests, setCloudTests] =
    useState({});

  const [siteResources, setSiteResources] = useState(defaultResources);

  const [adminOpen, setAdminOpen] =
    useState(false);

  const [loginOpen, setLoginOpen] =
    useState(false);

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [phoneLoading, setPhoneLoading] =
    useState(false);

  // जिस Test पर click किया गया है, उसे Login के बाद खोलेंगे
  const [pendingTest, setPendingTest] =
    useState(null);

  const [pendingPurchase, setPendingPurchase] =
    useState(null);

  const [unlockedSeries, setUnlockedSeries] =
    useState(() => {
      try {
        const saved = localStorage.getItem("swp_unlocked_test_series");
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    });

  const [paymentLoading, setPaymentLoading] =
    useState(false);


  // ====================================================
  // AUTH
  // ====================================================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        }
      );

    return () => unsubscribe();

  }, []);


  // ====================================================
  // FIREBASE TESTS
  // ====================================================

  useEffect(() => {

    const testsRef =
      ref(db, "tests");

    const unsubscribe =
      onValue(
        testsRef,
        (snapshot) => {

          setCloudTests(
            snapshot.val() || {}
          );

        },
        (error) => {

          console.error(
            "Firebase Tests Error:",
            error
          );

        }
      );

    return () => unsubscribe();

  }, []);


  // ====================================================
  // SITE RESOURCES
  // ====================================================
  useEffect(() => {
    const r = ref(db, "siteContent/resources");
    const unsub = onValue(r, (snap) => {
      const v = snap.val();
      if (Array.isArray(v) && v.length) setSiteResources(v);
      else if (v && typeof v === "object") setSiteResources(Object.values(v));
      else setSiteResources(defaultResources);
    }, () => setSiteResources(defaultResources));
    return () => unsub();
  }, []);

  const visibleResources = useMemo(
    () => siteResources.filter((x) => x?.enabled !== false),
    [siteResources]
  );


  // ====================================================
  // PUBLIC TESTS
  // ====================================================

  const publicTests =
    useMemo(() => {

      const result = {};

      Object.entries(cloudTests).forEach(
        ([id, test]) => {

          if (
            test &&
            test.status === "public"
          ) {
            result[id] = test;
          }

        }
      );

      return result;

    }, [cloudTests]);


  // ====================================================
  // TEST SERIES PAYMENT - RAZORPAY
  // ====================================================

  const isSeriesUnlocked = (examId) =>
    unlockedSeries.includes(examId);

  const saveUnlockedSeries = (examId) => {
    setUnlockedSeries((prev) => {
      const next = prev.includes(examId) ? prev : [...prev, examId];
      try {
        localStorage.setItem(
          "swp_unlocked_test_series",
          JSON.stringify(next)
        );
      } catch (error) {
        console.warn("Unlock save error:", error);
      }
      return next;
    });
  };

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return; }
      const src = "https://checkout.razorpay.com/v1/checkout.js";
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Razorpay Checkout load नहीं हुआ।")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Razorpay Checkout load नहीं हुआ।"));
      document.body.appendChild(script);
    });

  const buyTestSeries = async (exam, loggedInUser = null) => {
    if (!exam) return;
    if (isSeriesUnlocked(exam.id)) {
      setSelectedExam(exam);
      setSelectedTest(null);
      setPage("tests");
      return;
    }

    const currentUser = loggedInUser || user || auth.currentUser;
    if (!currentUser) {
      setPendingPurchase(exam);
      setLoginOpen(true);
      return;
    }

    try {
      setPaymentLoading(true);
      await loadRazorpay();

      const orderResponse = await fetch(
        "http://localhost:5000/api/payment/order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 49,
            product: `${exam.name} Test Series`,
            receipt: `swp_${exam.id}_${Date.now()}`.slice(0, 40),
          }),
        }
      );

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData?.order_id) {
        throw new Error(orderData?.error || "Razorpay order नहीं बन सका।");
      }

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Study With Power",
        description: `${exam.name} Test Series`,
        order_id: orderData.order_id,
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          contact: currentUser.phoneNumber || "",
        },
        theme: { color: "#2563eb" },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              "http://localhost:5000/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData?.success) {
              throw new Error(verifyData?.error || "Payment verification failed.");
            }

            saveUnlockedSeries(exam.id);
            setSelectedExam(exam);
            setSelectedTest(null);
            setPage("tests");
            setPaymentLoading(false);
            alert(`🎉 Payment सफल हुआ!\n\n${exam.name} Test Series अब Unlock है।`);
          } catch (error) {
            setPaymentLoading(false);
            console.error("Payment Verify Error:", error);
            alert(`❌ Payment verify नहीं हो सका।\n\n${error?.message || "कृपया फिर से प्रयास करें।"}`);
          }
        },
        modal: { ondismiss: () => setPaymentLoading(false) },
      });

      checkout.on("payment.failed", (response) => {
        setPaymentLoading(false);
        alert(`❌ Payment असफल हुआ।\n\n${response?.error?.description || "कृपया फिर से प्रयास करें।"}`);
      });
      checkout.open();
    } catch (error) {
      setPaymentLoading(false);
      console.error("Razorpay Payment Error:", error);
      alert(`❌ Payment शुरू नहीं हो सका।\n\n${error?.message || "कृपया कुछ समय बाद फिर प्रयास करें।"}`);
    }
  };


  // ====================================================
  // LOGIN
  // ====================================================

  const login = async () => {

    try {

      await signInWithPopup(
        auth,
        googleProvider
      );

      setLoginOpen(false);

      if (pendingPurchase) {
        const examToBuy = pendingPurchase;
        setPendingPurchase(null);
        await buyTestSeries(examToBuy, auth.currentUser);
        return;
      }

      if (pendingTest) {
        const testToOpen = pendingTest;
        setPendingTest(null);
        if (Number(testToOpen.testNumber) === 1) {
          setSelectedTest(testToOpen);
          setPage("test");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (selectedExam && !isSeriesUnlocked(selectedExam.id)) {
          await buyTestSeries(selectedExam, auth.currentUser);
        } else {
          setSelectedTest(testToOpen);
          setPage("test");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }

    } catch (error) {

      console.error(error);

      alert(
        "Gmail Login नहीं हुआ:\n" +
        error.message
      );

    }

  };


  const sendPhoneOTP = async () => {

    if (!phoneNumber.trim()) {

      alert("Mobile Number डालें।");
      return;

    }

    const normalizedPhone =
      phoneNumber.trim().startsWith("+")
        ? phoneNumber.trim()
        : "+91" + phoneNumber.trim();

    try {

      setPhoneLoading(true);

      if (
        !window.recaptchaVerifier
      ) {

        window.recaptchaVerifier =
          new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "normal",
            }
          );

        await window.recaptchaVerifier.render();

      }

      const result =
        await signInWithPhoneNumber(
          auth,
          normalizedPhone,
          window.recaptchaVerifier
        );

      setConfirmationResult(result);
      alert(
        "OTP आपके Mobile Number पर भेज दिया गया है।"
      );

    } catch (error) {

      console.error(error);

      alert(
        "OTP नहीं भेजा गया:\n" +
        error.message
      );

      if (
        window.recaptchaVerifier
      ) {

        window.recaptchaVerifier.clear();
        window.recaptchaVerifier =
          null;

      }

    } finally {

      setPhoneLoading(false);

    }

  };


  const verifyPhoneOTP = async () => {

    if (!confirmationResult) {

      alert("पहले OTP भेजें।");
      return;

    }

    if (!otp.trim()) {

      alert("OTP डालें।");
      return;

    }

    try {

      setPhoneLoading(true);

      await confirmationResult.confirm(
        otp.trim()
      );

      setLoginOpen(false);
      setPhoneNumber("");
      setOtp("");
      setConfirmationResult(null);

      if (
        window.recaptchaVerifier
      ) {

        window.recaptchaVerifier.clear();
        window.recaptchaVerifier =
          null;

      }

      if (pendingPurchase) {
        const examToBuy = pendingPurchase;
        setPendingPurchase(null);
        await buyTestSeries(examToBuy, auth.currentUser);
        return;
      }

      if (pendingTest) {
        const testToOpen = pendingTest;
        setPendingTest(null);
        if (Number(testToOpen.testNumber) === 1) {
          setSelectedTest(testToOpen);
          setPage("test");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (selectedExam && !isSeriesUnlocked(selectedExam.id)) {
          await buyTestSeries(selectedExam, auth.currentUser);
        } else {
          setSelectedTest(testToOpen);
          setPage("test");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }

    } catch (error) {

      console.error(error);

      alert(
        "OTP गलत है या Login नहीं हुआ:\n" +
        error.message
      );

    } finally {

      setPhoneLoading(false);

    }

  };


  const logout = async () => {

    try {

      await signOut(auth);

      setAdminOpen(false);
      setPage("home");

    } catch (error) {

      alert(
        "Logout error: " +
        error.message
      );

    }

  };


  // ====================================================
  // NAVIGATION
  // ====================================================

  const goHome = () => {

    setPage("home");
    setSelectedExam(null);
    setSelectedTest(null);
    setAdminOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  const openExam = (exam) => {

    setSelectedExam(exam);
    setPage("tests");
    setSelectedTest(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  const openTest = (test) => {

    // Test शुरू करने के लिए पहले Login जरूरी है।
    if (!user) {
      setPendingTest(test);
      setLoginOpen(true);
      return;
    }

    setSelectedTest(test);
    setPage("test");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ====================================================
  // ADMIN PANEL
  // ====================================================

  if (adminOpen) {

    return (
      <div className="app">

        <style>{styles}</style>

        <AdminPanel
          user={user}
          tests={cloudTests}
          resources={siteResources}
          onClose={() => {
            setAdminOpen(false);
          }}
        />

      </div>
    );

  }


  // ====================================================
  // TEST PAGE
  // ====================================================

  if (
    page === "test" &&
    selectedTest
  ) {

    return (
      <div className="app test-page-app">

        <style>{styles}</style>

<<<<<<< HEAD
        <main className="test-page-container">
          <TestRunner
            test={selectedTest}
            onBack={() => {
              setPage("tests");
            }}
          />
        </main>
=======
        <TestRunner
          test={selectedTest}
          isRetest={false}
          onBack={() => {
            setPage("tests");
          }}
        />
>>>>>>> 07c532c (Fix AI MCQ payment and test system)

      </div>
    );

  }


  return (
    <>

      <style>{styles}</style>

      <div className="app">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="header">

          <div className="header-inner">

            <div
              className="logo"
              onClick={goHome}
            >

              <div className="logo-icon">
                📚
              </div>

              <div className="logo-text">

                <h2>
                  Study With Power
                </h2>

                <span>
                  Learn Today | Lead Tomorrow
                </span>

              </div>

            </div>


            <nav className="nav">

              <button
                onClick={goHome}
              >
                🏠 Home
              </button>

              <button
                onClick={() =>
                  setPage("resources")
                }
              >
                📚 Books
              </button>

              <button
                onClick={() =>
                  setPage("current")
                }
              >
                📰 Current Affairs
              </button>

              <button
                onClick={() =>
                  setPage("mcq")
                }
              >
                📝 MCQ
              </button>


              {
.access-rule-note {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #86efac;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
}

/* ADMIN */}

              {user?.email ===
                ADMIN_EMAIL && (

                <button
                  className="admin-btn"
                  onClick={() =>
                    setAdminOpen(true)
                  }
                >
                  👑 Admin Panel
                </button>

              )}


              {/* LOGIN */}

              {user ? (

                <button
                  className="login-btn"
                  onClick={logout}
                  title={user.email}
                >
                  👤 Logout
                </button>

              ) : (

                <button
                  className="login-btn"
                  onClick={() => setLoginOpen(true)}
                >
                  🔐 Login
                </button>

              )}

            </nav>

            {loginOpen && (

              <div
                className="login-modal-overlay"
                onClick={() => {
                  if (!phoneLoading) {
                    setLoginOpen(false);
                  }
                }}
              >

                <div
                  className="login-modal"
                  onClick={(e) => e.stopPropagation()}
                >

                  <button
                    className="login-modal-close"
                    onClick={() => {
                      if (!phoneLoading) {
                        setLoginOpen(false);
                      }
                    }}
                  >
                    ✕
                  </button>

                  <h2>🔐 Login करें</h2>

                  <p>
                    Gmail या Mobile Number से Login करें
                  </p>

                  <button
                    className="google-login-btn"
                    onClick={login}
                    disabled={phoneLoading}
                  >
                    📧 Gmail से Login
                  </button>

                  <div className="login-divider">
                    <span>या</span>
                  </div>

                  <input
                    className="phone-login-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value)
                    }
                    placeholder="Mobile Number (10 digit)"
                    disabled={
                      phoneLoading ||
                      !!confirmationResult
                    }
                  />

                  {!confirmationResult ? (

                    <button
                      className="phone-login-btn"
                      onClick={sendPhoneOTP}
                      disabled={phoneLoading}
                    >
                      {phoneLoading
                        ? "⏳ OTP भेजा जा रहा है..."
                        : "📱 Mobile पर OTP भेजें"}
                    </button>

                  ) : (

                    <>
                      <input
                        className="phone-login-input"
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value)
                        }
                        placeholder="6 digit OTP"
                        disabled={phoneLoading}
                      />

                      <button
                        className="phone-login-btn"
                        onClick={verifyPhoneOTP}
                        disabled={phoneLoading}
                      >
                        {phoneLoading
                          ? "⏳ Login हो रहा है..."
                          : "✅ OTP Verify करके Login"}
                      </button>
                    </>

                  )}

                  <div
                    id="recaptcha-container"
                    style={{
                      marginTop: "12px",
                      display: confirmationResult
                        ? "none"
                        : "block",
                    }}
                  />

                </div>

              </div>

            )}

          </div>

        </header>


        <main className="container">


          {/* =================================================
              HOME
          ================================================= */}

          {page === "home" && (

            <>

              <section className="hero">

                <h1>
                  <span>
                    Study With{" "}
                  </span>

                  <span>
                    Power
                  </span>
                </h1>

                <p>
                  प्रतियोगी परीक्षाओं की
                  तैयारी के लिए एक ही
                  प्लेटफॉर्म
                </p>

                <div className="search">

                  <input
                    placeholder="आप क्या पढ़ना चाहते हैं?"
                  />

                  <button>
                    🔎 खोजें
                  </button>

                </div>

              </section>


              <div className="section-title">

                <h2>
                  🎯 All Exam Test Series
                </h2>

                <p>
                  सभी प्रमुख प्रतियोगी
                  परीक्षाओं के लिए Test Series
                </p>

              </div>


              <div className="exam-grid">

                {exams.map((exam) => (

                  <div
                    className="exam-card"
                    key={exam.id}
                    style={{
                      background:
                        exam.color,
                    }}
                  >

                    <div className="exam-icon">
                      {exam.icon}
                    </div>

                    <h3>
                      {exam.name}
                    </h3>

                    <p>
                      {exam.description}
                    </p>

                    <span className="paid">
                      ₹49 • PAID
                    </span>

                    <button
                      className="open-btn"
                      onClick={() =>
                        openExam(exam)
                      }
                    >
                      Test Series →
                    </button>

                  </div>

                ))}

              </div>

              {/* =================================================
                  ALL TEST SERIES COMBO
              ================================================= */}
              <div
                style={{
                  margin: "18px 0 25px",
                  padding: "20px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #fff7ed, #fef3c7)",
                  border: "2px solid #f59e0b",
                  textAlign: "center",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "5px",
                  }}
                >
                  🔥
                </div>

                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#b45309",
                    fontSize: "22px",
                  }}
                >
                  All Test Series Combo
                </h2>

                <p
                  style={{
                    margin: "5px 0",
                    fontWeight: "700",
                    color: "#92400e",
                  }}
                >
                  सभी Test Series एक साथ
                </p>

                <p
                  style={{
                    margin: "5px 0 12px",
                    fontSize: "14px",
                    color: "#444",
                  }}
                >
                  UPSC • UPPCS • UP PET • BPSC • MPPSC • SSC •
                  Railway • Banking • UPSSSC • RO/ARO • Police • Teaching
                </p>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "900",
                    color: "#dc2626",
                    margin: "8px 0",
                  }}
                >
                  ₹599
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#166534",
                    marginBottom: "12px",
                  }}
                >
                  ✅ 365 दिन का Full Access
                </div>

                <button
                  className="open-btn"
                  style={{
                    width: "min(320px, 90%)",
                    fontSize: "15px",
                    fontWeight: "800",
                    padding: "11px 18px",
                  }}
                  onClick={() => {
                    alert(
                      "All Test Series Combo ₹599\n\n365 दिनों के लिए सभी Test Series का Access.\n\nPayment system अगले चरण में जोड़ा जाएगा।"
                    );
                  }}
                >
                  💳 ₹599 Combo खरीदें →
                </button>
              </div>


              <div className="section-title">

                <h2>
                  📚 Study Resources
                </h2>

                <p>
                  परीक्षा की तैयारी के लिए
                  सभी आवश्यक सामग्री
                </p>

              </div>


              <div className="resource-grid">

                {visibleResources.map(
                  (item, index) => (

                    <div
                      className="resource-card"
                      key={index}
                    >

                      <div className="icon">
                        {item.icon}
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.text}
                      </p>

                      <button
                        className="open-btn"
                        onClick={() => {

                          if (item.page === "tests") {
                            openExam(exams[0]);
                          } else {
                            setPage(item.page || "resources");
                          }

                        }}
                      >
                        Open →
                      </button>

                    </div>

                  )
                )}

              </div>


              <div className="blue-box">

                <h2>
                  📰 Daily Current Affairs Quiz
                </h2>

                <p>
                  आज के महत्वपूर्ण Current
                  Affairs पर आधारित MCQ
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    setPage("current")
                  }
                >
                  आज का Quiz शुरू करें
                </button>

              </div>


              <div className="blue-box">

                <h2>
                  🤖 AI MCQ Generator
                </h2>

                <p>
                  परीक्षा और विषय चुनकर
                  नए MCQ तैयार करें।
                </p>

                <button
                  className="primary"
                  onClick={() =>
                    setPage("mcq")
                  }
                >
                  MCQ Generator खोलें
                </button>

              </div>

            </>

          )}


          {/* =================================================
              TEST LIST
          ================================================= */}

          {page === "tests" &&
            selectedExam && (

            <>

              <button
                className="back"
                onClick={goHome}
              >
                ← Home पर वापस जाएँ
              </button>


              <div className="page-title">

                <div className="big-icon">
                  {selectedExam.icon}
                </div>

                <h1>
                  {selectedExam.name}
                  {" "}
                  Test Series
                </h1>

                <p>
                  {selectedExam.description}
                </p>

                {!isSeriesUnlocked(selectedExam.id) && (
                  <button
                    className="primary"
                    style={{ marginTop: "12px" }}
                    onClick={() => buyTestSeries(selectedExam)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? "⏳ Payment शुरू हो रहा है..." : "💳 ₹49 में Test Series Unlock करें"}
                  </button>
                )}

                {isSeriesUnlocked(selectedExam.id) && (
                  <div style={{ marginTop: "12px", color: "#15803d", fontWeight: "800" }}>
                    ✅ यह Test Series Unlocked है
                  </div>
                )}

              </div>


              <div className="test-grid">

                {Object.entries(
                  publicTests
                )
                  .filter(
                    ([id, test]) =>
                      test.exam ===
                      selectedExam.id
                  )
                  .sort(
                    (a, b) =>
                      Number(
                        a[1].testNumber
                      ) -
                      Number(
                        b[1].testNumber
                      )
                  )
                  .map(
                    ([id, test]) => (

                      <div
                        className="test-card"
                        key={id}
                      >

                        <h3>
                          {test.title}
                        </h3>

                        <p>
                          {test.questions?.length ||
                            0}{" "}
                          MCQ Questions
                        </p>

                        <div className="price">
                          {Number(test.testNumber) === 1 || isSeriesUnlocked(selectedExam.id)
                            ? "FREE"
                            : "₹49 • PAID"}
                        </div>

                        <button
                          onClick={() => {
                            if (Number(test.testNumber) === 1 || isSeriesUnlocked(selectedExam.id)) {
                              openTest(test);
                            } else {
                              buyTestSeries(selectedExam);
                            }
                          }}
                        >
                          {Number(test.testNumber) === 1
                            ? "🆓 Start Free Test"
                            : isSeriesUnlocked(selectedExam.id)
                            ? "▶️ Start Test"
                            : "🔒 Buy & Unlock"}
                        </button>

                      </div>

                    )
                  )}

              </div>


              {Object.entries(
                publicTests
              ).filter(
                ([id, test]) =>
                  test.exam ===
                  selectedExam.id
              ).length === 0 && (

                <div className="empty-box">

                  <div>
                    📚
                  </div>

                  <h2>
                    अभी कोई Public Test नहीं है
                  </h2>

                  <p>
                    इस परीक्षा के Test
                    जल्द ही उपलब्ध होंगे।
                  </p>

                </div>

              )}

            </>

          )}


          {/* =================================================
              RESOURCES
          ================================================= */}

          {page === "resources" && (

            <>

              <button
                className="back"
                onClick={goHome}
              >
                ← Home
              </button>

              <div className="page-title">

                <div className="big-icon">
                  📚
                </div>

                <h1>
                  Study Resources
                </h1>

                <p>
                  NCERT, Books और परीक्षा
                  उपयोगी अध्ययन सामग्री
                </p>

              </div>

              <div className="resource-grid">

                {visibleResources.map(
                  (item, index) => (

                    <div
                      className="resource-card"
                      key={index}
                    >

                      <div className="icon">
                        {item.icon}
                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.text}
                      </p>

                    </div>

                  )
                )}

              </div>

            </>

          )}


          {/* =================================================
              CURRENT
          ================================================= */}

          {page === "current" && (

            <>

              <button
                className="back"
                onClick={goHome}
              >
                ← Home
              </button>

              <div className="page-title">

                <div className="big-icon">
                  📰
                </div>

                <h1>
                  Current Affairs
                </h1>

                <p>
                  Daily Current Affairs
                  और Current Affairs MCQ
                </p>

              </div>


              <div className="resource-grid">

                <div className="resource-card">

                  <div className="icon">
                    🗞️
                  </div>

                  <h3>
                    Today's Current Affairs
                  </h3>

                  <p>
                    आज के महत्वपूर्ण राष्ट्रीय
                    और अंतरराष्ट्रीय घटनाक्रम।
                  </p>

                </div>


                <div className="resource-card">

                  <div className="icon">
                    📝
                  </div>

                  <h3>
                    Current Affairs MCQ
                  </h3>

                  <p>
                    Current Affairs आधारित
                    महत्वपूर्ण MCQ।
                  </p>

                </div>


                <div className="resource-card">

                  <div className="icon">
                    📅
                  </div>

                  <h3>
                    Monthly Current Affairs
                  </h3>

                  <p>
                    पूरे महीने के महत्वपूर्ण
                    Current Affairs।
                  </p>

                </div>

              </div>

            </>

          )}


          {/* =================================================
              MCQ
          ================================================= */}

          {page === "mcq" && (

            <>

              <button
                className="back"
                onClick={goHome}
              >
                ← Home
              </button>

              <div className="page-title">

                <div className="big-icon">
                  🤖
                </div>

                <h1>
                  AI MCQ Generator
                </h1>

                <p>
                  विषय और परीक्षा के अनुसार
                  MCQ तैयार करें
                </p>

              </div>


              <div className="question-box">

                <h3>
                  विषय चुनें
                </h3>

                <select className="full-input">

                  <option>
                    History
                  </option>

                  <option>
                    Geography
                  </option>

                  <option>
                    Polity
                  </option>

                  <option>
                    Economy
                  </option>

                  <option>
                    Science
                  </option>

                  <option>
                    Current Affairs
                  </option>

                </select>


                <button
                  className="primary"
                >
                  🤖 MCQ Generate करें
                </button>


                <div className="notice">

                  Gemini API जोड़ने के बाद
                  यहाँ AI से वास्तविक MCQ
                  Generate होंगे।

                </div>

              </div>

            </>

          )}

        </main>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">

          <h2>
            📚 Study With Power
          </h2>

          <p>
            Learn Today | Lead Tomorrow
          </p>

          <p
            style={{
              marginTop: "15px",
            }}
          >
            © 2026 Study With Power.
            All Rights Reserved.
          </p>

        </footer>

      </div>

    </>
  );
}


// ========================================================
// TEST RUNNER
// ========================================================

function TestRunner({
  test,
  onBack,
}) {

  const questions =
    normalizeQuestions(
      test.questions
    );

  const [current, setCurrent] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  // Retest mode: explanation is shown immediately after an option is selected.
  const [isRetest, setIsRetest] =
    useState(false);


  if (!questions.length) {

    return (
<<<<<<< HEAD
      <div className="test-runner-page">
=======

      <div className="container">

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
        <button
          className="back"
          onClick={onBack}
        >
          ← वापस
        </button>
<<<<<<< HEAD
        <div className="test-empty-card">
          <h2>इस Test में Questions नहीं हैं।</h2>
=======

        <div className="empty-box">

          <h2>
            इस Test में Questions नहीं हैं।
          </h2>

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
        </div>

      </div>

    );

  }


  if (submitted) {

    let score = 0;

    questions.forEach(
      (q, index) => {

        if (
          answers[index] ===
          Number(q.answer)
        ) {
          score++;
        }

      }
    );


    const percentage =
      Math.round(
        (score / questions.length) *
          100
      );


    return (
<<<<<<< HEAD
      <div className="test-runner-page">
        <div className="test-result-card">
          <div style={{ fontSize: "52px" }}>🎉</div>
          <h1 style={{ color: "#1d4ed8", marginBottom: "8px" }}>Test Complete</h1>
          <h2 style={{ marginTop: 0 }}>{test?.title || "Test"}</h2>
=======
>>>>>>> 07c532c (Fix AI MCQ payment and test system)

      <div className="container">

        <div className="result-box">

          <div className="result-icon">
            🎉
          </div>

          <h1>
            Test Complete
          </h1>

          <h2>
            {test.title}
          </h2>

          <div className="score">
            {score} / {questions.length}
          </div>

          <p>
            आपका Score:
            {" "}
            <strong>
              {percentage}%
            </strong>
          </p>


          <div className="result-actions">

            <button
              className="primary"
              onClick={() => {

                setCurrent(0);
                setAnswers({});
                setSubmitted(false);
                setIsRetest(true);

              }}
            >
              🔄 Test दोबारा दें
            </button>


            <button
              className="back"
              onClick={onBack}
            >
              ← Test List
            </button>

          </div>

        </div>

      </div>

    );

  }


  const question =
    questions[current];


  const selected =
    answers[current];


  return (
<<<<<<< HEAD
    <div className="test-runner-page">
=======

    <div className="container">

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
      <button
        className="back"
        onClick={onBack}
      >
        ← Test List
      </button>

<<<<<<< HEAD
      <div className="test-runner-shell">
        {/* TEST HEADER */}
        <div className="test-header-block">
          <div className="test-exam-name">
            {test?.exam || "UPPCS"}
          </div>
          <div className="test-title-name">
            {test?.title || "Test"} / {questions.length}
          </div>
          <div className="test-progress-text">
            प्रश्न {current + 1} / {questions.length}
            {reviewMode && <span style={{ marginLeft: "10px", color: "#7c3aed" }}>• Review Mode</span>}
          </div>
        </div>

        {/* QUESTION */}
        <div className="test-question-block">
          <h2 className="test-question-text">
            {current + 1}. {question.question}
          </h2>
        </div>

        {/* OPTIONS */}
        <div className="test-options-list">
          {(question.options || []).slice(0, 4).map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = index === correctAnswer;
            const isWrong = reviewMode && isSelected && !isCorrect;
=======

      <div className="question-box">

        <div className="question-header">

          <strong>
            {test.title}
          </strong>

          <span>
            प्रश्न {current + 1}
            {" / "}
            {questions.length}
          </span>

        </div>


        <h2>
          {current + 1}.{" "}
          {question.question}
        </h2>
>>>>>>> 07c532c (Fix AI MCQ payment and test system)


        <div
          className="test-options"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "12px",
            marginTop: "20px",
          }}
        >

          {question.options.map(
            (option, index) => (

              <button
                key={index}
                className={
                  selected === index
                    ? "option selected"
                    : "option"
                }
                onClick={() => {

                  setAnswers(
                    (prev) => ({
                      ...prev,
                      [current]:
                        index,
                    })
                  );

                }}
                style={{
<<<<<<< HEAD
                  ...buttonBase,
                  minWidth: 0,
                  maxWidth: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
=======
                  display: "block",
                  position: "static",
                  float: "none",
>>>>>>> 07c532c (Fix AI MCQ payment and test system)
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "left",
                  padding: "16px 18px",
                  margin: 0,
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1.5,
                }}
              >

                <strong>
                  {String.fromCharCode(
                    65 + index
                  )}
                  .
                </strong>{" "}

                {option}

              </button>

            )
          )}

        </div>

        {isRetest && selected !== undefined && (
          <div
            className="retest-explanation"
            style={{
              marginTop: "20px",
              padding: "18px",
              border: "1px solid #fed7aa",
              borderLeft: "5px solid #f97316",
              borderRadius: "12px",
              background: "#fff7ed",
              textAlign: "left",
              lineHeight: 1.7,
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <strong style={{ color: "#ea580c" }}>
                आपका जवाब: 
              </strong>
              <span>
                {String.fromCharCode(65 + selected)}. {question.options[selected]}
              </span>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong style={{ color: "#ea580c" }}>
                यह सही उत्तर: 
              </strong>
              <span>
                {String.fromCharCode(65 + Number(question.answer))}. {question.options[Number(question.answer)]}
              </span>
            </div>

            <div>
              <strong style={{ color: "#ea580c" }}>
                व्याख्या:
              </strong>
              <div style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}>
                {question.explanation || "इस प्रश्न की व्याख्या उपलब्ध नहीं है।"}
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* NAVIGATION */}
        <div className="test-navigation">
=======

        <div className="test-navigation">

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
          <button
            className="back"
            disabled={
              current === 0
            }
            onClick={() =>
              setCurrent(
                (value) =>
                  Math.max(
                    0,
                    value - 1
                  )
              )
            }
          >
            ← Previous
          </button>


          {current ===
          questions.length - 1 ? (

            <button
              className="primary"
              onClick={() =>
                setSubmitted(true)
              }
            >
              ✓ Submit Test
            </button>

          ) : (

            <button
              className="primary"
              onClick={() =>
                setCurrent(
                  (value) =>
                    Math.min(
                      questions.length - 1,
                      value + 1
                    )
                )
              }
            >
              Next →
            </button>

          )}

        </div>

      </div>

    </div>

  );

}


// ========================================================
// ADMIN PANEL
// ========================================================

<<<<<<< HEAD
function createEmptyQuestion(id = 1) {
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
  };
}

// Automatic Test Access Rule:
// हर Exam का Test 1 = FREE
// Test 2 और उसके बाद = PAID
function getTestAccess(testNumber) {
  return Number(testNumber) === 1 ? "free" : "paid";
}

=======
>>>>>>> 07c532c (Fix AI MCQ payment and test system)
function AdminPanel({
  user,
  tests,
  resources,
  onClose,
}) {

  const [exam, setExam] =
    useState("uppcs");

  const [testNumber, setTestNumber] =
    useState(1);

<<<<<<< HEAD
  const [resourceDraft, setResourceDraft] = useState(
    Array.isArray(resources) && resources.length ? resources : defaultResources
  );

  useEffect(() => {
    if (Array.isArray(resources) && resources.length) setResourceDraft(resources);
  }, [resources]);

  const isAdmin = user?.email === ADMIN_EMAIL;
=======
  const [title, setTitle] =
    useState("UPPCS Test 01");
>>>>>>> 07c532c (Fix AI MCQ payment and test system)

  const [status, setStatus] =
    useState("draft");

  const [questionsText, setQuestionsText] =
    useState(
      JSON.stringify(
        [
          {
            id: 1,
            question: "",
            options: [
              "",
              "",
              "",
            ],
            answer: 0,
            explanation: "",
          },
        ],
        null,
        2
      )
    );

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  const isAdmin =
    user?.email === ADMIN_EMAIL;


  // ======================================================
  // ACCESS
  // ======================================================

  if (!isAdmin) {

    return (

      <div className="container">

        <div className="result-box">

          <div className="result-icon">
            🔐
          </div>

          <h1>
            Admin Access Denied
          </h1>

          <p>
            केवल Admin account इस panel को
            खोल सकता है।
          </p>

          <button
            className="primary"
            onClick={onClose}
          >
            ← Website पर जाएँ
          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // LOAD EXISTING TEST
  // ======================================================

  const loadTest = (
    id,
    data
  ) => {

    setExam(
      data.exam || "uppcs"
    );

    setTestNumber(
      data.testNumber || 1
    );

    setTitle(
      data.title || ""
    );

    setStatus(
      data.status || "draft"
    );

    setQuestionsText(
      JSON.stringify(
        data.questions || [],
        null,
        2
      )
    );

    setMessage(
      `✏️ ${data.title || id} edit mode में खुल गया।`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ======================================================
  // NEW TEST
  // ======================================================

  const newTest = () => {

    setExam("uppcs");

    setTestNumber(1);

    setTitle(
      "UPPCS Test 01"
    );

    setStatus("draft");

    setQuestionsText(
      JSON.stringify(
        [
          {
            id: 1,
            question: "",
            options: [
              "",
              "",
              "",
            ],
            answer: 0,
            explanation: "",
          },
        ],
        null,
        2
      )
    );

    setMessage(
      "📝 नया Test तैयार है।"
    );

  };


  // ======================================================
  // SAVE TEST
  // ======================================================

  const saveTest = async () => {

    if (!isAdmin) {

      alert(
        "Admin access नहीं है।"
      );

      return;

    }


    if (!title.trim()) {

      alert(
        "Test title डालें।"
      );

      return;

    }


    let questions;

    try {

      questions =
        JSON.parse(
          questionsText
        );

    } catch (error) {

      alert(
        "Questions JSON सही नहीं है।"
      );

      return;

    }


    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {

      alert(
        "कम से कम 1 Question होना चाहिए।"
      );

      return;

    }

    if (questions.length > MAX_TEST_QUESTIONS) {

      alert(
        `अधिकतम ${MAX_TEST_QUESTIONS} Questions ही रख सकते हैं। अभी ${questions.length} Questions हैं।`
      );

      return;

    }


    const id =
      testId(
        exam,
        testNumber
      );


    const data = {

      id,

      exam,
<<<<<<< HEAD
      testNumber: Number(testNumber),
      access: getTestAccess(testNumber),
      title: title.trim(),
=======

      testNumber:
        Number(testNumber),

      title,

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
      status,

      questions,

      updatedAt:
        Date.now(),

      updatedBy:
        user.email,

    };


    setSaving(true);

    try {

      await set(
        ref(
          db,
          `tests/${id}`
        ),
        data
      );


      setMessage(

        status === "public"
          ? "🌐 Test PUBLIC हो गया। Website पर दिखाई देगा।"
          : status === "unlisted"
          ? "🔗 Test UNLISTED हो गया।"
          : "📝 Test DRAFT में save हो गया।"

      );

    } catch (error) {

      console.error(error);

      alert(
        "Save नहीं हुआ:\n" +
        error.message
      );

    } finally {

      setSaving(false);

    }

  };


  // ======================================================
  // DELETE
  // ======================================================

  const deleteTest = async (
    id
  ) => {

    const ok =
      window.confirm(
        "क्या आप यह Test delete करना चाहते हैं?"
      );

    if (!ok) {
      return;
    }


    try {

      await remove(
        ref(
          db,
          `tests/${id}`
        )
      );


      setMessage(
        "🗑️ Test delete हो गया।"
      );

    } catch (error) {

      alert(
        "Delete error:\n" +
        error.message
      );

    }

  };

<<<<<<< HEAD
  const updateResource = (index, field, value) => {
    setResourceDraft((prev) => prev.map((x, i) => i === index ? { ...x, [field]: value } : x));
  };

  const saveResources = async () => {
    if (!isAdmin) return alert("Admin access नहीं है।");
    setSaving(true);
    try {
      const clean = resourceDraft.map((x, i) => ({
        id: x.id || String(i + 1), icon: String(x.icon || "📚"),
        title: String(x.title || "").trim(), text: String(x.text || "").trim(),
        page: ["resources", "current", "mcq", "tests"].includes(x.page) ? x.page : "resources",
        enabled: x.enabled !== false
      }));
      await set(ref(db, "siteContent/resources"), clean);
      setResourceDraft(clean); setMessage("✅ Home Resource Cards save हो गए।");
    } catch(e) { alert("Resources Save नहीं हुए:\n" + e.message); }
    finally { setSaving(false); }
  };

  const testList = Object.entries(tests || {}).sort(
    (a, b) =>
      Number(a[1].testNumber || 0) - Number(b[1].testNumber || 0)
  );
=======
>>>>>>> 07c532c (Fix AI MCQ payment and test system)

  const testList =
    Object.entries(tests || {})
      .sort(
        (a, b) =>
          Number(
            a[1].testNumber || 0
          ) -
          Number(
            b[1].testNumber || 0
          )
      );


  return (

    <div className="admin-container">

      {/* ==================================================
          ADMIN HEADER
      ================================================== */}

      <div className="admin-header">

        <div>

          <div className="admin-crown">
            👑
          </div>

          <h1>
            Study With Power
            Admin Panel
          </h1>

          <p>
            Admin: {user.email}
          </p>

        </div>


        <button
          className="admin-close"
          onClick={onClose}
        >
          ← Website
        </button>

      </div>


      {/* ==================================================
          TEST EDITOR
      ================================================== */}

      <div className="admin-card">

        <div className="admin-title-row">

          <div>
<<<<<<< HEAD
            <h2>📝 Test Manager</h2>
            <div className="access-rule-note">🆓 Test 01 = Free &nbsp; | &nbsp; 💰 Test 02 और आगे = Paid</div>
            <p>Test बनाएँ, Questions जोड़ें और Public/Unlisted करें।</p>
=======

            <h2>
              📝 Test Manager
            </h2>

            <p>
              Test बनाएँ, Questions जोड़ें
              और Public/Unlisted करें।
            </p>

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
          </div>


          <button
            className="secondary-btn"
            onClick={newTest}
          >
            ＋ New Test
          </button>

        </div>


        <div className="admin-form">

          <div>

            <label>
              Exam
            </label>

            <select
              value={exam}
              onChange={(e) =>
                setExam(
                  e.target.value
                )
              }
            >

              {exams.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>

                )
              )}

            </select>

          </div>


          <div>

            <label>
              Test Number
            </label>

            <input
              type="number"
              min="1"
              value={testNumber}
              onChange={(e) =>
                setTestNumber(
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>


          <div className="full">

            <label>
              Test Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="UPPCS Test 01"
            />

          </div>


          <div className="full">

            <label>
              Visibility / Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >

              <option value="draft">
                📝 Draft
              </option>

              <option value="unlisted">
                🔗 Unlisted
              </option>

              <option value="public">
                🌐 Public
              </option>

            </select>


            <div className="status-help">

              <div>
                📝 <strong>Draft:</strong>{" "}
                काम चल रहा है।
              </div>

              <div>
                🔗 <strong>Unlisted:</strong>{" "}
                सामान्य Test List में नहीं दिखेगा।
              </div>

              <div>
                🌐 <strong>Public:</strong>{" "}
                Students की Test Series में दिखेगा।
              </div>

            </div>

          </div>

        </div>


        {/* QUESTIONS */}

        <div className="questions-editor">

          <label>
            Questions JSON
          </label>

          <p className="small-text">

            आपके वर्तमान{" "}
            <strong>
              test01.js
            </strong>{" "}
            के questions इसी format में
            यहाँ paste किए जा सकते हैं।

          </p>


          <textarea
            value={questionsText}
            onChange={(e) =>
              setQuestionsText(
                e.target.value
              )
            }
            spellCheck={false}
          />

        </div>


        <div className="admin-actions">

          <button
            className="save-btn"
            disabled={saving}
            onClick={saveTest}
          >

            {saving
              ? "⏳ Saving..."
              : "💾 Save Test"}

          </button>


          <button
            className="secondary-btn"
            onClick={newTest}
          >
            Clear / New
          </button>

        </div>


        {message && (

          <div className="success-message">
            {message}
          </div>

        )}

      </div>

<<<<<<< HEAD
      <div className="admin-card resource-admin-card">
          <div className="admin-title-row">
            <div><h2>🎛️ Home Resource Manager</h2><p>Home के 6 cards को Admin Panel से control करें।</p></div>
            <button className="save-btn" disabled={saving} onClick={saveResources}>{saving ? "⏳ Saving..." : "💾 Save Resources"}</button>
          </div>
          <div className="resource-admin-list">
            {resourceDraft.map((item, index) => (
              <div className="resource-admin-row" key={item.id || index}>
                <div className="resource-admin-number">{index + 1}</div>
                <div className="resource-admin-fields">
                  <div><label>Icon</label><input value={item.icon || ""} onChange={(e) => updateResource(index,"icon",e.target.value)} /></div>
                  <div><label>Title</label><input value={item.title || ""} onChange={(e) => updateResource(index,"title",e.target.value)} /></div>
                  <div className="full"><label>Description</label><input value={item.text || ""} onChange={(e) => updateResource(index,"text",e.target.value)} /></div>
                  <div><label>Open Page</label><select value={item.page || "resources"} onChange={(e) => updateResource(index,"page",e.target.value)}><option value="resources">Study Resources</option><option value="current">Current Affairs</option><option value="mcq">MCQ / AI MCQ</option><option value="tests">Test Series</option></select></div>
                  <label className="resource-admin-toggle"><input type="checkbox" checked={item.enabled !== false} onChange={(e) => updateResource(index,"enabled",e.target.checked)} /> Home पर दिखाएँ</label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
        <h2>📚 सभी Saved Tests</h2>
=======

      {/* ==================================================
          SAVED TESTS
      ================================================== */}

      <div className="admin-card">

        <h2>
          📚 सभी Saved Tests
        </h2>

>>>>>>> 07c532c (Fix AI MCQ payment and test system)
        <p className="small-text">
          यहाँ से किसी भी Test को Edit,
          Delete या उसका Status बदल सकते हैं।
        </p>


        {testList.length === 0 ? (

          <div className="admin-empty">

            <div>
              📭
            </div>

            <h3>
              अभी कोई Test नहीं है।
            </h3>

            <p>
              ऊपर New Test से शुरुआत करें।
            </p>

          </div>

        ) : (

          <div className="admin-test-list">

            {testList.map(
              ([id, data]) => (

                <div
                  className="admin-test-row"
                  key={id}
                >

                  <div className="admin-test-info">

                    <div className="test-status">

                      {data.status ===
                      "public"
                        ? "🌐 PUBLIC"
                        : data.status ===
                          "unlisted"
                        ? "🔗 UNLISTED"
                        : "📝 DRAFT"}

                    </div>

                    <h3>
                      {data.title}
                    </h3>

                    <p>
                      {data.exam?.toUpperCase()}
                      {" • "}
                      Test{" "}
                      {data.testNumber}
                      {" • "}
                      {data.questions?.length ||
                        0}{" "}
                      Questions
                    </p>

                    <small>
                      ID: {id}
                    </small>

                  </div>


                  <div className="admin-test-buttons">

                    <button
                      onClick={() =>
                        loadTest(
                          id,
                          data
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      className="danger-btn"
                      onClick={() =>
                        deleteTest(id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}


// ========================================================
// CSS
// ========================================================

const styles = `

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  background: #eef5ff;
  color: #172033;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: .55;
}


/* HEADER */

.header {
  background: white;
  border-bottom:
    1px solid #dbe5f1;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: auto;
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  font-size: 34px;
}

.logo-text h2 {
  margin: 0;
  color: #1264d8;
  font-size: 21px;
}

.logo-text span {
  color: #64748b;
  font-size: 11px;
}

.nav {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav button {
  background: transparent;
  border: none;
  padding: 9px 12px;
  color: #334155;
  font-weight: 600;
  border-radius: 8px;
}

.nav button:hover {
  background: #eff6ff;
  color: #1264d8;
}

.login-btn {
  background: #1264d8 !important;
  color: white !important;
}

.admin-btn {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #4f46e5
    ) !important;
  color: white !important;
}


/* LOGIN MODAL */

.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.login-modal {
  position: relative;
  width: min(420px, 100%);
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 20px 50px rgba(0,0,0,.2);
  text-align: center;
}

.login-modal h2 {
  margin: 0 0 8px;
}

.login-modal p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 18px;
}

.login-modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.google-login-btn,
.phone-login-btn {
  width: 100%;
  border: none;
  border-radius: 9px;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.google-login-btn {
  background: #1264d8;
  color: white;
}

.phone-login-btn {
  background: #16a34a;
  color: white;
  margin-top: 10px;
}

.google-login-btn:disabled,
.phone-login-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  color: #94a3b8;
  font-size: 13px;
}

.login-divider::before,
.login-divider::after {
  content: "";
  height: 1px;
  background: #e2e8f0;
  flex: 1;
}

.phone-login-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 12px;
  outline: none;
  font-size: 15px;
  margin-top: 8px;
}

.phone-login-input:focus {
  border-color: #1264d8;
}

#recaptcha-container {
  display: flex;
  justify-content: center;
  overflow: hidden;
}

/* MAIN */

.app {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}


/* HERO */

.hero {
  background:
    linear-gradient(
      135deg,
      #e5f1ff,
      #dbeafe
    );
  border:
    1px solid #c9def8;
  border-radius: 18px;
  padding: 35px 25px;
  text-align: center;
  margin-bottom: 28px;
}

.hero h1 {
  font-size: 42px;
  margin: 0 0 10px;
}

.hero h1 span:first-child {
  color: #111827;
}

.hero h1 span:last-child {
  color: #ef3030;
}

.hero p {
  color: #475569;
  margin-bottom: 20px;
}

.search {
  max-width: 620px;
  margin: auto;
  display: flex;
  background: white;
  padding: 5px;
  border-radius: 12px;
  box-shadow:
    0 4px 15px
    rgba(0,0,0,.08);
}

.search input {
  flex: 1;
  border: none;
  outline: none;
  padding: 13px;
}

.search button {
  border: none;
  background: #1264d8;
  color: white;
  border-radius: 8px;
  padding: 0 20px;
  font-weight: bold;
}


/* TITLES */

.section-title {
  text-align: center;
  margin: 30px 0 18px;
}

.section-title h2 {
  font-size: 27px;
}

.section-title p {
  color: #64748b;
  font-size: 14px;
}


/* EXAMS */

.exam-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 14px;
}

.exam-card {
  border:
    1px solid #d8e1ed;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: .2s;
  background: white;
  box-shadow:
    0 2px 8px
    rgba(0,0,0,.04);
}

.exam-card:hover {
  transform:
    translateY(-3px);
  box-shadow:
    0 7px 18px
    rgba(0,0,0,.09);
}

.exam-icon {
  font-size: 30px;
  margin-bottom: 7px;
}

.exam-card h3 {
  font-size: 17px;
  margin-bottom: 4px;
}

.exam-card p {
  font-size: 11px;
  color: #64748b;
  min-height: 28px;
}

.paid {
  display: inline-block;
  margin-top: 9px;
  background: #ef3340;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
}

.open-btn {
  margin-top: 10px;
  width: 100%;
  border: none;
  background: #1264d8;
  color: white;
  padding: 8px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: bold;
}


/* RESOURCES */

.resource-grid {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 16px;
}

.resource-card {
  background: white;
  border:
    1px solid #dbe3ee;
  border-radius: 12px;
  padding: 22px;
  text-align: center;
  box-shadow:
    0 2px 8px
    rgba(0,0,0,.04);
}

.resource-card .icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.resource-card h3 {
  color: #1e3a8a;
  font-size: 17px;
}

.resource-card p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}


/* BLUE BOX */

.blue-box {
  background:
    linear-gradient(
      135deg,
      #e0f2fe,
      #dbeafe
    );
  border:
    1px solid #93c5fd;
  border-radius: 15px;
  padding: 24px;
  margin-top: 28px;
  text-align: center;
}

.primary {
  border: none;
  background: #1264d8;
  color: white;
  padding: 11px 20px;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 15px;
}


/* PAGE TITLE */

.page-title {
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  margin-bottom: 20px;
  border:
    1px solid #dbe3ee;
}

.big-icon {
  font-size: 45px;
}

.page-title h1 {
  margin: 8px 0;
}

.page-title p {
  color: #64748b;
}

.back {
  border: none;
  background: #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
}


/* TESTS */

.test-grid {
  display: grid;
  grid-template-columns:
    repeat(5, 1fr);
  gap: 14px;
}

.test-card {
  background: white;
  border:
    1px solid #dbe3ee;
  border-radius: 12px;
  padding: 17px 10px;
  text-align: center;
}

.test-card h3 {
  color: #1e3a8a;
  font-size: 15px;
}

.test-card p {
  font-size: 12px;
  color: #64748b;
  margin: 7px 0;
}

.test-card button {
  width: 100%;
  border: none;
  background: #1264d8;
  color: white;
  padding: 8px;
  border-radius: 7px;
  font-weight: bold;
}

.price {
  color: #e11d48;
  font-weight: bold;
  font-size: 13px;
}


/* EMPTY */

.empty-box {
  background: white;
  border:
    1px solid #dbe3ee;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  margin-top: 20px;
}

.empty-box div {
  font-size: 50px;
  margin-bottom: 10px;
}

.empty-box p {
  color: #64748b;
}


/* QUESTIONS */

.question-box {
  max-width: 850px;
  margin: auto;
  background: white;
  border-radius: 15px;
  border:
    1px solid #dbe3ee;
  padding: 25px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  border-bottom:
    1px solid #e2e8f0;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.question-box h2 {
  line-height: 1.6;
}

.option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 13px;
  margin: 10px 0;
  border:
    1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 8px;
}

.option:hover {
  background: #eff6ff;
  border-color: #60a5fa;
}

.option.selected {
  background: #dbeafe;
  border:
    2px solid #2563eb;
}

.test-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
}


/* RESULT */

.result-box {
  max-width: 700px;
  margin: 50px auto;
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow:
    0 10px 35px
    rgba(0,0,0,.10);
}

.result-icon {
  font-size: 55px;
}

.result-box h1 {
  color: #1d4ed8;
}

.score {
  font-size: 44px;
  font-weight: bold;
  color: #16a34a;
  margin: 25px 0;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}


/* NOTICE */

.notice {
  background: #fff7ed;
  border:
    1px solid #fed7aa;
  color: #9a3412;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
}


/* FOOTER */

.footer {
  background: #071b3a;
  color: white;
  margin-top: 50px;
  padding: 35px 20px;
  text-align: center;
}

.footer h2 {
  margin-bottom: 8px;
}

.footer p {
  color: #cbd5e1;
  font-size: 12px;
}



.access-rule-note {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #86efac;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
}

/* ADMIN */

.admin-container {
  max-width: 1200px;
  margin: auto;
  padding: 25px 20px 50px;
}

.admin-header {
  background:
    linear-gradient(
      135deg,
      #1d4ed8,
      #7c3aed
    );
  color: white;
  padding: 25px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.admin-header h1 {
  margin: 0 0 8px;
}

.admin-header p {
  margin: 0;
}

.admin-crown {
  font-size: 40px;
}

.admin-close {
  border: none;
  background: white;
  color: #1d4ed8;
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: bold;
}

.admin-card {
  background: white;
  padding: 25px;
  border-radius: 18px;
  box-shadow:
    0 8px 25px
    rgba(0,0,0,.08);
  margin-bottom: 20px;
}

.admin-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.admin-title-row h2 {
  margin-bottom: 5px;
}

.admin-title-row p {
  color: #64748b;
  margin: 0;
}

.admin-form {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 15px;
}

.admin-form .full {
  grid-column: 1 / -1;
}

.admin-form label,
.questions-editor label {
  display: block;
  font-weight: bold;
  margin-bottom: 7px;
}

.admin-form input,
.admin-form select,
.full-input {
  width: 100%;
  padding: 12px;
  border:
    1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 15px;
  background: white;
}

.status-help {
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
  line-height: 1.8;
  font-size: 13px;
}

.questions-editor {
  margin-top: 20px;
}

.small-text {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.questions-editor textarea {
  width: 100%;
  min-height: 430px;
  resize: vertical;
  padding: 15px;
  border:
    1px solid #cbd5e1;
  border-radius: 12px;
  font-family:
    Consolas,
    monospace;
  font-size: 14px;
  line-height: 1.5;
}

.admin-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.save-btn,
.secondary-btn,
.admin-test-buttons button {
  border: none;
  padding: 11px 18px;
  border-radius: 9px;
  font-weight: bold;
}

.save-btn {
  background: #16a34a;
  color: white;
}

.secondary-btn {
  background: #64748b;
  color: white;
}

.success-message {
  background: #ecfdf5;
  color: #166534;
  border:
    1px solid #86efac;
  padding: 14px;
  border-radius: 10px;
  margin-top: 15px;
  font-weight: bold;
}

.admin-empty {
  text-align: center;
  padding: 35px;
  color: #64748b;
}

.admin-empty div {
  font-size: 45px;
}

.admin-test-list {
  margin-top: 20px;
}

.admin-test-row {
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.admin-test-info h3 {
  margin: 5px 0;
}

.admin-test-info p {
  margin: 5px 0;
  color: #64748b;
  font-size: 13px;
}

.admin-test-info small {
  color: #94a3b8;
}

.test-status {
  font-size: 12px;
  font-weight: bold;
}

.admin-test-buttons {
  display: flex;
  gap: 8px;
}

.admin-test-buttons button {
  background: #2563eb;
  color: white;
}

.admin-test-buttons .danger-btn {
  background: #dc2626;
}


/* MOBILE */

@media(max-width: 900px) {

  .exam-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

  .test-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

}

@media(max-width: 650px) {

  .header-inner {
    flex-direction: column;
  }

  .hero h1 {
    font-size: 30px;
  }

  .exam-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .test-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .search {
    flex-direction: column;
    gap: 5px;
  }

  .search button {
    padding: 12px;
  }

  .admin-form {
    grid-template-columns: 1fr;
  }

  .admin-form .full {
    grid-column: auto;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

}
<<<<<<< HEAD


/* =========================================================
   FINAL RESPONSIVE FIX - EXAM TEST SERIES
   ========================================================= */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  overflow-x: hidden;
}

.app {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.exam-grid {
  display: grid !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 14px !important;
  box-sizing: border-box;
}

.exam-card {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exam-card h3,
.exam-card p,
.exam-card .exam-icon,
.exam-card .paid,
.exam-card .open-btn {
  min-width: 0;
  max-width: 100%;
}

.exam-card h3,
.exam-card p {
  width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.exam-card p {
  min-height: 32px;
}

.exam-card .open-btn {
  width: 100%;
  margin-top: 10px;
}

/*
   1200px viewport पर 4 cards रखने से आखिरी card कट रहा था।
   इसलिए 1300px से नीचे 3 columns रखें।
*/
@media (max-width: 1300px) {
  .container {
    max-width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }

  .exam-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 900px) {
  .exam-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 12px;
  }

  .exam-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}
/* =========================================================
   TEST PAGE RESPONSIVE / OVERFLOW FIX
   ========================================================= */
=======
`;
>>>>>>> 07c532c (Fix AI MCQ payment and test system)

html,
body,
#root,
.app {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden !important;
}

.test-page-app {
  width: 100%;
  min-width: 0;
  overflow-x: hidden !important;
}

.test-page-container {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.test-runner-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.test-runner-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  padding: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.test-header-block,
.test-question-block,
.test-options-list,
.test-navigation {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.test-header-block {
  display: block;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 18px;
  margin-bottom: 28px;
}

.test-exam-name,
.test-title-name,
.test-progress-text,
.test-question-text {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-exam-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.test-title-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  margin-top: 4px;
}

.test-progress-text {
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  margin-top: 6px;
}

.test-question-block {
  display: block;
  margin-bottom: 28px;
}

.test-question-text {
  width: 100%;
  margin: 0;
  padding: 0;
  color: #111827;
  text-align: left;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 600;
  line-height: 1.6;
}

.test-options-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  clear: both;
}

.test-options-list > button {
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

.test-options-list > button > span {
  min-width: 0 !important;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.test-navigation > button {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.test-result-card {
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 30px auto;
  background: #fff;
  border-radius: 18px;
  padding: 35px;
  text-align: center;
  box-sizing: border-box;
  box-shadow: 0 10px 35px rgba(0,0,0,.10);
  overflow: hidden;
}

.test-empty-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  box-sizing: border-box;
  overflow: hidden;
}

.test-result-card h1,
.test-result-card h2,
.test-result-card p,
.test-result-card div {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-runner-page .back {
  max-width: 100%;
  box-sizing: border-box;
}

.test-runner-page button {
  max-width: 100%;
}

@media (max-width: 700px) {
  .test-page-container {
    padding: 12px;
  }

  .test-runner-shell {
    padding: 18px 14px;
    border-radius: 14px;
  }

  .test-header-block {
    margin-bottom: 20px;
    padding-bottom: 14px;
  }

  .test-exam-name {
    font-size: 19px;
  }

  .test-title-name {
    font-size: 17px;
  }

  .test-progress-text {
    font-size: 15px;
  }

  .test-question-block {
    margin-bottom: 20px;
  }

  .test-question-text {
    font-size: 20px;
    line-height: 1.5;
  }

  .test-options-list {
    gap: 10px;
  }

  .test-options-list > button {
    min-height: 56px !important;
    padding: 13px 12px !important;
    font-size: 16px !important;
  }

  .test-options-list > button > span:first-child {
    flex: 0 0 32px !important;
    width: 32px !important;
    font-size: 17px !important;
  }

  .test-navigation {
    align-items: stretch;
  }

  .test-navigation > button {
    flex: 1 1 140px;
    padding: 11px 12px !important;
    font-size: 15px !important;
  }

  .test-navigation > div {
    width: 100%;
    text-align: center;
    order: 3;
  }

  .test-result-card {
    padding: 24px 15px;
    margin: 15px auto;
  }
}

@media (max-width: 420px) {
  .test-page-container {
    padding: 8px;
  }

  .test-runner-shell {
    padding: 14px 10px;
  }

  .test-options-list > button {
    padding: 12px 10px !important;
    font-size: 15px !important;
  }

  .test-navigation > button {
    flex-basis: 100%;
  }
}


.test-card {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.test-card h3,
.test-card p,
.test-card .price,
.test-card button {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
}

.test-card button {
  width: 100%;
}

.resource-admin-list{display:flex;flex-direction:column;gap:14px}.resource-admin-row{display:flex;gap:14px;align-items:flex-start;border:1px solid #dbe3ee;border-radius:14px;padding:15px;background:#f8fafc}.resource-admin-number{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:9px;background:#2563eb;color:#fff;font-weight:800}.resource-admin-fields{flex:1;min-width:0;display:grid;grid-template-columns:90px minmax(0,1fr) minmax(220px,260px);gap:12px;align-items:end}.resource-admin-fields .full{grid-column:1/-1}.resource-admin-fields input:not([type=checkbox]),.resource-admin-fields select{width:100%;min-width:0;box-sizing:border-box;padding:10px;border:1px solid #cbd5e1;border-radius:9px;background:#fff}.resource-admin-toggle{display:flex!important;align-items:center;gap:8px;white-space:nowrap}.resource-admin-toggle input{width:18px;height:18px}@media(max-width:760px){.resource-admin-row{flex-direction:column}.resource-admin-fields{width:100%;grid-template-columns:1fr}.resource-admin-fields .full{grid-column:auto}.resource-admin-toggle{white-space:normal}}

`;

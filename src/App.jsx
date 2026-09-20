import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  get,
} from "firebase/database";

import firebaseConfig from "./firebase-config.json";

import AdminPanel from "./pages/AdminPanel";
import TestRunner from "./components/TestRunner";

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

const ADMIN_EMAIL = "cciashish@gmail.com";

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
// DEFAULT RESOURCES
// ======================================================

const defaultResources = [
  {
    icon: "📚",
    title: "NCERT Books",
    text: "कक्षा 6 से 12 तक की NCERT पुस्तकों का अध्ययन करें।",
    page: "resources",
    enabled: true,
  },
  {
    icon: "📰",
    title: "Current Affairs",
    text: "प्रतिदिन के महत्वपूर्ण Current Affairs पढ़ें।",
    page: "current",
    enabled: true,
  },
  {
    icon: "📝",
    title: "MCQ Practice",
    text: "विषयवार महत्वपूर्ण MCQ का अभ्यास करें।",
    page: "mcq",
    enabled: true,
  },
  {
    icon: "📖",
    title: "Previous Year Questions",
    text: "पिछली परीक्षाओं के प्रश्नों का अभ्यास करें।",
    page: "resources",
    enabled: true,
  },
  {
    icon: "🎯",
    title: "Exam Test",
    text: "सभी प्रमुख प्रतियोगी परीक्षाओं की Test Series।",
    page: "tests",
    enabled: true,
  },
  {
    icon: "🤖",
    title: "AI MCQ Generator",
    text: "AI की सहायता से नए MCQ तैयार करें।",
    page: "mcq",
    enabled: true,
  },
];

// ======================================================
// NORMALIZE QUESTIONS
// ======================================================

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((q, index) => ({
    id: q?.id ?? index + 1,

    question:
      q?.question ??
      q?.questionText ??
      q?.text ??
      "",

    options:
      Array.isArray(q?.options)
        ? q.options.slice(0, 4)
        : ["", "", "", ""],

    answer: q?.answer,

    explanation:
      q?.explanation ?? "",

    explanationImage:
      q?.explanationImage ?? "",
  }));
}

// ======================================================
// CORRECT ANSWER
// ======================================================

function getCorrectIndex(question) {
  const options = Array.isArray(question?.options)
    ? question.options
    : [];

  const answer = question?.answer;

  if (
    !options.length ||
    answer === undefined ||
    answer === null
  ) {
    return -1;
  }

  if (
    typeof answer === "number" &&
    Number.isInteger(answer)
  ) {
    if (
      answer >= 0 &&
      answer < options.length
    ) {
      return answer;
    }

    if (
      answer >= 1 &&
      answer <= options.length
    ) {
      return answer - 1;
    }
  }

  const raw = String(answer).trim();

  if (!raw) return -1;

  if (/^\d+$/.test(raw)) {
    const n = Number(raw);

    if (
      n >= 0 &&
      n < options.length
    ) {
      return n;
    }

    if (
      n >= 1 &&
      n <= options.length
    ) {
      return n - 1;
    }
  }

  const letterMatch =
    raw.match(
      /^([ABCD])(?:\s*[.\):-]|\s*$)/i
    );

  if (letterMatch) {
    const index =
      "ABCD".indexOf(
        letterMatch[1].toUpperCase()
      );

    if (
      index >= 0 &&
      index < options.length
    ) {
      return index;
    }
  }

  const compact = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const cleaned =
    raw
      .replace(
        /^[ABCD]\s*[.\):-]\s*/i,
        ""
      )
      .trim();

  const exact =
    options.findIndex(
      (option) =>
        String(option ?? "").trim() === raw ||
        String(option ?? "").trim() === cleaned
    );

  if (exact >= 0) {
    return exact;
  }

  const loose =
    options.findIndex(
      (option) =>
        compact(option) ===
        compact(cleaned)
    );

  return loose >= 0 ? loose : -1;
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

  const [loginModalOpen, setLoginModalOpen] =
    useState(false);

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [phoneLoading, setPhoneLoading] =
    useState(false);

  const [pendingTest, setPendingTest] =
    useState(null);

  const [manualOtpRequestId, setManualOtpRequestId] =
    useState("");

  const [manualOtpPhone, setManualOtpPhone] =
    useState("");

  const [cloudTests, setCloudTests] =
    useState({});

  const [siteResources, setSiteResources] =
    useState(defaultResources);

  const [adminOpen, setAdminOpen] =
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
  // LOAD TESTS
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
  // LOAD RESOURCES
  // ====================================================

  useEffect(() => {
    const resourceRef =
      ref(
        db,
        "siteContent/resources"
      );

    const unsubscribe =
      onValue(
        resourceRef,
        (snapshot) => {
          const value =
            snapshot.val();

          if (
            Array.isArray(value) &&
            value.length
          ) {
            setSiteResources(value);
          } else if (
            value &&
            typeof value === "object"
          ) {
            setSiteResources(
              Object.values(value)
            );
          } else {
            setSiteResources(
              defaultResources
            );
          }
        },
        () => {
          setSiteResources(
            defaultResources
          );
        }
      );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // VISIBLE RESOURCES
  // ====================================================

  const visibleResources =
    useMemo(
      () =>
        siteResources.filter(
          (item) =>
            item?.enabled !== false
        ),
      [siteResources]
    );

  // ====================================================
  // PUBLIC TESTS
  // ====================================================

  const publicTests =
    useMemo(() => {
      const result = {};

      Object.entries(
        cloudTests
      ).forEach(
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
  // LOGIN MODAL
  // ====================================================

  const openLoginModal =
    (test = null) => {
      setPendingTest(test);
      setLoginModalOpen(true);
    };

  // ====================================================
  // LOGIN COMPLETE
  // ====================================================

  const finishLogin =
    (loggedInUser) => {
      setLoginModalOpen(false);

      setManualOtpRequestId("");
      setManualOtpPhone("");
      setOtp("");

      const test =
        pendingTest;

      setPendingTest(null);

      if (test) {
        setSelectedTest(test);
        setPage("test");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      return loggedInUser;
    };

  // ====================================================
  // GOOGLE LOGIN
  // ====================================================

  const loginWithGoogle =
    async () => {
      try {
        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );

        return finishLogin(
          result.user
        );
      } catch (error) {
        console.error(error);

        alert(
          "Google Login नहीं हुआ:\n" +
            error.message
        );

        return null;
      }
    };

  // ====================================================
  // MOBILE OTP REQUEST
  // ====================================================

  const sendPhoneOtp =
    async () => {
      const raw =
        phoneNumber
          .trim()
          .replace(/\s+/g, "");

      const normalized =
        raw.startsWith("+")
          ? raw
          : `+91${raw.replace(/^0+/, "")}`;

      if (
        !/^\+91[6-9]\d{9}$/.test(
          normalized
        )
      ) {
        alert(
          "कृपया सही 10 अंकों का Mobile Number डालें।"
        );
        return;
      }

      try {
        setPhoneLoading(true);

        const authResult =
          auth.currentUser
            ? {
                user:
                  auth.currentUser,
              }
            : await signInAnonymously(
                auth
              );

        const uid =
          authResult.user.uid;

        const requestId =
          `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 10)}`;

        await set(
          ref(
            db,
            `loginRequests/${requestId}`
          ),
          {
            id: requestId,
            uid,
            phone: normalized,
            status: "pending",
            otp: "",
            createdAt: Date.now(),
            expiresAt:
              Date.now() +
              5 * 60 * 1000,
          }
        );

        setManualOtpRequestId(
          requestId
        );

        setManualOtpPhone(
          normalized
        );

        setPhoneNumber(
          normalized
        );

        alert(
          "✅ Login Request Admin Panel में भेज दी गई है।\n\n" +
            "Admin OTP Generate करके आपको WhatsApp पर भेजेंगे।"
        );
      } catch (error) {
        console.error(
          "OTP request error:",
          error
        );

        alert(
          "Login Request नहीं भेजी गई:\n" +
            error.message
        );
      } finally {
        setPhoneLoading(false);
      }
    };

  // ====================================================
  // VERIFY OTP
  // ====================================================

  const verifyPhoneOtp =
    async () => {
      if (
        !manualOtpRequestId
      ) {
        return;
      }

      const enteredOtp =
        otp.trim();

      if (
        !/^\d{6}$/.test(
          enteredOtp
        )
      ) {
        alert(
          "कृपया 6 अंकों का OTP डालें।"
        );
        return;
      }

      try {
        setPhoneLoading(true);

        const snapshot =
          await get(
            ref(
              db,
              `loginRequests/${manualOtpRequestId}`
            )
          );

        if (
          !snapshot.exists()
        ) {
          alert(
            "Login Request नहीं मिली।"
          );
          return;
        }

        const request =
          snapshot.val();

        if (
          request.status ===
          "verified"
        ) {
          alert(
            "यह OTP पहले ही इस्तेमाल हो चुका है।"
          );
          return;
        }

        if (
          String(request.otp) !==
          enteredOtp
        ) {
          alert(
            "❌ OTP गलत है।"
          );
          return;
        }

        if (
          Number(
            request.expiresAt || 0
          ) < Date.now()
        ) {
          alert(
            "⏱️ OTP Expire हो चुका है।"
          );
          return;
        }

        const authResult =
          auth.currentUser
            ? {
                user:
                  auth.currentUser,
              }
            : await signInAnonymously(
                auth
              );

        await update(
          ref(
            db,
            `loginRequests/${manualOtpRequestId}`
          ),
          {
            status: "verified",
            verifiedAt:
              Date.now(),
            verifiedUid:
              authResult.user.uid,
            otp: "",
          }
        );

        localStorage.setItem(
          "exam_test_manual_phone",
          manualOtpPhone ||
            request.phone
        );

        finishLogin(
          authResult.user
        );
      } catch (error) {
        console.error(
          "OTP verify error:",
          error
        );

        alert(
          "OTP Verify नहीं हुआ:\n" +
            error.message
        );
      } finally {
        setPhoneLoading(false);
      }
    };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout =
    async () => {
      try {
        await signOut(auth);

        setAdminOpen(false);
        setPage("home");
        setSelectedTest(null);
      } catch (error) {
        alert(
          "Logout error: " +
            error.message
        );
      }
    };

  // ====================================================
  // HOME
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

  // ====================================================
  // OPEN EXAM
  // ====================================================

  const openExam = (exam) => {
    setSelectedExam(exam);
    setSelectedTest(null);
    setPage("tests");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // OPEN TEST
  // ====================================================

  const openTest =
    async (test) => {
      if (!user) {
        openLoginModal(test);
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
  // ADMIN
  // ====================================================

  if (adminOpen) {
    return (
      <div className="app">
        <AdminPanel
          user={user}
          tests={cloudTests}
          resources={siteResources}
          onClose={() =>
            setAdminOpen(false)
          }
        />
      </div>
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-box">
          <h2>⏳ Loading...</h2>
        </div>
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
    if (!user) {
      return (
        <div className="app">
          <div className="container">
            <div className="empty-box">
              <h2>
                🔐 Test शुरू करने के लिए
                Login जरूरी है
              </h2>

              <button
                className="open-btn"
                onClick={() =>
                  openLoginModal(
                    selectedTest
                  )
                }
              >
                🔐 Login करें
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app test-page-app">
        <main className="test-page-container">
          <TestRunner
            test={selectedTest}
            onBack={() =>
              setPage("tests")
            }
          />
        </main>
      </div>
    );
  }

  // ====================================================
  // MAIN WEBSITE
  // ====================================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">
        <div className="header-inner">

          <div
            className="logo"
            onClick={goHome}
          >
            <div className="logo-icon">
              📝
            </div>

            <div className="logo-text">
              <h2>
                Exam Test
              </h2>

              <span>
                Prepare Today | Succeed Tomorrow
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
                setPage("tests")
              }
            >
              📝 Exam Test
            </button>

            {user && (
              <button
                onClick={logout}
              >
                🚪 Logout
              </button>
            )}

            {user?.email ===
              ADMIN_EMAIL && (
              <button
                onClick={() =>
                  setAdminOpen(true)
                }
              >
                ⚙️ Admin
              </button>
            )}

          </nav>
        </div>
      </header>

      {/* =================================================
          HOME
      ================================================= */}

      {page === "home" && (
        <main>

          <section className="hero">
            <div className="container">

              <div className="hero-content">

                <div className="hero-badge">
                  🎯 Competitive Exam Preparation
                </div>

                <h1>
                  Welcome to{" "}
                  <span>
                    Exam Test
                  </span>
                </h1>

                <p>
                  UPSC, UPPCS, UP PET, SSC,
                  Railway, Banking और अन्य
                  प्रतियोगी परीक्षाओं के लिए
                  Online Exam Test Series।
                </p>

                <button
                  className="hero-btn"
                  onClick={() =>
                    setPage("tests")
                  }
                >
                  📝 Start Exam Test
                </button>

              </div>

            </div>
          </section>

          {/* EXAMS */}

          <section className="section">
            <div className="container">

              <div className="section-heading">
                <h2>
                  🎯 Exam Test
                </h2>

                <p>
                  अपनी परीक्षा चुनें और Test
                  शुरू करें
                </p>
              </div>

              <div className="exam-grid">

                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="exam-card"
                    style={{
                      background:
                        exam.color,
                    }}
                    onClick={() =>
                      openExam(exam)
                    }
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

                    <button>
                      View Tests →
                    </button>
                  </div>
                ))}

              </div>

            </div>
          </section>

          {/* RESOURCES */}

          <section className="section resources-section">
            <div className="container">

              <div className="section-heading">
                <h2>
                  📚 Study Resources
                </h2>
              </div>

              <div className="resource-grid">

                {visibleResources.map(
                  (resource, index) => (
                    <div
                      className="resource-card"
                      key={index}
                    >
                      <div>
                        {resource.icon}
                      </div>

                      <h3>
                        {resource.title}
                      </h3>

                      <p>
                        {resource.text}
                      </p>
                    </div>
                  )
                )}

              </div>

            </div>
          </section>

        </main>
      )}

      {/* =================================================
          TEST LIST
      ================================================= */}

      {page === "tests" && (
        <main className="container page-container">

          <div className="page-title">

            <button
              className="back-btn"
              onClick={goHome}
            >
              ← Home
            </button>

            <h1>
              📝 Exam Test
            </h1>

            <p>
              {selectedExam
                ? `${selectedExam.name} Test Series`
                : "सभी उपलब्ध Exam Tests"}
            </p>

          </div>

          <div className="test-list">

            {Object.entries(
              publicTests
            )
              .filter(
                ([, test]) =>
                  !selectedExam ||
                  test.exam ===
                    selectedExam.id
              )
              .map(
                ([id, test]) => (
                  <div
                    className="test-card"
                    key={id}
                  >

                    <div className="test-card-icon">
                      📝
                    </div>

                    <div className="test-card-content">

                      <h3>
                        {test.title ||
                          `Test ${test.testNumber}`}
                      </h3>

                      <p>
                        Questions:{" "}
                        {test.totalQuestions ||
                          test.questions?.length ||
                          0}
                      </p>

                      <p>
                        Duration:{" "}
                        {test.duration ||
                          30} Minutes
                      </p>

                      <button
                        className="open-btn"
                        onClick={() =>
                          openTest(test)
                        }
                      >
                        ▶ Start Test
                      </button>

                    </div>

                  </div>
                )
              )}

          </div>

          {Object.entries(
            publicTests
          ).filter(
            ([, test]) =>
              !selectedExam ||
              test.exam ===
                selectedExam.id
          ).length === 0 && (
            <div className="empty-box">

              <h2>
                📭 अभी कोई Public Test उपलब्ध नहीं है।
              </h2>

              <p>
                Admin Panel से Test बनाकर
                Status = Public करें।
              </p>

            </div>
          )}

        </main>
      )}

      {/* =================================================
          LOGIN MODAL
      ================================================= */}

      {loginModalOpen && (
        <div className="modal-overlay">

          <div className="login-modal">

            <button
              className="modal-close"
              onClick={() =>
                setLoginModalOpen(false)
              }
            >
              ✕
            </button>

            <div className="login-icon">
              🔐
            </div>

            <h2>
              Exam Test Login
            </h2>

            <p>
              Test शुरू करने के लिए Login करें
            </p>

            <button
              className="google-btn"
              onClick={loginWithGoogle}
              disabled={phoneLoading}
            >
              🇬 Continue with Google
            </button>

            <div className="login-divider">
              <span>
                या Mobile OTP
              </span>
            </div>

            <input
              type="tel"
              placeholder="10 Digit Mobile Number"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(
                  e.target.value
                )
              }
              disabled={
                !!manualOtpRequestId
              }
            />

            {!manualOtpRequestId ? (
              <button
                className="otp-btn"
                onClick={sendPhoneOtp}
                disabled={phoneLoading}
              >
                {phoneLoading
                  ? "⏳ Sending..."
                  : "📱 Send OTP Request"}
              </button>
            ) : (
              <>
                <div className="otp-info">
                  OTP आपके WhatsApp पर
                  भेजा जाएगा।
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 Digit OTP"
                  value={otp}
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
                  className="otp-btn"
                  onClick={verifyPhoneOtp}
                  disabled={
                    phoneLoading
                  }
                >
                  {phoneLoading
                    ? "⏳ Verifying..."
                    : "✅ Verify OTP"}
                </button>
              </>
            )}

            <p className="login-note">
              🔒 आपका Login सुरक्षित है।
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="container">

          <h3>
            📝 Exam Test
          </h3>

          <p>
            Competitive Exam Preparation
            Platform
          </p>

          <p>
            © {new Date().getFullYear()} Exam Test
          </p>

        </div>

      </footer>

    </div>
  );
}

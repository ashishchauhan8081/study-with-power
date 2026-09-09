import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

const resources = [
  {
    icon: "📚",
    title: "NCERT Books",
    text:
      "कक्षा 6 से 12 तक की NCERT पुस्तकों का अध्ययन करें।",
  },
  {
    icon: "📰",
    title: "Current Affairs",
    text:
      "प्रतिदिन के महत्वपूर्ण Current Affairs पढ़ें।",
  },
  {
    icon: "📝",
    title: "MCQ Practice",
    text:
      "विषयवार महत्वपूर्ण MCQ का अभ्यास करें।",
  },
  {
    icon: "📖",
    title: "Previous Year Questions",
    text:
      "पिछली परीक्षाओं के प्रश्नों का अभ्यास करें।",
  },
  {
    icon: "🎯",
    title: "Test Series",
    text:
      "सभी प्रमुख प्रतियोगी परीक्षाओं की Test Series।",
  },
  {
    icon: "🤖",
    title: "AI MCQ Generator",
    text:
      "AI की सहायता से नए MCQ तैयार करें।",
  },
];


// ======================================================
// HELPERS
// ======================================================

function testId(examId, number) {
  return `${examId}_test_${number}`;
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((q, index) => ({
    id: q?.id ?? index + 1,
    question: q?.question ?? q?.questionText ?? q?.text ?? "",
    options: Array.isArray(q?.options) ? q.options.slice(0, 4) : ["", "", "", ""],
    // answer को raw रूप में रखें। Firebase में यह 0/1/2/3, A/B/C/D,
    // option text, या "भाग I/भाग II..." हो सकता है।
    answer: q?.answer,
    explanation: q?.explanation ?? "",
  }));
}

// Firebase के अलग-अलग answer formats को option index (0-3) में बदलता है।
function getCorrectIndex(question) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const answer = question?.answer;

  if (!options.length || answer === undefined || answer === null) return -1;

  if (typeof answer === "number" && Number.isInteger(answer)) {
    if (answer >= 0 && answer < options.length) return answer;
    if (answer >= 1 && answer <= options.length) return answer - 1;
  }

  const raw = String(answer).trim();
  if (!raw) return -1;

  // "0", "1", "2", "3" या "1", "2", "3", "4"
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    if (n >= 0 && n < options.length) return n;
    if (n >= 1 && n <= options.length) return n - 1;
  }

  // "A", "A.", "A) Option text" आदि
  const letterMatch = raw.match(/^([ABCD])(?:\s*[.\):-]|\s*$)/i);
  if (letterMatch) {
    const idx = "ABCD".indexOf(letterMatch[1].toUpperCase());
    if (idx >= 0 && idx < options.length) return idx;
  }

  // "भाग I", "भाग II", "भाग III", "भाग IV"
  const partMatch = raw.match(/भाग\s*(I{1,3}|IV|V|1|2|3|4)\b/i);
  if (partMatch) {
    const part = partMatch[1].toUpperCase();
    const map = { I: 0, II: 1, III: 2, IV: 3, V: 4, "1": 0, "2": 1, "3": 2, "4": 3 };
    const idx = map[part];
    if (idx !== undefined && idx < options.length) return idx;
  }

  // "A. option" से prefix हटाकर option text match करें।
  const cleaned = raw.replace(/^[ABCD]\s*[.\):-]\s*/i, "").trim();
  const exact = options.findIndex((option) => String(option ?? "").trim() === raw || String(option ?? "").trim() === cleaned);
  if (exact >= 0) return exact;

  // Case/space insensitive text match
  const compact = (v) => String(v ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  const compactAnswer = compact(cleaned);
  const loose = options.findIndex((option) => compact(option) === compactAnswer);
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

  const [cloudTests, setCloudTests] =
    useState({});

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
  // LOGIN
  // ====================================================

  const login = async () => {

    try {

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      return result.user;

    } catch (error) {

      console.error(error);

      alert(
        "Login नहीं हुआ:\n" +
        error.message
      );

      return null;

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


  const openTest = async (test) => {

    // Test शुरू करने से पहले Login अनिवार्य है।
    // Login नहीं है तो Google Login खुलेगा और सफल Login के बाद ही Test खुलेगा।
    if (!user) {
      const loggedInUser = await login();

      if (!loggedInUser) {
        return;
      }
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

    // Extra security: Login के बिना Test Page कभी render नहीं होगा।
    if (!user) {
      return (
        <div className="app">
          <style>{styles}</style>
          <div className="container">
            <div className="empty-box">
              <h2>🔐 Test शुरू करने के लिए Login जरूरी है</h2>
              <p>कृपया पहले Google से Login करें।</p>
              <button className="open-btn" onClick={login}>
                🔐 Login करें
              </button>
              <button className="back" onClick={() => setPage("tests")}>
                ← वापस जाएँ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="app test-page-app">

        <style>{styles}</style>

        <main className="test-page-container">
          <TestRunner
            test={selectedTest}
            onBack={() => {
              setPage("tests");
            }}
          />
        </main>

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


              {/* ADMIN */}

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
                  onClick={login}
                >
                  🔐 Login
                </button>

              )}

            </nav>

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
                      ₹99 • PAID
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

                {resources.map(
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

                          if (
                            item.title ===
                            "Test Series"
                          ) {

                            openExam(exams[0]);

                          } else if (
                            item.title ===
                            "Current Affairs"
                          ) {

                            setPage(
                              "current"
                            );

                          } else if (
                            item.title ===
                            "MCQ Practice"
                          ) {

                            setPage("mcq");

                          } else {

                            setPage(
                              "resources"
                            );

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
                          ₹99
                        </div>

                        <button
                          onClick={() =>
                            openTest(test)
                          }
                        >
                          Start Test
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

                {resources.map(
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
  // अधिकतम 150 प्रश्न
  const questions = normalizeQuestions(
    test?.questions || []
  ).slice(0, 150);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const buttonBase = {
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const calculateResult = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const correctIndex = getCorrectIndex(q);
      if (correctIndex >= 0 && answers[index] === correctIndex) correct++;
    });
    const wrong = questions.length - correct;
    const percentage = questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0;
    return { correct, wrong, percentage };
  };

  if (!questions.length) {
    return (
      <div className="test-runner-page">
        <button
          type="button"
          onClick={onBack}
          style={{ ...buttonBase, padding: "12px 20px", background: "#e2e8f0", color: "#111827", fontSize: "17px", fontWeight: "700", marginBottom: "20px" }}
        >
          ← Test List
        </button>
        <div className="test-empty-card">
          <h2>इस Test में Questions नहीं हैं।</h2>
        </div>
      </div>
    );
  }

  // =============================
  // RESULT SCREEN
  // =============================
  if (submitted) {
    const { correct, wrong, percentage } = calculateResult();

    return (
      <div className="test-runner-page">
        <div className="test-result-card">
          <div style={{ fontSize: "52px" }}>🎉</div>
          <h1 style={{ color: "#1d4ed8", marginBottom: "8px" }}>Test Complete</h1>
          <h2 style={{ marginTop: 0 }}>{test?.title || "Test"}</h2>

          <div style={{ fontSize: "42px", fontWeight: "800", color: "#1d4ed8", margin: "20px 0 10px" }}>
            {correct} / {questions.length}
          </div>

          <p style={{ fontSize: "20px", margin: "8px 0" }}>
            प्रतिशत: <strong>{percentage}%</strong>
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", margin: "25px 0" }}>
            <div style={{ padding: "15px 25px", borderRadius: "12px", background: "#dcfce7", color: "#166534", fontWeight: "800", fontSize: "20px" }}>
              ✓ सही: {correct}
            </div>
            <div style={{ padding: "15px 25px", borderRadius: "12px", background: "#fee2e2", color: "#991b1b", fontWeight: "800", fontSize: "20px" }}>
              ✗ गलत: {wrong}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "25px" }}>
            <button
              type="button"
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setSubmitted(false);
                setReviewMode(true);
                setShowExplanation(false);
              }}
              style={{ ...buttonBase, padding: "13px 20px", background: "#1264d8", color: "#fff", fontSize: "17px", fontWeight: "700" }}
            >
              🔄 Questions Retest / व्याख्या देखें
            </button>

            <button
              type="button"
              onClick={onBack}
              style={{ ...buttonBase, padding: "13px 20px", background: "#e2e8f0", color: "#111827", fontSize: "17px", fontWeight: "700" }}
            >
              ← Test List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const selected = answers[current];
  const hasSelected = selected !== undefined;
  const correctAnswer = getCorrectIndex(question);

  const goPrevious = () => {
    setCurrent((value) => Math.max(0, value - 1));
    setShowExplanation(false);
  };

  const goNext = () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      setShowExplanation(false);
    } else {
      setSubmitted(true);
    }
  };

  const selectOption = (index) => {
    if (reviewMode && hasSelected) return;

    setAnswers((prev) => ({
      ...prev,
      [current]: index,
    }));

    if (reviewMode) {
      setShowExplanation(true);
    } else {
      // सामान्य Test में option चुनते ही अगला प्रश्न
      window.setTimeout(() => {
        if (current < questions.length - 1) {
          setCurrent((value) => value + 1);
        } else {
          setSubmitted(true);
        }
      }, 180);
    }
  };

  return (
    <div className="test-runner-page">
      <button
        type="button"
        onClick={onBack}
        style={{ ...buttonBase, padding: "12px 20px", background: "#e2e8f0", color: "#111827", fontSize: "17px", fontWeight: "700", marginBottom: "20px" }}
      >
        ← Test List
      </button>

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

            let background = "#1264d8";
            if (reviewMode && hasSelected) {
              if (isCorrect) background = "#16a34a";
              else if (isWrong) background = "#dc2626";
            } else if (isSelected) {
              background = "#2563eb";
            }

            return (
              <button
                key={index}
                type="button"
                disabled={reviewMode && hasSelected}
                onClick={() => selectOption(index)}
                style={{
                  ...buttonBase,
                  minWidth: 0,
                  maxWidth: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  minHeight: "64px",
                  margin: 0,
                  padding: "16px 20px",
                  background,
                  color: "#fff",
                  textAlign: "left",
                  fontSize: "20px",
                  fontWeight: "700",
                  lineHeight: "1.4",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  opacity: reviewMode && hasSelected && !isSelected && !isCorrect ? 0.85 : 1,
                  cursor: reviewMode && hasSelected ? "default" : "pointer",
                  boxShadow: "0 5px 15px rgba(18,100,216,.20)",
                }}
              >
                <span style={{ flex: "0 0 45px", width: "45px", fontSize: "21px", fontWeight: "800" }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                <span style={{ flex: "1 1 auto", minWidth: 0, lineHeight: "1.4" }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* EXPLANATION - केवल RETEST/REVIEW MODE में */}
        {reviewMode && showExplanation && hasSelected && (
          <div style={{ width: "100%", marginTop: "20px", padding: "18px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", boxSizing: "border-box" }}>
            <div style={{ fontSize: "19px", fontWeight: "800", marginBottom: "8px", color: selected === correctAnswer ? "#166534" : "#991b1b" }}>
              {selected === correctAnswer
                ? "✓ सही उत्तर"
                : correctAnswer >= 0
                ? `✗ गलत उत्तर — सही उत्तर: ${String.fromCharCode(65 + correctAnswer)}`
                : "✗ उत्तर जाँचने के लिए सही उत्तर उपलब्ध नहीं है"}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px", color: "#1e3a8a" }}>
              व्याख्या
            </div>
            <div style={{ fontSize: "17px", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-wrap" }}>
              {question.explanation || "इस प्रश्न की व्याख्या Admin Panel में उपलब्ध नहीं है।"}
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="test-navigation">
          <button
            type="button"
            disabled={current === 0}
            onClick={goPrevious}
            style={{ ...buttonBase, padding: "13px 22px", background: current === 0 ? "#bfdbfe" : "#1264d8", color: "#fff", fontSize: "17px", fontWeight: "700", opacity: current === 0 ? 0.75 : 1 }}
          >
            ← Previous
          </button>

          {reviewMode ? (
            <button
              type="button"
              disabled={!hasSelected}
              onClick={goNext}
              style={{ ...buttonBase, padding: "13px 22px", background: hasSelected ? (current === questions.length - 1 ? "#16a34a" : "#1264d8") : "#94a3b8", color: "#fff", fontSize: "17px", fontWeight: "700" }}
            >
              {current === questions.length - 1 ? "✓ Review Complete" : "Next →"}
            </button>
          ) : (
            <div style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>
              विकल्प चुनते ही अगला प्रश्न खुलेगा
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ========================================================
// ADMIN PANEL
// ========================================================

function createEmptyQuestion(id = 1) {
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
  };
}

function AdminPanel({
  user,
  tests,
  onClose,
}) {
  const [exam, setExam] = useState("uppcs");
  const [testNumber, setTestNumber] = useState(1);
  const [title, setTitle] = useState("UPPCS Test 01");
  const [status, setStatus] = useState("draft");

  // अब JSON नहीं — सीधे Question Form
  const [questions, setQuestions] = useState([
    createEmptyQuestion(1),
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="result-box">
          <div className="result-icon">🔐</div>
          <h1>Admin Access Denied</h1>
          <p>केवल Admin account इस panel को खोल सकता है।</p>
          <button className="primary" onClick={onClose}>
            ← Website पर जाएँ
          </button>
        </div>
      </div>
    );
  }

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const options = [...(q.options || ["", "", "", ""])];
        options[optionIndex] = value;
        return { ...q, options };
      })
    );
  };

  const addQuestion = () => {
    if (questions.length >= 150) {
      alert("अधिकतम 150 Questions ही जोड़े जा सकते हैं।");
      return;
    }

    const nextIndex = questions.length;
    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(nextIndex + 1),
    ]);
    setCurrentQuestion(nextIndex);
    setMessage(`➕ प्रश्न ${nextIndex + 1} जोड़ दिया गया।`);

    setTimeout(() => {
      document.getElementById("question-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const deleteQuestion = (index) => {
    if (questions.length === 1) {
      alert("कम से कम 1 Question होना चाहिए।");
      return;
    }

    if (!window.confirm(`प्रश्न ${index + 1} delete करना है?`)) {
      return;
    }

    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, id: i + 1 }));

    setQuestions(updated);
    setCurrentQuestion(Math.min(index, updated.length - 1));
    setMessage("🗑️ प्रश्न delete हो गया।");
  };

  const loadTest = (id, data) => {
    setExam(data.exam || "uppcs");
    setTestNumber(Number(data.testNumber || 1));
    setTitle(data.title || "");
    setStatus(data.status || "draft");

    const loaded = Array.isArray(data.questions) ? data.questions : [];
    const formatted = loaded.slice(0, 150).map((q, index) => ({
      id: index + 1,
      question: q?.question ?? q?.questionText ?? q?.text ?? "",
      options: [
        q?.options?.[0] ?? "",
        q?.options?.[1] ?? "",
        q?.options?.[2] ?? "",
        q?.options?.[3] ?? "",
      ],
      answer: Number.isFinite(Number(q?.answer)) ? Number(q.answer) : 0,
      explanation: q?.explanation ?? "",
    }));

    setQuestions(formatted.length ? formatted : [createEmptyQuestion(1)]);
    setCurrentQuestion(0);
    setMessage(`✏️ ${data.title || id} edit mode में खुल गया।`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newTest = () => {
    setExam("uppcs");
    setTestNumber(1);
    setTitle("UPPCS Test 01");
    setStatus("draft");
    setQuestions([createEmptyQuestion(1)]);
    setCurrentQuestion(0);
    setMessage("📝 नया Test तैयार है।");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateQuestions = () => {
    if (!questions.length) {
      alert("कम से कम 1 Question होना चाहिए।");
      return false;
    }

    if (questions.length > 150) {
      alert("अधिकतम 150 Questions ही save किए जा सकते हैं।");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question.trim()) {
        alert(`प्रश्न ${i + 1} खाली है।`);
        setCurrentQuestion(i);
        return false;
      }

      for (let j = 0; j < 4; j++) {
        if (!q.options?.[j]?.trim()) {
          alert(`प्रश्न ${i + 1} का विकल्प ${String.fromCharCode(65 + j)} खाली है।`);
          setCurrentQuestion(i);
          return false;
        }
      }
    }

    return true;
  };

  const saveTest = async () => {
    if (!isAdmin) {
      alert("Admin access नहीं है।");
      return;
    }

    if (!title.trim()) {
      alert("Test title डालें।");
      return;
    }

    if (!validateQuestions()) return;

    const cleanQuestions = questions.map((q, index) => ({
      id: index + 1,
      question: q.question.trim(),
      options: q.options.slice(0, 4).map((option) => option.trim()),
      answer: Number(q.answer),
      explanation: q.explanation?.trim() || "",
    }));

    const id = testId(exam, testNumber);

    const data = {
      id,
      exam,
      testNumber: Number(testNumber),
      title: title.trim(),
      status,
      questions: cleanQuestions,
      updatedAt: Date.now(),
      updatedBy: user.email,
    };

    setSaving(true);

    try {
      await set(ref(db, `tests/${id}`), data);

      setMessage(
        status === "public"
          ? "🌐 Test PUBLIC हो गया। Website पर दिखाई देगा।"
          : status === "unlisted"
          ? "🔗 Test UNLISTED हो गया।"
          : "📝 Test DRAFT में save हो गया।"
      );
    } catch (error) {
      console.error(error);
      alert("Save नहीं हुआ:\n" + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (id) => {
    if (!window.confirm("क्या आप यह Test delete करना चाहते हैं?")) return;

    try {
      await remove(ref(db, `tests/${id}`));
      setMessage("🗑️ Test delete हो गया।");
    } catch (error) {
      alert("Delete error:\n" + error.message);
    }
  };

  const testList = Object.entries(tests || {}).sort(
    (a, b) =>
      Number(a[1].testNumber || 0) - Number(b[1].testNumber || 0)
  );

  const question = questions[currentQuestion] || createEmptyQuestion(1);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <div className="admin-crown">👑</div>
          <h1>Study With Power Admin Panel</h1>
          <p>Admin: {user.email}</p>
        </div>

        <button className="admin-close" onClick={onClose}>
          ← Website
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-title-row">
          <div>
            <h2>📝 Test Manager</h2>
            <p>Test बनाएँ, Questions जोड़ें और Public/Unlisted करें।</p>
          </div>

          <button className="secondary-btn" onClick={newTest}>
            ＋ New Test
          </button>
        </div>

        <div className="admin-form">
          <div>
            <label>Exam</label>
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              {exams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Test Number</label>
            <input
              type="number"
              min="1"
              value={testNumber}
              onChange={(e) => setTestNumber(Number(e.target.value))}
            />
          </div>

          <div className="full">
            <label>Test Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="UPPCS Test 01"
            />
          </div>

          <div className="full">
            <label>Visibility / Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">📝 Draft</option>
              <option value="unlisted">🔗 Unlisted</option>
              <option value="public">🌐 Public</option>
            </select>

            <div className="status-help">
              <div>📝 <strong>Draft:</strong> काम चल रहा है।</div>
              <div>🔗 <strong>Unlisted:</strong> सामान्य Test List में नहीं दिखेगा।</div>
              <div>🌐 <strong>Public:</strong> Students की Test Series में दिखेगा।</div>
            </div>
          </div>
        </div>

        {/* ==================================================
            QUESTION FORM — JSON पूरी तरह हटाया गया
        ================================================== */}
        <div className="questions-editor" id="question-editor">
          <div className="admin-title-row" style={{ marginBottom: 15 }}>
            <div>
              <h2>📚 Question Form</h2>
              <p className="small-text">
                कुल {questions.length} / 150 प्रश्न
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={addQuestion}
              disabled={questions.length >= 150}
            >
              {questions.length >= 150
                ? "✓ 150 Questions"
                : "＋ Add Question"}
            </button>
          </div>

          {/* Question navigation */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {questions.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentQuestion(index)}
                style={{
                  width: 40,
                  height: 40,
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  background:
                    currentQuestion === index ? "#16a34a" : "#2563eb",
                  color: "white",
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div
            style={{
              border: "1px solid #dbeafe",
              borderRadius: 14,
              padding: 20,
              background: "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0 }}>
                प्रश्न {currentQuestion + 1}
              </h3>

              <button
                type="button"
                className="danger-btn"
                onClick={() => deleteQuestion(currentQuestion)}
              >
                🗑️ Delete Question
              </button>
            </div>

            <label style={{ display: "block", marginTop: 18 }}>
              प्रश्न
            </label>
            <textarea
              value={question.question}
              onChange={(e) =>
                updateQuestion(currentQuestion, "question", e.target.value)
              }
              placeholder="यहाँ प्रश्न लिखें..."
              style={{
                width: "100%",
                minHeight: 110,
                marginTop: 8,
                padding: 12,
                boxSizing: "border-box",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 17,
                fontFamily: "inherit",
              }}
            />

            <h3 style={{ marginTop: 22 }}>विकल्प</h3>

            {question.options.map((option, index) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <strong
                    style={{
                      minWidth: 32,
                      fontSize: 18,
                    }}
                  >
                    {String.fromCharCode(65 + index)}.
                  </strong>

                  <input
                    value={option}
                    onChange={(e) =>
                      updateOption(
                        currentQuestion,
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: 16,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(currentQuestion, "answer", index)
                    }
                    style={{
                      padding: "10px 12px",
                      border: 0,
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        Number(question.answer) === index
                          ? "#16a34a"
                          : "#e2e8f0",
                      color:
                        Number(question.answer) === index
                          ? "#fff"
                          : "#334155",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Number(question.answer) === index
                      ? "✓ सही उत्तर"
                      : "सही चुनें"}
                  </button>
                </div>
              </div>
            ))}

            <label style={{ display: "block", marginTop: 22 }}>
              व्याख्या
            </label>
            <textarea
              value={question.explanation}
              onChange={(e) =>
                updateQuestion(
                  currentQuestion,
                  "explanation",
                  e.target.value
                )
              }
              placeholder="सही उत्तर की व्याख्या लिखें..."
              style={{
                width: "100%",
                minHeight: 120,
                marginTop: 8,
                padding: 12,
                boxSizing: "border-box",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                fontFamily: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="secondary-btn"
                disabled={currentQuestion === 0}
                onClick={() =>
                  setCurrentQuestion((value) => Math.max(0, value - 1))
                }
              >
                ← पिछला
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion((value) => value + 1);
                  } else {
                    addQuestion();
                  }
                }}
              >
                {currentQuestion < questions.length - 1
                  ? "अगला →"
                  : "＋ नया प्रश्न"}
              </button>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <button className="save-btn" disabled={saving} onClick={saveTest}>
            {saving ? "⏳ Saving..." : "💾 Save Test"}
          </button>

          <button className="secondary-btn" onClick={newTest}>
            Clear / New
          </button>
        </div>

        {message && <div className="success-message">{message}</div>}
      </div>

      <div className="admin-card">
        <h2>📚 सभी Saved Tests</h2>
        <p className="small-text">
          यहाँ से किसी भी Test को Edit, Delete या उसका Status बदल सकते हैं।
        </p>

        {testList.length === 0 ? (
          <div className="admin-empty">
            <div>📭</div>
            <h3>अभी कोई Test नहीं है।</h3>
            <p>ऊपर New Test से शुरुआत करें।</p>
          </div>
        ) : (
          <div className="admin-test-list">
            {testList.map(([id, data]) => (
              <div className="admin-test-row" key={id}>
                <div className="admin-test-info">
                  <div className="test-status">
                    {data.status === "public"
                      ? "🌐 PUBLIC"
                      : data.status === "unlisted"
                      ? "🔗 UNLISTED"
                      : "📝 DRAFT"}
                  </div>

                  <h3>{data.title}</h3>
                  <p>
                    {data.exam?.toUpperCase()} • Test {data.testNumber} • {data.questions?.length || 0} Questions
                  </p>
                  <small>ID: {id}</small>
                </div>

                <div className="admin-test-buttons">
                  <button onClick={() => loadTest(id, data)}>✏️ Edit</button>
                  <button className="danger-btn" onClick={() => deleteTest(id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
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

.options-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
}

.option {
  display: flex !important;
  position: static !important;
  float: none !important;
  align-items: flex-start;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box;
  flex: 0 0 auto;
  text-align: left;
  padding: 14px 16px;
  margin: 0 !important;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 17px;
  line-height: 1.5;
  white-space: normal !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.option-label {
  flex: 0 0 32px;
}

.option-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.option:hover {
  background: #eff6ff;
  border-color: #60a5fa;
}

.option.selected {
  background: #dbeafe;
  border: 2px solid #2563eb;
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

`;

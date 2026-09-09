import { auth, googleProvider } from "./firebase";
import React, { useEffect, useMemo, useState } from "react";

import {
  initializeApp,
  getApps,
} from "firebase/app";

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


// ======================================================
// FIREBASE
// ======================================================



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
    id: q.id ?? index + 1,
    question:
      q.question ??
      q.questionText ??
      q.text ??
      "",
    options: Array.isArray(q.options)
      ? q.options
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

      await signInWithPopup(
        auth,
        googleProvider
      );

    } catch (error) {

      console.error(error);

      alert(
        "Login नहीं हुआ:\n" +
        error.message
      );

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

    return (
      <div className="app">

        <style>{styles}</style>

        <TestRunner
          test={selectedTest}
          onBack={() => {
            setPage("tests");
          }}
        />

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

function TestRunner({ test, onBack }) {
  const questions = normalizeQuestions(test?.questions);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (!questions.length) {
    return (
      <div className="container">
        <button className="back" onClick={onBack}>← Test List</button>
        <div className="empty-box">
          <h2>इस Test में Questions नहीं हैं।</h2>
        </div>
      </div>
    );
  }

  const calculateScore = () =>
    questions.reduce(
      (total, q, index) =>
        total + (answers[index] === Number(q.answer) ? 1 : 0),
      0
    );

  if (submitted) {
    const score = calculateScore();
    const wrong = Object.keys(answers).filter(
      (key) => answers[key] !== Number(questions[Number(key)].answer)
    ).length;
    const unanswered = Math.max(0, questions.length - Object.keys(answers).length);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="container">
        <div className="result-box">
          <div className="result-icon">🎉</div>
          <h1>Test Complete</h1>
          <h2>{test?.title || "Test"}</h2>

          <div className="score">{score} / {questions.length}</div>
          <p>सही उत्तर: <strong>{score}</strong></p>
          <p>गलत उत्तर: <strong>{wrong}</strong></p>
          <p>छोड़े गए प्रश्न: <strong>{unanswered}</strong></p>
          <p>आपका Score: <strong>{percentage}%</strong></p>

          <div className="result-actions">
            <button
              className="primary"
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setSubmitted(false);
                setReviewMode(true);
                setRevealed(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              🔄 Test दोबारा दें + व्याख्या देखें
            </button>

            <button className="back" onClick={onBack}>
              ← Test List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const selected = answers[current];
  const correctAnswer = Number(question.answer);
  const hasSelected = selected !== undefined && selected !== null;

  const selectOption = (index) => {
    setAnswers((prev) => ({ ...prev, [current]: index }));

    if (reviewMode) {
      setRevealed(true);
      return;
    }

    // पहली बार Test देने पर option चुनते ही अगला प्रश्न।
    if (current === questions.length - 1) {
      setSubmitted(true);
      return;
    }

    setTimeout(() => {
      setCurrent((value) => Math.min(questions.length - 1, value + 1));
      setRevealed(false);
    }, 180);
  };

  const goNext = () => {
    if (current === questions.length - 1) {
      setSubmitted(true);
      return;
    }
    setCurrent((value) => Math.min(questions.length - 1, value + 1));
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container">
      <button className="back" onClick={onBack}>← Test List</button>

      <div className="question-box">
        <div className="question-header">
          <strong>{test?.title || "Test"}</strong>
          <span>प्रश्न {current + 1} / {questions.length}</span>
        </div>

        <h2>{current + 1}. {question.question}</h2>

        <div className="options-list">
          {(question.options || []).slice(0, 4).map((option, index) => {
            const isCorrect = index === correctAnswer;
            const isSelected = selected === index;
            let background = "#1264d8";
            let border = "2px solid transparent";

            if (reviewMode && revealed) {
              if (isCorrect) {
                background = "#16a34a";
                border = "2px solid #15803d";
              } else if (isSelected) {
                background = "#dc2626";
                border = "2px solid #b91c1c";
              }
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => selectOption(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "16px 20px",
                  margin: "0 0 12px 0",
                  border,
                  borderRadius: "12px",
                  background,
                  color: "white",
                  textAlign: "left",
                  fontSize: "20px",
                  fontWeight: "600",
                  lineHeight: "1.4",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(18,100,216,.18)",
                }}
              >
                <strong style={{ width: "45px", flexShrink: 0 }}>
                  {String.fromCharCode(65 + index)}.
                </strong>
                <span style={{ flex: 1 }}>{option}</span>
              </button>
            );
          })}
        </div>

        {reviewMode && revealed && (
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "12px",
              background: selected === correctAnswer ? "#ecfdf5" : "#fef2f2",
              border: selected === correctAnswer
                ? "1px solid #86efac"
                : "1px solid #fecaca",
              color: "#172033",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: selected === correctAnswer ? "#15803d" : "#b91c1c",
                marginBottom: "8px",
              }}
            >
              {selected === correctAnswer ? "✓ सही उत्तर" : "✗ गलत उत्तर"}
            </div>

            <div style={{ fontSize: "18px", marginBottom: "8px" }}>
              <strong>सही उत्तर:</strong> {String.fromCharCode(65 + correctAnswer)}. {question.options[correctAnswer]}
            </div>

            {question.explanation && (
              <div style={{ fontSize: "17px", lineHeight: "1.6" }}>
                <strong>व्याख्या:</strong> {question.explanation}
              </div>
            )}
          </div>
        )}

        <div className="test-navigation">
          <button
            className="back"
            disabled={current === 0}
            onClick={() => {
              setCurrent((value) => Math.max(0, value - 1));
              setRevealed(false);
            }}
          >
            ← Previous
          </button>

          {reviewMode ? (
            <button className="primary" onClick={goNext} disabled={!hasSelected}>
              {current === questions.length - 1 ? "✓ Submit Test" : "Next →"}
            </button>
          ) : (
            <span style={{ color: "#64748b", fontSize: "14px" }}>
              Option चुनते ही अगला प्रश्न आएगा
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


// ========================================================
// ADMIN PANEL
// ========================================================

function AdminPanel({ user, tests, onClose }) {
  const [exam, setExam] = useState("uppcs");
  const [testNumber, setTestNumber] = useState(1);
  const [title, setTitle] = useState("UPPCS Test 01");
  const [status, setStatus] = useState("draft");

  const emptyQuestion = (id = 1) => ({
    id,
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
  });

  const [questions, setQuestions] = useState([emptyQuestion(1)]);
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
          <button className="primary" onClick={onClose}>← Website पर जाएँ</button>
        </div>
      </div>
    );
  }

  const loadTest = (id, data) => {
    setExam(data.exam || "uppcs");
    setTestNumber(data.testNumber || 1);
    setTitle(data.title || "");
    setStatus(data.status || "draft");

    const loaded = normalizeQuestions(data.questions || []);
    setQuestions(loaded.length ? loaded : [emptyQuestion(1)]);
    setMessage(`✏️ ${data.title || id} edit mode में खुल गया।`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newTest = () => {
    setExam("uppcs");
    setTestNumber(1);
    setTitle("UPPCS Test 01");
    setStatus("draft");
    setQuestions([emptyQuestion(1)]);
    setMessage("📝 नया Test तैयार है।");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === qIndex ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (qIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, index) => {
        if (index !== qIndex) return q;
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
    setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)]);
    setMessage(`➕ Question ${questions.length + 1} जोड़ा गया।`);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) {
      alert("कम से कम 1 Question होना चाहिए।");
      return;
    }
    setQuestions((prev) =>
      prev
        .filter((_, index) => index !== qIndex)
        .map((q, index) => ({ ...q, id: index + 1 }))
    );
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

    if (!questions.length) {
      alert("कम से कम 1 Question होना चाहिए।");
      return;
    }

    if (questions.length > 150) {
      alert("अधिकतम 150 Questions ही save किए जा सकते हैं।");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!String(q.question || "").trim()) {
        alert(`Question ${i + 1} का प्रश्न खाली है।`);
        return;
      }
      if (!Array.isArray(q.options) || q.options.length < 4 || q.options.some((x) => !String(x || "").trim())) {
        alert(`Question ${i + 1} के A, B, C, D चारों options भरें।`);
        return;
      }
      if (Number(q.answer) < 0 || Number(q.answer) > 3) {
        alert(`Question ${i + 1} का सही उत्तर चुनें।`);
        return;
      }
    }

    const id = testId(exam, testNumber);
    const cleanQuestions = questions.map((q, index) => ({
      id: index + 1,
      question: String(q.question || "").trim(),
      options: [0, 1, 2, 3].map((i) => String(q.options?.[i] || "").trim()),
      answer: Number(q.answer),
      explanation: String(q.explanation || "").trim(),
    }));

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
      setQuestions(cleanQuestions);
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
    (a, b) => Number(a[1].testNumber || 0) - Number(b[1].testNumber || 0)
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <div className="admin-crown">👑</div>
          <h1>Study With Power Admin Panel</h1>
          <p>Admin: {user.email}</p>
        </div>
        <button className="admin-close" onClick={onClose}>← Website</button>
      </div>

      <div className="admin-card">
        <div className="admin-title-row">
          <div>
            <h2>📝 Test Manager</h2>
            <p>Test बनाएँ, Questions जोड़ें और Public/Unlisted करें।</p>
          </div>
          <button className="secondary-btn" onClick={newTest}>＋ New Test</button>
        </div>

        <div className="admin-form">
          <div>
            <label>Exam</label>
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              {exams.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
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
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="UPPCS Test 01" />
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

        {/* QUESTION FORM — अब JSON नहीं */}
        <div className="questions-form">
          <div className="questions-form-header">
            <div>
              <h2>📚 Questions</h2>
              <p className="small-text">
                यहाँ सीधे Question, A/B/C/D, सही उत्तर और व्याख्या भरें। अधिकतम 150 Questions।
              </p>
            </div>
            <strong>{questions.length} / 150</strong>
          </div>

          {questions.map((q, qIndex) => (
            <div className="question-editor-card" key={q.id || qIndex}>
              <div className="question-editor-title">
                <h3>प्रश्न {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button className="danger-btn" type="button" onClick={() => removeQuestion(qIndex)}>
                    🗑️ हटाएँ
                  </button>
                )}
              </div>

              <label>Question</label>
              <textarea
                className="admin-question-input"
                rows="3"
                value={q.question || ""}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                placeholder={`प्रश्न ${qIndex + 1} यहाँ लिखें...`}
              />

              <div className="admin-options-grid">
                {[0, 1, 2, 3].map((optionIndex) => (
                  <div key={optionIndex}>
                    <label>{String.fromCharCode(65 + optionIndex)}. Option</label>
                    <input
                      value={q.options?.[optionIndex] || ""}
                      onChange={(e) => updateOption(qIndex, optionIndex, e.target.value)}
                      placeholder={`${String.fromCharCode(65 + optionIndex)} option`}
                    />
                  </div>
                ))}
              </div>

              <div className="admin-answer-row">
                <div>
                  <label>सही उत्तर</label>
                  <select
                    value={Number(q.answer ?? 0)}
                    onChange={(e) => updateQuestion(qIndex, "answer", Number(e.target.value))}
                  >
                    <option value={0}>A. {q.options?.[0] || "Option A"}</option>
                    <option value={1}>B. {q.options?.[1] || "Option B"}</option>
                    <option value={2}>C. {q.options?.[2] || "Option C"}</option>
                    <option value={3}>D. {q.options?.[3] || "Option D"}</option>
                  </select>
                </div>
              </div>

              <label>व्याख्या / Explanation</label>
              <textarea
                className="admin-question-input"
                rows="3"
                value={q.explanation || ""}
                onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                placeholder="सही उत्तर की व्याख्या यहाँ लिखें..."
              />
            </div>
          ))}

          <button
            className="add-question-btn"
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 150}
          >
            ＋ Question जोड़ें ({questions.length}/150)
          </button>
        </div>

        <div className="admin-actions">
          <button className="save-btn" disabled={saving} onClick={saveTest}>
            {saving ? "⏳ Saving..." : "💾 Save Test"}
          </button>
          <button className="secondary-btn" onClick={newTest}>Clear / New</button>
        </div>

        {message && <div className="success-message">{message}</div>}
      </div>

      <div className="admin-card">
        <h2>📚 सभी Saved Tests</h2>
        <p className="small-text">यहाँ से किसी भी Test को Edit या Delete कर सकते हैं।</p>

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
                    {data.status === "public" ? "🌐 PUBLIC" : data.status === "unlisted" ? "🔗 UNLISTED" : "📝 DRAFT"}
                  </div>
                  <h3>{data.title}</h3>
                  <p>
                    {data.exam?.toUpperCase()} • Test {data.testNumber} • {data.questions?.length || 0} Questions
                  </p>
                  <small>ID: {id}</small>
                </div>

                <div className="admin-test-buttons">
                  <button onClick={() => loadTest(id, data)}>✏️ Edit</button>
                  <button className="danger-btn" onClick={() => deleteTest(id)}>🗑️ Delete</button>
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

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

body {
  margin: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 20px;
  overflow-x: hidden;
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  overflow: hidden;
}

.exam-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
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
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.exam-card h3,
.exam-card .paid,
.exam-card .open-btn {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  max-width: 100%;
  min-width: 0;
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

@media(max-width: 1100px) {
  .exam-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .test-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media(max-width: 800px) {
  .exam-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .test-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    grid-template-columns: 1fr;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .test-grid {
    grid-template-columns: 1fr;
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


/* QUESTION FORM */
.questions-form {
  margin-top: 25px;
}

.questions-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.questions-form-header h2 {
  margin: 0 0 5px;
}

.question-editor-card {
  background: #f8fafc;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}

.question-editor-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.question-editor-title h3 {
  margin: 0;
  color: #1e3a8a;
}

.admin-question-input {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  padding: 12px;
  font-size: 16px;
  background: white;
  margin-bottom: 14px;
}

.admin-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.admin-options-grid input,
.admin-answer-row select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-size: 15px;
  background: white;
}

.admin-answer-row {
  margin-bottom: 14px;
}

.admin-answer-row > div {
  max-width: 500px;
}

.add-question-btn {
  width: 100%;
  border: 2px dashed #60a5fa;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
}

.add-question-btn:disabled {
  opacity: .55;
}

.danger-btn {
  border: none;
  background: #dc2626;
  color: white;
  padding: 9px 12px;
  border-radius: 8px;
  font-weight: bold;
}

@media(max-width: 650px) {
  .admin-options-grid {
    grid-template-columns: 1fr;
  }

  .questions-form-header,
  .question-editor-title {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;


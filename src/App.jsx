import React, { useEffect, useState } from "react";
import "./App.css";

import { getApps, getApp, initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
} from "firebase/database";

import firebaseConfig from "./firebase-config.json";

import TestPage from "./pages/TestPage";

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
// EXAMS
// ======================================================

const exams = [
  {
    id: "upsc",
    name: "UPSC",
    icon: "🇮🇳",
    desc: "UPSC Civil Services परीक्षा स्तर",
  },
  {
    id: "uppcs",
    name: "UPPCS",
    icon: "🏛️",
    desc: "UPPCS परीक्षा स्तर",
  },
  {
    id: "uppet",
    name: "UP PET",
    icon: "🎯",
    desc: "UP PET परीक्षा स्तर",
  },
  {
    id: "bpsc",
    name: "BPSC",
    icon: "🏛️",
    desc: "BPSC परीक्षा स्तर",
  },
  {
    id: "mppsc",
    name: "MPPSC",
    icon: "📚",
    desc: "MPPSC परीक्षा स्तर",
  },
  {
    id: "ssc",
    name: "SSC",
    icon: "📝",
    desc: "SSC परीक्षा स्तर",
  },
  {
    id: "railway",
    name: "Railway",
    icon: "🚆",
    desc: "Railway / RRB परीक्षा स्तर",
  },
  {
    id: "banking",
    name: "Banking",
    icon: "🏦",
    desc: "Banking परीक्षा स्तर",
  },
  {
    id: "upsssc",
    name: "UPSSSC",
    icon: "📖",
    desc: "UPSSSC परीक्षा स्तर",
  },
  {
    id: "roaro",
    name: "RO/ARO",
    icon: "📜",
    desc: "RO / ARO परीक्षा स्तर",
  },
  {
    id: "police",
    name: "Police",
    icon: "👮",
    desc: "Police परीक्षा स्तर",
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: "👨‍🏫",
    desc: "Teaching परीक्षा स्तर",
  },
];

// ======================================================
// SHORTCUTS
// ======================================================

const shortcuts = [
  {
    icon: "📖",
    title: "NCERT Books",
    subtitle: "कक्षा 6 से 12 तक",
  },
  {
    icon: "📰",
    title: "Current Affairs",
    subtitle: "प्रतिदिन अपडेट",
  },
  {
    icon: "☑️",
    title: "MCQ Practice",
    subtitle: "विषयवार अभ्यास",
  },
  {
    icon: "📊",
    title: "Previous Year",
    subtitle: "पिछले वर्षों के प्रश्न",
  },
];

// ======================================================
// APP
// ======================================================

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ====================================================
  // PAGE
  // ====================================================

  const [page, setPage] = useState("home");

  // ====================================================
  // FIREBASE TESTS
  // ====================================================

  const [tests, setTests] = useState({});

  const [loadingTests, setLoadingTests] = useState(false);

  // ====================================================
  // SELECTED EXAM
  // ====================================================

  const [selectedExam, setSelectedExam] = useState(null);

  // ====================================================
  // SELECTED TEST
  // ====================================================

  const [selectedTest, setSelectedTest] = useState(null);

  // ====================================================
  // LOAD FIREBASE TESTS
  // ====================================================

  useEffect(() => {
    const testsRef = ref(db, "tests");

    const unsubscribe = onValue(
      testsRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        setTests(data);
        setLoadingTests(false);
      },
      (error) => {
        console.error("Tests load error:", error);
        setTests({});
        setLoadingTests(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // START EXAM
  // ====================================================

  const startExam = () => {
    document
      .getElementById("exam-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // ====================================================
  // OPEN EXAM
  // ====================================================

  const handleExamClick = (exam) => {
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

  const openTest = (test) => {
    setSelectedTest(test);
    setPage("test");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // BACK TO HOME
  // ====================================================

  const backToHome = () => {
    setSelectedExam(null);
    setSelectedTest(null);
    setPage("home");

    setTimeout(() => {
      document
        .getElementById("exam-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 50);
  };

  // ====================================================
  // BACK TO TEST LIST
  // ====================================================

  const backToTests = () => {
    setSelectedTest(null);
    setPage("tests");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // CURRENT EXAM TESTS
  // ====================================================

  const currentExamTests = selectedExam
    ? Object.values(tests || {})
        .filter(
          (test) =>
            test &&
            test.exam === selectedExam.id &&
            test.status === "public"
        )
        .sort(
          (a, b) =>
            Number(a.testNumber || 0) -
            Number(b.testNumber || 0)
        )
    : [];

  // ====================================================
  // TEST PAGE
  // ====================================================

  if (page === "test" && selectedTest) {
    return (
      <TestPage
        test={selectedTest}
        onBack={backToTests}
      />
    );
  }

  // ====================================================
  // TEST LIST PAGE
  // ====================================================

  if (page === "tests" && selectedExam) {
    return (
      <div className="app">

        {/* HEADER */}

        <header className="header">

          <div className="brand">

            <div className="logo">
              📝
            </div>

            <div className="brand-text">

              <h1>Exam Test</h1>

              <p>
                Prepare Today | Succeed Tomorrow
              </p>

            </div>

          </div>

        </header>

        {/* TEST LIST */}

        <main>

          <section
            style={{
              padding: "35px 20px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >

            {/* BACK */}

            <button
              onClick={backToHome}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#fff",
                padding: "11px 18px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "25px",
              }}
            >
              ⬅️ वापस Exam List
            </button>

            {/* TITLE */}

            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
              }}
            >

              <div
                style={{
                  fontSize: "55px",
                }}
              >
                {selectedExam.icon}
              </div>

              <h1
                style={{
                  margin: "8px 0",
                  color: "#0f172a",
                }}
              >
                {selectedExam.name} Test Series
              </h1>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "17px",
                }}
              >
                {selectedExam.desc}
              </p>

            </div>

            {/* LOADING */}

            {loadingTests && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                ⏳ Tests Loading...
              </div>
            )}

            {/* NO TEST */}

            {!loadingTests &&
              currentExamTests.length === 0 && (
                <div
                  style={{
                    maxWidth: "600px",
                    margin: "30px auto",
                    padding: "35px 20px",
                    textAlign: "center",
                    background: "#fff",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,.08)",
                  }}
                >

                  <div
                    style={{
                      fontSize: "55px",
                    }}
                  >
                    📚
                  </div>

                  <h2>
                    अभी कोई Test उपलब्ध नहीं है
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                    }}
                  >
                    इस Exam के Tests Admin Panel
                    से Public होने के बाद यहाँ दिखाई
                    देंगे।
                  </p>

                </div>
              )}

            {/* TESTS */}

            {!loadingTests &&
              currentExamTests.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(280px,1fr))",
                    gap: "18px",
                  }}
                >

                  {currentExamTests.map(
                    (test) => (
                      <div
                        key={test.id}
                        style={{
                          background: "#fff",
                          borderRadius: "18px",
                          padding: "22px",
                          border:
                            "1px solid #e2e8f0",
                          boxShadow:
                            "0 7px 22px rgba(0,0,0,.07)",
                        }}
                      >

                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#2563eb",
                            marginBottom: "8px",
                          }}
                        >
                          📝 TEST{" "}
                          {test.testNumber}
                        </div>

                        <h2
                          style={{
                            margin:
                              "5px 0 12px",
                            color: "#111827",
                            fontSize: "21px",
                          }}
                        >
                          {test.title ||
                            `Test ${test.testNumber}`}
                        </h2>

                        <div
                          style={{
                            color: "#64748b",
                            lineHeight: "1.8",
                            marginBottom: "15px",
                          }}
                        >

                          <div>
                            ❓ Questions:{" "}
                            {test.totalQuestions ||
                              test.questions?.length ||
                              0}
                          </div>

                          <div>
                            ⏱️ Duration:{" "}
                            {test.duration ||
                              30} मिनट
                          </div>

                          <div>
                            💰 Price: ₹
                            {Number(
                              test.price || 0
                            )}
                          </div>

                        </div>

                        <button
                          onClick={() =>
                            openTest(test)
                          }
                          style={{
                            width: "100%",
                            border: "none",
                            borderRadius: "11px",
                            padding: "13px",
                            background:
                              "#2563eb",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: "800",
                            cursor: "pointer",
                          }}
                        >
                          ▶️ Start Test
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

          </section>

        </main>

      </div>
    );
  }

  // ====================================================
  // HOME PAGE
  // ====================================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="logo">
            📝
          </div>

          <div className="brand-text">

            <h1>Exam Test</h1>

            <p>
              Prepare Today | Succeed Tomorrow
            </p>

          </div>

        </div>

        <button
          className="menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          ☰
        </button>

      </header>

      {/* NAVIGATION */}

      <nav
        className={`navbar ${
          menuOpen ? "show" : ""
        }`}
      >

        <button
          className="nav-item active"
          onClick={() => {
            setPage("home");

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          🏠 Home
        </button>

        <button
          className="nav-item"
          onClick={startExam}
        >
          📄 Exam Test
        </button>

        <button className="nav-profile">
          👤
        </button>

      </nav>

      {/* HERO */}

      <main>

        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              🎯 Competitive Exam Preparation
            </div>

            <h2>
              Welcome to
              <br />
              <span>Exam Test</span>
            </h2>

            <p>
              UPSC, UPPCS, UP PET, SSC, Railway,
              Banking और अन्य प्रतियोगी परीक्षाओं
              के लिए Online Exam Test Series।
            </p>

            <button
              className="start-btn"
              onClick={startExam}
            >
              ▶️ Start Exam Test
            </button>

          </div>

          <div className="hero-image">

            <div className="books">
              🎓
            </div>

            <div className="hero-books">
              📘
              <br />
              📙
              <br />
              📗
            </div>

            <div className="hero-tagline">
              Learn Today
              <br />
              Lead Tomorrow
            </div>

          </div>

        </section>

        {/* SHORTCUTS */}

        <section className="shortcuts">

          {shortcuts.map(
            (item, index) => (
              <div
                className={`shortcut shortcut-${index}`}
                key={item.title}
              >

                <div className="shortcut-icon">
                  {item.icon}
                </div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.subtitle}
                </p>

              </div>
            )
          )}

        </section>

        {/* EXAM SECTION */}

        <section
          className="exam-section"
          id="exam-section"
        >

          <div className="section-heading">

            <h2>
              🎯 Exam Test
            </h2>

            <p>
              अपनी परीक्षा चुनें और Test शुरू करें
            </p>

            <div className="heading-line"></div>

          </div>

          {/* EXAM GRID */}

          <div className="exam-grid">

            {exams.map(
              (exam, index) => (

                <div
                  className={`exam-card card-${
                    index % 6
                  }`}
                  key={exam.id}
                >

                  <div className="exam-icon">
                    {exam.icon}
                  </div>

                  <h3>
                    {exam.name}
                  </h3>

                  <p>
                    {exam.desc}
                  </p>

                  <button
                    className="view-btn"
                    onClick={() =>
                      handleExamClick(
                        exam
                      )
                    }
                  >
                    View Tests →
                  </button>

                </div>

              )
            )}

          </div>

        </section>

        {/* PROMO */}

        <section className="promo">

          ⭐ Study Smart&nbsp; | &nbsp;
          Practice Daily&nbsp; | &nbsp;
          Crack Your Dream

        </section>

      </main>

      {/* FOOTER */}

      <footer className="footer">

        © 2026 Exam Test. All Rights Reserved.

      </footer>

      {/* HELP */}

      <button
        className="help-btn"
        onClick={() =>
          alert(
            "Exam Test Support\n\nजल्द ही Support System उपलब्ध होगा।"
          )
        }
      >
        💬
      </button>

    </div>
  );
}

export default App;

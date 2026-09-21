import React, { useEffect, useState } from "react";
import "./App.css";

import TestSeries from "./TestSeries";
import HelpChat from "./HelpChat";
import Login from "./Login";

import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";

// ======================================================
// FIREBASE
// ======================================================

import {
  getApps,
  getApp,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import firebaseConfig from "./firebase-config.json";

// ======================================================
// FIREBASE INITIALIZE
// ======================================================

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      databaseURL:
        firebaseConfig.databaseURL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

const auth = getAuth(firebaseApp);

// ======================================================
// ADMIN EMAIL
// ======================================================

const ADMIN_EMAIL = "cciashish@gmail.com";

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
  // ====================================================
  // MENU
  // ====================================================

  const [menuOpen, setMenuOpen] =
    useState(false);

  // ====================================================
  // SELECTED EXAM
  // ====================================================

  const [selectedExam, setSelectedExam] =
    useState(null);

  // ====================================================
  // NORMAL LOGIN
  // ====================================================

  const [showLogin, setShowLogin] =
    useState(false);

  // ====================================================
  // ADMIN LOGIN
  // ====================================================

  const [showAdminLogin, setShowAdminLogin] =
    useState(false);

  // ====================================================
  // ADMIN PANEL
  // ====================================================

  const [showAdminPanel, setShowAdminPanel] =
    useState(false);

  // ====================================================
  // FIREBASE USER
  // ====================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  // ====================================================
  // FIREBASE AUTH LISTENER
  // ====================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);
          setAuthLoading(false);

          // ------------------------------------------
          // ADMIN USER LOGIN
          // ------------------------------------------

          if (
            user &&
            user.email === ADMIN_EMAIL
          ) {
            // अगर Admin Login से आया है
            // तो Admin Panel खोल देंगे
            if (showAdminLogin) {
              setShowAdminLogin(false);
              setShowAdminPanel(true);
            }
          }
        }
      );

    return () => unsubscribe();
  }, [showAdminLogin]);

  // ====================================================
  // EXAM CLICK
  // ====================================================

  const handleExamClick = (exam) => {
    setSelectedExam(exam.name);

    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // BACK TO HOME
  // ====================================================

  const handleBack = () => {
    setSelectedExam(null);

    setTimeout(() => {
      document
        .getElementById("exam-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // ====================================================
  // START EXAM
  // ====================================================

  const startExam = () => {
    document
      .getElementById("exam-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setMenuOpen(false);
  };

  // ====================================================
  // OPEN ADMIN
  // ====================================================

  const openAdmin = () => {
    setMenuOpen(false);

    // अगर Admin पहले से login है
    if (
      currentUser &&
      currentUser.email === ADMIN_EMAIL
    ) {
      setShowAdminPanel(true);
      setShowAdminLogin(false);
      return;
    }

    // नहीं तो Admin Login
    setShowAdminLogin(true);
    setShowAdminPanel(false);
  };

  // ====================================================
  // CLOSE ADMIN LOGIN
  // ====================================================

  const closeAdminLogin = () => {
    setShowAdminLogin(false);
  };

  // ====================================================
  // CLOSE ADMIN PANEL
  // ====================================================

  const closeAdminPanel = () => {
    setShowAdminPanel(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          background: "#f4f7fb",
        }}
      >
        ⏳ Loading...
      </div>
    );
  }

  // ====================================================
  // ADMIN PANEL
  // ====================================================

  if (showAdminPanel) {
    return (
      <AdminPanel
        user={currentUser}
        onClose={closeAdminPanel}
      />
    );
  }

  // ====================================================
  // ADMIN LOGIN
  // ====================================================

  if (showAdminLogin) {
    return (
      <AdminLogin
        onBack={closeAdminLogin}
      />
    );
  }

  // ====================================================
  // NORMAL USER LOGIN
  // ====================================================

  if (showLogin) {
    return (
      <Login
        onBack={() => {
          setShowLogin(false);
        }}
      />
    );
  }

  // ====================================================
  // TEST SERIES
  // ====================================================

  if (selectedExam) {
    return (
      <TestSeries
        exam={selectedExam}
        onBack={handleBack}
      />
    );
  }

  // ====================================================
  // HOME PAGE
  // ====================================================

  return (
    <div className="app">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="header">

        <div className="brand">

          <div className="logo">
            📝
          </div>

          <div className="brand-text">

            <h1>
              Exam Test
            </h1>

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
          aria-label="Menu"
        >
          ☰
        </button>

      </header>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className={`navbar ${
          menuOpen ? "show" : ""
        }`}
      >

        {/* HOME */}

        <button
          className="nav-item active"
          onClick={() => {

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });

            setMenuOpen(false);
          }}
        >
          🏠 Home
        </button>

        {/* EXAM TEST */}

        <button
          className="nav-item"
          onClick={() => {
            startExam();
          }}
        >
          📄 Exam Test
        </button>

        {/* LOGIN */}

        <button
          className="nav-item"
          onClick={() => {

            setShowLogin(true);
            setMenuOpen(false);

          }}
        >
          👤 Login
        </button>

        {/* ADMIN */}

        <button
          className="nav-item"
          onClick={openAdmin}
        >
          🔐 Admin Panel
        </button>

      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main>

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              🎯 Competitive Exam Preparation
            </div>

            <h2>

              Welcome to

              <br />

              <span>
                Exam Test
              </span>

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

          {/* HERO IMAGE */}

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

        {/* ==================================================
            SHORTCUTS
        ================================================== */}

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

        {/* ==================================================
            EXAM SECTION
        ================================================== */}

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

        {/* ==================================================
            PROMO
        ================================================== */}

        <section className="promo">

          ⭐ Study Smart
          &nbsp; | &nbsp;
          Practice Daily
          &nbsp; | &nbsp;
          Crack Your Dream

        </section>

      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">

        © 2026 Exam Test. All Rights Reserved.

      </footer>

      {/* ==================================================
          HELP CHAT
      ================================================== */}

      <HelpChat />

    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import "./App.css";

import TestSeries from "./TestSeries";
import HelpChat from "./HelpChat";
import Login from "./Login";
import AdminPanel from "./pages/AdminPanel";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

const ADMIN_EMAIL = "cciashish@gmail.com";

const auth = getAuth();

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

function App() {
  // ==================================================
  // MENU
  // ==================================================

  const [menuOpen, setMenuOpen] = useState(false);

  // ==================================================
  // SELECTED EXAM
  // ==================================================

  const [selectedExam, setSelectedExam] = useState(null);

  // ==================================================
  // LOGIN PAGE
  // ==================================================

  const [showLogin, setShowLogin] = useState(false);

  // ==================================================
  // ADMIN PANEL
  // ==================================================

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [adminRequested, setAdminRequested] =
    useState(false);

  // ==================================================
  // CURRENT FIREBASE USER
  // ==================================================

  const [currentUser, setCurrentUser] =
    useState(null);

  // ==================================================
  // FIREBASE AUTH LISTENER
  // ==================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);

          // ==========================================
          // ADMIN LOGIN SUCCESS
          // ==========================================

          if (
            user &&
            user.email === ADMIN_EMAIL &&
            adminRequested
          ) {
            setShowLogin(false);
            setShowAdminPanel(true);
          }
        }
      );

    return () => unsubscribe();
  }, [adminRequested]);

  // ==================================================
  // OPEN ADMIN PANEL
  // ==================================================

  const openAdminPanel = () => {
    setMenuOpen(false);

    setAdminRequested(true);

    // Already logged in as admin
    if (
      currentUser &&
      currentUser.email === ADMIN_EMAIL
    ) {
      setShowAdminPanel(true);
      setShowLogin(false);
      return;
    }

    // Login required
    setShowLogin(true);
  };

  // ==================================================
  // CLOSE ADMIN PANEL
  // ==================================================

  const closeAdminPanel = () => {
    setShowAdminPanel(false);
    setAdminRequested(false);
  };

  // ==================================================
  // OPEN LOGIN
  // ==================================================

  const openLogin = () => {
    setShowLogin(true);
    setMenuOpen(false);
  };

  // ==================================================
  // CLOSE LOGIN
  // ==================================================

  const closeLogin = () => {
    setShowLogin(false);
    setAdminRequested(false);
  };

  // ==================================================
  // SELECT EXAM
  // ==================================================

  const handleExamClick = (exam) => {
    setSelectedExam(exam.name);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // BACK TO HOME
  // ==================================================

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

  // ==================================================
  // START EXAM
  // ==================================================

  const startExam = () => {
    document
      .getElementById("exam-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // ==================================================
  // ADMIN PANEL
  // ==================================================

  if (showAdminPanel) {
    return (
      <AdminPanel
        user={currentUser}
        onClose={closeAdminPanel}
      />
    );
  }

  // ==================================================
  // LOGIN PAGE
  // ==================================================

  if (showLogin) {
    return (
      <Login
        onBack={closeLogin}
      />
    );
  }

  // ==================================================
  // TEST SERIES PAGE
  // ==================================================

  if (selectedExam) {
    return (
      <TestSeries
        exam={selectedExam}
        onBack={handleBack}
      />
    );
  }

  // ==================================================
  // HOME PAGE
  // ==================================================

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

        {/* MENU BUTTON */}

        <button
          className="menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
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

            setMenuOpen(false);

          }}
        >
          📄 Exam Test
        </button>

        {/* LOGIN */}

        <button
          className="nav-item"
          onClick={openLogin}
        >
          👤 Login
        </button>

        {/* ==================================================
            ADMIN PANEL
        ================================================== */}

        <button
          className="nav-item admin-menu-btn"
          onClick={openAdminPanel}
        >
          🔐 Admin Panel
        </button>

      </nav>

      {/* ==================================================
          HERO
      ================================================== */}

      <main>

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
                  className={`exam-card card-${index % 6}`}
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
                      handleExamClick(exam)
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

          ⭐ Study Smart&nbsp; | &nbsp;
          Practice Daily&nbsp; | &nbsp;
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

import React, { useState } from "react";
import "./App.css";
import TestSeries from "./TestSeries";

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
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= SELECTED EXAM =================

  const [selectedExam, setSelectedExam] = useState(null);

  // ================= OPEN TEST SERIES =================

  const handleExamClick = (exam) => {
    setSelectedExam(exam.name);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= BACK =================

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

  // ================= START EXAM =================

  const startExam = () => {
    document
      .getElementById("exam-section")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

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

      {/* ================= HEADER ================= */}

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
        >
          ☰
        </button>

      </header>

      {/* ================= NAVIGATION ================= */}

      <nav
        className={`navbar ${
          menuOpen ? "show" : ""
        }`}
      >

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

        <button
          className="nav-item"
          onClick={() => {
            startExam();
            setMenuOpen(false);
          }}
        >
          📄 Exam Test
        </button>

        <button
          className="nav-profile"
          onClick={() => {
            alert(
              "Login/Profile सुविधा जल्द उपलब्ध होगी।"
            );
          }}
        >
          👤
        </button>

      </nav>

      {/* ================= HERO ================= */}

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

        {/* ================= SHORTCUTS ================= */}

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

        {/* ================= EXAM SECTION

import React, { useState } from "react";
import "./App.css";
import TestPage from "./TestPage";
import HelpChat from "./HelpChat";

// =====================================================
// EXAMS
// =====================================================

const exams = [
  {
    id: "upsc",
    name: "UPSC",
    icon: "🇮🇳",
    desc: "UPSC Civil Services",
  },
  {
    id: "uppcs",
    name: "UPPCS",
    icon: "🏛️",
    desc: "UPPCS परीक्षा",
  },
  {
    id: "uppet",
    name: "UP PET",
    icon: "🎯",
    desc: "UP PET परीक्षा",
  },
  {
    id: "bpsc",
    name: "BPSC",
    icon: "🏛️",
    desc: "BPSC परीक्षा",
  },
  {
    id: "mppsc",
    name: "MPPSC",
    icon: "📚",
    desc: "MPPSC परीक्षा",
  },
  {
    id: "ssc",
    name: "SSC",
    icon: "📝",
    desc: "SSC परीक्षा",
  },
  {
    id: "railway",
    name: "Railway",
    icon: "🚆",
    desc: "RRB / Railway",
  },
  {
    id: "banking",
    name: "Banking",
    icon: "🏦",
    desc: "Banking परीक्षा",
  },
  {
    id: "upsssc",
    name: "UPSSSC",
    icon: "📖",
    desc: "UPSSSC परीक्षा",
  },
  {
    id: "roaro",
    name: "RO/ARO",
    icon: "📜",
    desc: "RO / ARO परीक्षा",
  },
  {
    id: "police",
    name: "Police",
    icon: "👮",
    desc: "Police परीक्षा",
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: "👨‍🏫",
    desc: "Teaching परीक्षा",
  },
];

// =====================================================
// DEMO TEST DATA
// =====================================================

const testData = {
  uppcs: [
    {
      id: "uppcs-1",
      title: "UPPCS Prelims Test - 01",
      durationMinutes: 30,
      marksPerQuestion: 1,
      negativeMarking: true,
      negativeMarks: 0.33,

      questions: [
        {
          id: 1,
          question: "भारत का संविधान कब लागू हुआ?",
          options: [
            "15 अगस्त 1947",
            "26 जनवरी 1950",
            "26 नवंबर 1949",
            "2 अक्टूबर 1950",
          ],
          answer: 1,
          explanation:
            "भारत का संविधान 26 जनवरी 1950 को लागू हुआ। इसी दिन भारत गणराज्य बना।",
        },

        {
          id: 2,
          question: "भारत की राजधानी कौन-सी है?",
          options: [
            "मुंबई",
            "कोलकाता",
            "नई दिल्ली",
            "चेन्नई",
          ],
          answer: 2,
          explanation:
            "भारत की राजधानी नई दिल्ली है।",
        },

        {
          id: 3,
          question: "भारतीय संविधान की प्रस्तावना में कितने शब्दों में भारत को वर्णित किया गया है?",
          options: [
            "संप्रभु समाजवादी पंथनिरपेक्ष लोकतांत्रिक गणराज्य",
            "संघीय लोकतांत्रिक गणराज्य",
            "समाजवादी गणराज्य",
            "लोकतांत्रिक संघ",
          ],
          answer: 0,
          explanation:
            "प्रस्तावना भारत को संप्रभु, समाजवादी, पंथनिरपेक्ष, लोकतांत्रिक गणराज्य के रूप में वर्णित करती है।",
        },

        {
          id: 4,
          question: "भारत का राष्ट्रीय पशु कौन है?",
          options: [
            "सिंह",
            "बाघ",
            "हाथी",
            "हिरण",
          ],
          answer: 1,
          explanation:
            "बाघ भारत का राष्ट्रीय पशु है।",
        },

        {
          id: 5,
          question: "उत्तर प्रदेश की राजधानी कौन-सी है?",
          options: [
            "कानपुर",
            "वाराणसी",
            "लखनऊ",
            "प्रयागराज",
          ],
          answer: 2,
          explanation:
            "उत्तर प्रदेश की राजधानी लखनऊ है।",
        },
      ],
    },
  ],

  uppet: [
    {
      id: "uppet-1",
      title: "UP PET Full Test - 01",
      durationMinutes: 30,
      marksPerQuestion: 1,
      negativeMarking: true,
      negativeMarks: 0.25,

      questions: [
        {
          id: 1,
          question: "भारत का राष्ट्रीय खेल किसे माना जाता है?",
          options: [
            "क्रिकेट",
            "हॉकी",
            "फुटबॉल",
            "कबड्डी",
          ],
          answer: 1,
          explanation:
            "परंपरागत रूप से हॉकी को भारत का राष्ट्रीय खेल माना जाता रहा है, हालांकि भारत सरकार ने आधिकारिक रूप से किसी खेल को राष्ट्रीय खेल घोषित नहीं किया है।",
        },

        {
          id: 2,
          question: "गंगा नदी का उद्गम कहाँ से होता है?",
          options: [
            "यमुनोत्री",
            "गंगोत्री हिमनद",
            "मानसरोवर",
            "सियाचिन",
          ],
          answer: 1,
          explanation:
            "भागीरथी नदी का उद्गम गंगोत्री हिमनद से होता है। देवप्रयाग में भागीरथी और अलकनंदा के संगम के बाद इसे गंगा कहा जाता है।",
        },

        {
          id: 3,
          question: "भारत में पंचायती राज व्यवस्था कितने स्तरों की है?",
          options: [
            "एक",
            "दो",
            "तीन",
            "चार",
          ],
          answer: 2,
          explanation:
            "सामान्यतः पंचायती राज व्यवस्था तीन स्तरों—ग्राम पंचायत, पंचायत समिति और जिला परिषद—पर आधारित है।",
        },
      ],
    },
  ],

  ssc: [
    {
      id: "ssc-1",
      title: "SSC General Knowledge Test - 01",
      durationMinutes: 20,
      marksPerQuestion: 1,
      negativeMarking: true,
      negativeMarks: 0.25,

      questions: [
        {
          id: 1,
          question: "भारतीय संविधान का संरक्षक किसे कहा जाता है?",
          options: [
            "राष्ट्रपति",
            "संसद",
            "सर्वोच्च न्यायालय",
            "प्रधानमंत्री",
          ],
          answer: 2,
          explanation:
            "सर्वोच्च न्यायालय को संविधान का संरक्षक कहा जाता है क्योंकि वह संवैधानिक प्रावधानों की व्याख्या और न्यायिक समीक्षा करता है।",
        },

        {
          id: 2,
          question: "पृथ्वी का एकमात्र प्राकृतिक उपग्रह कौन है?",
          options: [
            "मंगल",
            "चंद्रमा",
            "शुक्र",
            "सूर्य",
          ],
          answer: 1,
          explanation:
            "चंद्रमा पृथ्वी का एकमात्र प्राकृतिक उपग्रह है।",
        },
      ],
    },
  ],

  railway: [
    {
      id: "railway-1",
      title: "Railway RRB Practice Test - 01",
      durationMinutes: 20,
      marksPerQuestion: 1,
      negativeMarking: true,
      negativeMarks: 0.33,

      questions: [
        {
          id: 1,
          question: "भारत में पहली रेलगाड़ी कब चली?",
          options: [
            "1853",
            "1857",
            "1861",
            "1885",
          ],
          answer: 0,
          explanation:
            "भारत में पहली यात्री रेलगाड़ी 16 अप्रैल 1853 को मुंबई से ठाणे के बीच चली थी।",
        },

        {
          id: 2,
          question: "भारतीय रेलवे का मुख्यालय कहाँ है?",
          options: [
            "मुंबई",
            "नई दिल्ली",
            "कोलकाता",
            "चेन्नई",
          ],
          answer: 1,
          explanation:
            "भारतीय रेलवे का मुख्यालय नई दिल्ली में स्थित है।",
        },
      ],
    },
  ],
};

// =====================================================
// COMMON TEST FOR OTHER EXAMS
// =====================================================

const createCommonTest = (exam) => ({
  id: `${exam.id}-demo`,
  title: `${exam.name} Practice Test - 01`,
  durationMinutes: 20,
  marksPerQuestion: 1,
  negativeMarking: true,
  negativeMarks: 0.25,

  questions: [
    {
      id: 1,
      question: "भारत की राजधानी कौन-सी है?",
      options: [
        "मुंबई",
        "नई दिल्ली",
        "कोलकाता",
        "चेन्नई",
      ],
      answer: 1,
      explanation:
        "भारत की राजधानी नई दिल्ली है।",
    },

    {
      id: 2,
      question: "भारत का राष्ट्रीय पशु कौन है?",
      options: [
        "सिंह",
        "बाघ",
        "हाथी",
        "हिरण",
      ],
      answer: 1,
      explanation:
        "बाघ भारत का राष्ट्रीय पशु है।",
    },

    {
      id: 3,
      question: "भारत का संविधान कब लागू हुआ?",
      options: [
        "15 अगस्त 1947",
        "26 जनवरी 1950",
        "26 नवंबर 1949",
        "2 अक्टूबर 1950",
      ],
      answer: 1,
      explanation:
        "भारतीय संविधान 26 जनवरी 1950 को लागू हुआ।",
    },
  ],
});

// =====================================================
// TEST LIST
// =====================================================

function getTests(exam) {
  if (testData[exam.id]) {
    return testData[exam.id];
  }

  return [createCommonTest(exam)];
}

// =====================================================
// APP
// =====================================================

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);

  const [selectedTest, setSelectedTest] = useState(null);

  // ===================================================
  // OPEN EXAM
  // ===================================================

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setSelectedTest(null);

    setTimeout(() => {
      document
        .getElementById("test-list")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // ===================================================
  // START TEST
  // ===================================================

  const startTest = (test) => {
    setSelectedTest(test);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // BACK TO EXAMS
  // ===================================================

  const backToExams = () => {
    setSelectedExam(null);
    setSelectedTest(null);

    setTimeout(() => {
      document
        .getElementById("exam-section")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  // ===================================================
  // IF TEST OPEN
  // ===================================================

  if (selectedTest) {
    return (
      <>
        <TestPage
          test={selectedTest}
          onBack={() => {
            setSelectedTest(null);

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        />

        <HelpChat />
      </>
    );
  }

  // ===================================================
  // APP HOME
  // ===================================================

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

      {/* NAVBAR */}

      <nav
        className={`navbar ${
          menuOpen ? "show" : ""
        }`}
      >

        <button
          className="nav-item active"
          onClick={() => {
            setSelectedExam(null);

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
          onClick={() => {
            document
              .getElementById("exam-section")
              ?.scrollIntoView({
                behavior: "smooth",
              });

            setMenuOpen(false);
          }}
        >
          📄 Exam Test
        </button>

        <button
          className="nav-profile"
          onClick={() =>
            alert(
              "Profile सुविधा जल्द उपलब्ध होगी।"
            )
          }
        >
          👤
        </button>

      </nav>

      {/* MAIN */}

      <main>

        {/* HERO */}

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
              onClick={() =>
                document
                  .getElementById("exam-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
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

          <div className="shortcut">
            <div className="shortcut-icon">
              📖
            </div>

            <h3>NCERT Books</h3>

            <p>कक्षा 6 से 12 तक</p>
          </div>

          <div className="shortcut">
            <div className="shortcut-icon">
              📰
            </div>

            <h3>Current Affairs</h3>

            <p>प्रतिदिन अपडेट</p>
          </div>

          <div className="shortcut">
            <div className="shortcut-icon">
              ☑️
            </div>

            <h3>MCQ Practice</h3>

            <p>विषयवार अभ्यास</p>
          </div>

          <div className="shortcut">
            <div className="shortcut-icon">
              📊
            </div>

            <h3>Previous Year</h3>

            <p>पिछले वर्षों के प्रश्न</p>
          </div>

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

        {/* TEST LIST */}

        {selectedExam && (

          <section
            className="exam-section"
            id="test-list"
          >

            <div className="section-heading">

              <h2>
                📚 {selectedExam.name} Tests
              </h2>

              <p>
                अपना Test चुनें और परीक्षा शुरू करें
              </p>

              <div className="heading-line"></div>

            </div>

            <div className="exam-grid">

              {getTests(selectedExam).map(
                (test, index) => (

                  <div
                    className={`exam-card card-${
                      index % 6
                    }`}
                    key={test.id}
                  >

                    <div className="exam-icon">
                      📝
                    </div>

                    <h3>
                      {test.title}
                    </h3>

                    <p>
                      प्रश्न:{" "}
                      {test.questions.length}
                      <br />

                      समय:{" "}
                      {test.durationMinutes} मिनट
                      <br />

                      Negative Marking:{" "}
                      {test.negativeMarking
                        ? "हाँ"
                        : "नहीं"}
                    </p>

                    <button
                      className="view-btn"
                      onClick={() =>
                        startTest(test)
                      }
                    >
                      ▶️ Start Test
                    </button>

                  </div>

                )
              )}

            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: 25,
              }}
            >

              <button
                className="start-btn"
                onClick={backToExams}
              >
                ⬅️ सभी Exams
              </button>

            </div>

          </section>

        )}

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

      <HelpChat />

    </div>
  );
}

export default App;

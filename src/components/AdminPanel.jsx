import React, { useEffect, useMemo, useState } from "react";

/*
  ============================================================
  STUDY WITH POWER - ADMIN PANEL
  ============================================================

  Features:
  - Dashboard
  - Add Question
  - Import Questions JSON
  - Save Questions
  - Exam selection
  - Test Series Number
  - Public / Unlisted
  - Questions list
  - Edit / Delete
  - LocalStorage backup
  - Export JSON
*/

function AdminPanel({
  onBack,
  onLogout,
  currentUser,
}) {
  // ==========================================================
  // CONSTANTS
  // ==========================================================

  const EXAMS = [
    { id: "upsc", name: "UPSC" },
    { id: "uppcs", name: "UPPCS" },
    { id: "uppet", name: "UP PET" },
    { id: "bpsc", name: "BPSC" },
    { id: "mppsc", name: "MPPSC" },
    { id: "ssc", name: "SSC" },
    { id: "railway", name: "Railway / RRB" },
    { id: "banking", name: "Banking" },
    { id: "upsssc", name: "UPSSSC" },
    { id: "roaro", name: "RO / ARO" },
    { id: "police", name: "Police" },
    { id: "teaching", name: "Teaching" },
  ];

  const STORAGE_KEY = "study_with_power_admin_questions";

  // ==========================================================
  // STATE
  // ==========================================================

  const [activeTab, setActiveTab] = useState("dashboard");

  const [selectedExam, setSelectedExam] = useState("uppcs");

  const [testSeriesNo, setTestSeriesNo] = useState("1");

  const [testTitle, setTestTitle] = useState("");

  const [testStatus, setTestStatus] = useState("public");

  const [testPrice, setTestPrice] = useState("0");

  const [timeLimit, setTimeLimit] = useState("60");

  const [questionCount, setQuestionCount] = useState("50");

  const [questions, setQuestions] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [questionText, setQuestionText] = useState("");

  const [optionA, setOptionA] = useState("");

  const [optionB, setOptionB] = useState("");

  const [optionC, setOptionC] = useState("");

  const [optionD, setOptionD] = useState("");

  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [explanation, setExplanation] = useState("");

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("success");

  const [jsonText, setJsonText] = useState("");

  const [showImportBox, setShowImportBox] = useState(false);

  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // ==========================================================
  // LOAD QUESTIONS
  // ==========================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        }
      }
    } catch (error) {
      console.error("Question load error:", error);
    }
  }, []);

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // ==========================================================
  // NORMALIZE QUESTION
  // ==========================================================

  const normalizeQuestion = (q, index = 0) => {
    const options = Array.isArray(q?.options)
      ? [
          q.options[0] || "",
          q.options[1] || "",
          q.options[2] || "",
          q.options[3] || "",
        ]
      : [
          q?.optionA || q?.A || "",
          q?.optionB || q?.B || "",
          q?.optionC || q?.C || "",
          q?.optionD || q?.D || "",
        ];

    let answer = q?.answer;

    if (answer === undefined || answer === null) {
      answer = q?.correctAnswer;
    }

    if (answer === undefined || answer === null) {
      answer = "A";
    }

    answer = String(answer).trim();

    if (/^[0-3]$/.test(answer)) {
      answer = ["A", "B", "C", "D"][Number(answer)];
    }

    if (/^[1-4]$/.test(answer)) {
      answer = ["A", "B", "C", "D"][Number(answer) - 1];
    }

    if (/^[abcd]$/i.test(answer)) {
      answer = answer.toUpperCase();
    }

    return {
      id:
        q?.id ??
        `${Date.now()}-${index}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      exam:
        q?.exam ||
        q?.examId ||
        selectedExam,

      testSeriesNo:
        q?.testSeriesNo ||
        q?.testNo ||
        testSeriesNo,

      question:
        q?.question ||
        q?.questionText ||
        q?.text ||
        "",

      options,

      answer,

      explanation:
        q?.explanation ||
        q?.solution ||
        "",

      status:
        q?.status ||
        testStatus,

      createdAt:
        q?.createdAt ||
        new Date().toISOString(),
    };
  };

  // ==========================================================
  // SAVE TO LOCAL STORAGE
  // ==========================================================

  const saveToLocalStorage = (data = questions) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // ==========================================================
  // ADD QUESTION
  // ==========================================================

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      showMessage(
        "कृपया प्रश्न लिखें।",
        "error"
      );
      return;
    }

    if (
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      showMessage(
        "चारों options भरना जरूरी है।",
        "error"
      );
      return;
    }

    const newQuestion = {
      id:
        editingId ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      exam: selectedExam,

      testSeriesNo,

      question: questionText.trim(),

      options: [
        optionA.trim(),
        optionB.trim(),
        optionC.trim(),
        optionD.trim(),
      ],

      answer: correctAnswer,

      explanation: explanation.trim(),

      status: testStatus,

      createdAt: new Date().toISOString(),
    };

    let updated;

    if (editingId) {
      updated = questions.map((q) =>
        String(q.id) === String(editingId)
          ? newQuestion
          : q
      );

      showMessage("Question update हो गया।");
    } else {
      updated = [
        ...questions,
        newQuestion,
      ];

      showMessage("Question save हो गया।");
    }

    setQuestions(updated);
    saveToLocalStorage(updated);

    resetQuestionForm();
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetQuestionForm = () => {
    setEditingId(null);

    setQuestionText("");

    setOptionA("");

    setOptionB("");

    setOptionC("");

    setOptionD("");

    setCorrectAnswer("A");

    setExplanation("");

    setShowAddQuestion(false);
  };

  // ==========================================================
  // EDIT QUESTION
  // ==========================================================

  const handleEdit = (q) => {
    setEditingId(q.id);

    setSelectedExam(q.exam || "uppcs");

    setTestSeriesNo(
      String(q.testSeriesNo || "1")
    );

    setQuestionText(q.question || "");

    setOptionA(q.options?.[0] || "");

    setOptionB(q.options?.[1] || "");

    setOptionC(q.options?.[2] || "");

    setOptionD(q.options?.[3] || "");

    setCorrectAnswer(
      q.answer || "A"
    );

    setExplanation(
      q.explanation || ""
    );

    setTestStatus(
      q.status || "public"
    );

    setShowAddQuestion(true);

    setActiveTab("questions");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // DELETE QUESTION
  // ==========================================================

  const handleDelete = (id) => {
    const ok = window.confirm(
      "क्या आप यह question delete करना चाहते हैं?"
    );

    if (!ok) return;

    const updated = questions.filter(
      (q) =>
        String(q.id) !== String(id)
    );

    setQuestions(updated);

    saveToLocalStorage(updated);

    showMessage("Question delete हो गया।");
  };

  // ==========================================================
  // IMPORT JSON
  // ==========================================================

  const handleImportJSON = () => {
    if (!jsonText.trim()) {
      showMessage(
        "पहले JSON paste करें।",
        "error"
      );
      return;
    }

    try {
      const parsed = JSON.parse(
        jsonText
      );

      let incoming = [];

      if (Array.isArray(parsed)) {
        incoming = parsed;
      } else if (
        Array.isArray(parsed.questions)
      ) {
        incoming = parsed.questions;
      } else {
        incoming = [parsed];
      }

      const normalized =
        incoming.map((q, index) =>
          normalizeQuestion(
            q,
            index
          )
        );

      const updated = [
        ...questions,
        ...normalized,
      ];

      setQuestions(updated);

      saveToLocalStorage(updated);

      setJsonText("");

      setShowImportBox(false);

      showMessage(
        `${normalized.length} questions import हो गए।`
      );

      setActiveTab("questions");
    } catch (error) {
      console.error(error);

      showMessage(
        "JSON गलत है। कृपया valid JSON डालें।",
        "error"
      );
    }
  };

  // ==========================================================
  // FILE IMPORT
  // ==========================================================

  const handleFileImport = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(
          e.target.result
        );

        let incoming = [];

        if (Array.isArray(parsed)) {
          incoming = parsed;
        } else if (
          Array.isArray(parsed.questions)
        ) {
          incoming = parsed.questions;
        } else {
          incoming = [parsed];
        }

        const normalized =
          incoming.map(
            (q, index) =>
              normalizeQuestion(
                q,
                index
              )
          );

        const updated = [
          ...questions,
          ...normalized,
        ];

        setQuestions(updated);

        saveToLocalStorage(updated);

        showMessage(
          `${normalized.length} questions import हो गए।`
        );

        setActiveTab("questions");
      } catch (error) {
        console.error(error);

        showMessage(
          "JSON file सही format में नहीं है।",
          "error"
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  // ==========================================================
  // EXPORT JSON
  // ==========================================================

  const handleExportJSON = () => {
    if (!questions.length) {
      showMessage(
        "Export करने के लिए questions नहीं हैं।",
        "error"
      );
      return;
    }

    const blob = new Blob(
      [
        JSON.stringify(
          questions,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "study-with-power-questions.json";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    showMessage(
      "Questions JSON download हो गया।"
    );
  };

  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  const handleClearAll = () => {
    const ok = window.confirm(
      "क्या आप सभी questions delete करना चाहते हैं?"
    );

    if (!ok) return;

    setQuestions([]);

    localStorage.removeItem(
      STORAGE_KEY
    );

    showMessage(
      "सभी questions delete हो गए।"
    );
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredQuestions =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      return questions.filter(
        (q) => {
          const matchesExam =
            !selectedExam ||
            q.exam === selectedExam;

          const matchesSearch =
            !search ||
            String(
              q.question || ""
            )
              .toLowerCase()
              .includes(search);

          return (
            matchesExam &&
            matchesSearch
          );
        }
      );
    }, [
      questions,
      selectedExam,
      searchText,
    ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const examQuestionCount =
    questions.filter(
      (q) =>
        q.exam === selectedExam
    ).length;

  const publicCount =
    questions.filter(
      (q) =>
        q.status === "public"
    ).length;

  const unlistedCount =
    questions.filter(
      (q) =>
        q.status === "unlisted"
    ).length;

  // ==========================================================
  // TEST SAVE
  // ==========================================================

  const handleSaveTestSettings = () => {
    const test = {
      id: `${selectedExam}-${testSeriesNo}`,

      exam: selectedExam,

      testSeriesNo,

      title:
        testTitle.trim() ||
        `${EXAMS.find(
          (e) =>
            e.id === selectedExam
        )?.name || selectedExam} Test ${testSeriesNo}`,

      status: testStatus,

      price: Number(testPrice) || 0,

      timeLimit:
        Number(timeLimit) || 60,

      questionCount:
        Number(questionCount) || 50,

      updatedAt:
        new Date().toISOString(),
    };

    const existing =
      JSON.parse(
        localStorage.getItem(
          "study_with_power_tests"
        ) || "[]"
      );

    const updated =
      existing.filter(
        (t) =>
          t.id !== test.id
      );

    updated.push(test);

    localStorage.setItem(
      "study_with_power_tests",
      JSON.stringify(updated)
    );

    showMessage(
      "Test Series details save हो गए।"
    );
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    showMessage(
      "Logout function App.jsx से connect करें।"
    );
  };

  // ==========================================================
  // STYLES
  // ==========================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "#f3f4f6",
      fontFamily:
        "Arial, Helvetica, sans-serif",
      color: "#111827",
    },

    header: {
      background:
        "#111827",
      color: "#ffffff",
      padding:
        "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: "15px",
      flexWrap: "wrap",
      position: "sticky",
      top: 0,
      zIndex: 20,
    },

    title: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 800,
    },

    subtitle: {
      margin:
        "4px 0 0",
      fontSize: "13px",
      color:
        "#d1d5db",
    },

    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "20px",
    },

    nav: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },

    navButton: {
      border: "none",
      padding:
        "11px 16px",
      borderRadius: "9px",
      cursor: "pointer",
      fontWeight: 700,
    },

    card: {
      background:
        "#ffffff",
      borderRadius: "14px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow:
        "0 2px 12px rgba(0,0,0,.08)",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(190px,1fr))",
      gap: "15px",
    },

    stat: {
      background:
        "#ffffff",
      borderRadius: "14px",
      padding: "20px",
      boxShadow:
        "0 2px 12px rgba(0,0,0,.07)",
    },

    label: {
      display: "block",
      fontWeight: 700,
      marginBottom: "7px",
    },

    input: {
      width: "100%",
      boxSizing:
        "border-box",
      padding:
        "11px 12px",
      border:
        "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "15px",
      outline: "none",
      background: "#ffffff",
    },

    textarea: {
      width: "100%",
      boxSizing:
        "border-box",
      padding: "12px",
      border:
        "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "15px",
      resize: "vertical",
      minHeight: "100px",
      outline: "none",
    },

    button: {
      border: "none",
      borderRadius: "8px",
      padding:
        "11px 16px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "14px",
    },

    questionCard: {
      background:
        "#ffffff",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border:
        "1px solid #e5e7eb",
    },
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>

        <div>
          <h1 style={styles.title}>
            📚 Study With Power
          </h1>

          <p style={styles.subtitle}>
            Admin Panel
            {currentUser?.email
              ? ` • ${currentUser.email}`
              : ""}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              style={{
                ...styles.button,
                background:
                  "#374151",
                color: "#fff",
              }}
            >
              ← Back
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              ...styles.button,
              background:
                "#dc2626",
              color: "#fff",
            }}
          >
            Logout
          </button>
        </div>

      </header>

      <main style={styles.container}>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              padding: "13px 16px",
              borderRadius: "9px",
              marginBottom: "16px",
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#991b1b"
                  : "#166534",
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}

        {/* NAVIGATION */}
        <div style={styles.nav}>

          {[
            ["dashboard", "📊 Dashboard"],
            ["questions", "❓ Questions"],
            ["tests", "📝 Test Series"],
          ].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() =>
                  setActiveTab(id)
                }
                style={{
                  ...styles.navButton,
                  background:
                    activeTab === id
                      ? "#2563eb"
                      : "#ffffff",
                  color:
                    activeTab === id
                      ? "#ffffff"
                      : "#111827",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,.08)",
                }}
              >
                {label}
              </button>
            )
          )}

        </div>

        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        {activeTab === "dashboard" && (
          <>
            <div style={styles.grid}>

              <div style={styles.stat}>
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  {questions.length}
                </div>

                <div>
                  Total Questions
                </div>
              </div>

              <div style={styles.stat}>
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  {examQuestionCount}
                </div>

                <div>
                  Selected Exam Questions
                </div>
              </div>

              <div style={styles.stat}>
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  {publicCount}
                </div>

                <div>
                  Public
                </div>
              </div>

              <div style={styles.stat}>
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  {unlistedCount}
                </div>

                <div>
                  Unlisted
                </div>
              </div>

            </div>

            <div style={styles.card}>

              <h2>
                Admin Quick Actions
              </h2>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >

                <button
                  onClick={() => {
                    setActiveTab(
                      "questions"
                    );
                    setShowAddQuestion(
                      true
                    );
                  }}
                  style={{
                    ...styles.button,
                    background:
                      "#2563eb",
                    color: "#fff",
                  }}
                >
                  ➕ Add Question
                </button>

                <button
                  onClick={() => {
                    setActiveTab(
                      "questions"
                    );
                    setShowImportBox(
                      true
                    );
                  }}
                  style={{
                    ...styles.button,
                    background:
                      "#059669",
                    color: "#fff",
                  }}
                >
                  📥 Import Questions JSON
                </button>

                <button
                  onClick={
                    handleExportJSON
                  }
                  style={{
                    ...styles.button,
                    background:
                      "#7c3aed",
                    color: "#fff",
                  }}
                >
                  📤 Export JSON
                </button>

              </div>

            </div>
          </>
        )}

        {/* ====================================================
            QUESTIONS
        ==================================================== */}

        {activeTab === "questions" && (
          <>

            {/* EXAM SELECT */}
            <div style={styles.card}>

              <h2>
                Question Management
              </h2>

              <div
                style={styles.grid}
              >

                <div>
                  <label
                    style={styles.label}
                  >
                    Exam चुनें
                  </label>

                  <select
                    value={
                      selectedExam
                    }
                    onChange={(e) =>
                      setSelectedExam(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    {EXAMS.map(
                      (exam) => (
                        <option
                          key={
                            exam.id
                          }
                          value={
                            exam.id
                          }
                        >
                          {exam.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    style={styles.label}
                  >
                    Test Series No.
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      testSeriesNo
                    }
                    onChange={(e) =>
                      setTestSeriesNo(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label
                    style={styles.label}
                  >
                    Search Question
                  </label>

                  <input
                    value={
                      searchText
                    }
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                    placeholder="Question search करें..."
                    style={styles.input}
                  />
                </div>

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom:
                  "20px",
              }}
            >

              <button
                onClick={() =>
                  setShowAddQuestion(
                    true
                  )
                }
                style={{
                  ...styles.button,
                  background:
                    "#2563eb",
                  color: "#fff",
                }}
              >
                ➕ Add Question
              </button>

              <button
                onClick={() =>
                  setShowImportBox(
                    !showImportBox
                  )
                }
                style={{
                  ...styles.button,
                  background:
                    "#059669",
                  color: "#fff",
                }}
              >
                📥 Import Questions JSON
              </button>

              <label
                style={{
                  ...styles.button,
                  background:
                    "#7c3aed",
                  color: "#fff",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  cursor: "pointer",
                }}
              >
                📂 JSON File
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={
                    handleFileImport
                  }
                  style={{
                    display: "none",
                  }}
                />
              </label>

              <button
                onClick={
                  handleExportJSON
                }
                style={{
                  ...styles.button,
                  background:
                    "#0891b2",
                  color: "#fff",
                }}
              >
                📤 Export JSON
              </button>

              <button
                onClick={
                  handleClearAll
                }
                style={{
                  ...styles.button,
                  background:
                    "#dc2626",
                  color: "#fff",
                }}
              >
                🗑️ Clear All
              </button>

            </div>

            {/* IMPORT BOX */}
            {showImportBox && (
              <div style={styles.card}>

                <h2>
                  Import Questions JSON
                </h2>

                <textarea
                  value={jsonText}
                  onChange={(e) =>
                    setJsonText(
                      e.target.value
                    )
                  }
                  placeholder={`[
  {
    "question": "भारत की राजधानी क्या है?",
    "options": [
      "मुंबई",
      "नई दिल्ली",
      "कोलकाता",
      "चेन्नई"
    ],
    "answer": "B",
    "explanation": "भारत की राजधानी नई दिल्ली है।"
  }
]`}
                  style={{
                    ...styles.textarea,
                    minHeight:
                      "220px",
                    fontFamily:
                      "monospace",
                  }}
                />

                <div
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    marginTop:
                      "12px",
                  }}
                >

                  <button
                    onClick={
                      handleImportJSON
                    }
                    style={{
                      ...styles.button,
                      background:
                        "#16a34a",
                      color: "#fff",
                    }}
                  >
                    💾 Import & Save
                  </button>

                  <button
                    onClick={() => {
                      setJsonText(
                        ""
                      );
                      setShowImportBox(
                        false
                      );
                    }}
                    style={{
                      ...styles.button,
                      background:
                        "#6b7280",
                      color: "#fff",
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

            {/* ADD / EDIT FORM */}
            {showAddQuestion && (
              <div style={styles.card}>

                <h2>
                  {editingId
                    ? "✏️ Edit Question"
                    : "➕ Add New Question"}
                </h2>

                <div
                  style={styles.grid}
                >

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Exam
                    </label>

                    <select
                      value={
                        selectedExam
                      }
                      onChange={(e) =>
                        setSelectedExam(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    >
                      {EXAMS.map(
                        (exam) => (
                          <option
                            key={
                              exam.id
                            }
                            value={
                              exam.id
                            }
                          >
                            {
                              exam.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Test Series No.
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        testSeriesNo
                      }
                      onChange={(e) =>
                        setTestSeriesNo(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Status
                    </label>

                    <select
                      value={
                        testStatus
                      }
                      onChange={(e) =>
                        setTestStatus(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    >
                      <option value="public">
                        Public
                      </option>

                      <option value="unlisted">
                        Unlisted
                      </option>
                    </select>
                  </div>

                </div>

                <div
                  style={{
                    marginTop:
                      "15px",
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Question
                  </label>

                  <textarea
                    value={
                      questionText
                    }
                    onChange={(e) =>
                      setQuestionText(
                        e.target.value
                      )
                    }
                    placeholder="Question लिखें..."
                    style={
                      styles.textarea
                    }
                  />
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(250px,1fr))",
                    gap: "12px",
                    marginTop:
                      "15px",
                  }}
                >

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Option A
                    </label>

                    <input
                      value={optionA}
                      onChange={(e) =>
                        setOptionA(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Option B
                    </label>

                    <input
                      value={optionB}
                      onChange={(e) =>
                        setOptionB(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Option C
                    </label>

                    <input
                      value={optionC}
                      onChange={(e) =>
                        setOptionC(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                  <div>
                    <label
                      style={
                        styles.label
                      }
                    >
                      Option D
                    </label>

                    <input
                      value={optionD}
                      onChange={(e) =>
                        setOptionD(
                          e.target.value
                        )
                      }
                      style={
                        styles.input
                      }
                    />
                  </div>

                </div>

                <div
                  style={{
                    marginTop:
                      "15px",
                  }}
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    सही उत्तर
                  </label>

                  <select
                    value={
                      correctAnswer
                    }
                    onChange={(e) =>
                      setCorrectAnswer(
                        e.target.value
                      )
                    }
                    style={
                      styles.input
                    }
                  >
                    <option value="A">
                      A
                    </option>
                    <option value="B">
                      B
                    </option>
                    <option value="C">
                      C
                    </option>
                    <option value="D">
                      D
                    </option>
                  </select>

                </div>

                <div
                  style={{
                    marginTop:
                      "15px",
                  }}
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    Explanation
                  </label>

                  <textarea
                    value={
                      explanation
                    }
                    onChange={(e) =>
                      setExplanation(
                        e.target.value
                      )
                    }
                    placeholder="Answer की explanation लिखें..."
                    style={
                      styles.textarea
                    }
                  />

                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    marginTop:
                      "15px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <button
                    onClick={
                      handleAddQuestion
                    }
                    style={{
                      ...styles.button,
                      background:
                        "#16a34a",
                      color: "#fff",
                    }}
                  >
                    💾{" "}
                    {editingId
                      ? "Update Question"
                      : "Save Question"}
                  </button>

                  <button
                    onClick={
                      resetQuestionForm
                    }
                    style={{
                      ...styles.button,
                      background:
                        "#6b7280",
                      color: "#fff",
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

            {/* QUESTION LIST */}
            <div style={styles.card}>

              <h2>
                Questions List
              </h2>

              <p>
                Exam:{" "}
                <strong>
                  {
                    EXAMS.find(
                      (e) =>
                        e.id ===
                        selectedExam
                    )?.name
                  }
                </strong>{" "}
                | Total:{" "}
                <strong>
                  {
                    filteredQuestions.length
                  }
                </strong>
              </p>

              {filteredQuestions.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "30px",
                    textAlign:
                      "center",
                    color:
                      "#6b7280",
                  }}
                >
                  अभी कोई question नहीं है।
                </div>
              ) : (
                filteredQuestions.map(
                  (q, index) => (
                    <div
                      key={q.id}
                      style={
                        styles.questionCard
                      }
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        <strong>
                          Q{index + 1}.{" "}
                          {q.question}
                        </strong>

                        <span
                          style={{
                            background:
                              q.status ===
                              "public"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              q.status ===
                              "public"
                                ? "#166534"
                                : "#92400e",
                            padding:
                              "4px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                          }}
                        >
                          {q.status ||
                            "public"}
                        </span>

                      </div>

                      <div
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >

                        {q.options?.map(
                          (
                            option,
                            i
                          ) => {
                            const letter =
                              ["A", "B", "C", "D"][
                                i
                              ];

                            return (
                              <div
                                key={
                                  letter
                                }
                                style={{
                                  padding:
                                    "5px 0",
                                  fontWeight:
                                    q.answer ===
                                    letter
                                      ? 700
                                      : 400,
                                  color:
                                    q.answer ===
                                    letter
                                      ? "#15803d"
                                      : "#374151",
                                }}
                              >
                                {letter}.{" "}
                                {
                                  option
                                }
                                {q.answer ===
                                  letter &&
                                  " ✓"}
                              </div>
                            );
                          }
                        )}

                      </div>

                      {q.explanation && (
                        <div
                          style={{
                            marginTop:
                              "10px",
                            padding:
                              "10px",
                            background:
                              "#f9fafb",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            Explanation:
                          </strong>{" "}
                          {
                            q.explanation
                          }
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          marginTop:
                            "12px",
                        }}
                      >

                        <button
                          onClick={() =>
                            handleEdit(
                              q
                            )
                          }
                          style={{
                            ...styles.button,
                            background:
                              "#2563eb",
                            color:
                              "#ffffff",
                          }}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              q.id
                            )
                          }
                          style={{
                            ...styles.button,
                            background:
                              "#dc2626",
                            color:
                              "#ffffff",
                          }}
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </>
        )}

        {/* ====================================================
            TEST SERIES
        ==================================================== */}

        {activeTab === "tests" && (
          <div style={styles.card}>

            <h2>
              📝 Test Series Settings
            </h2>

            <div
              style={styles.grid}
            >

              <div>
                <label
                  style={styles.label}
                >
                  Exam
                </label>

                <select
                  value={
                    selectedExam
                  }
                  onChange={(e) =>
                    setSelectedExam(
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  {EXAMS.map(
                    (exam) => (
                      <option
                        key={exam.id}
                        value={exam.id}
                      >
                        {exam.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Test Series No.
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    testSeriesNo
                  }
                  onChange={(e) =>
                    setTestSeriesNo(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Test Title
                </label>

                <input
                  value={testTitle}
                  onChange={(e) =>
                    setTestTitle(
                      e.target.value
                    )
                  }
                  placeholder="UPPCS Test 01"
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Status
                </label>

                <select
                  value={
                    testStatus
                  }
                  onChange={(e) =>
                    setTestStatus(
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  <option value="public">
                    Public
                  </option>

                  <option value="unlisted">
                    Unlisted
                  </option>
                </select>
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Price ₹
                </label>

                <input
                  type="number"
                  min="0"
                  value={testPrice}
                  onChange={(e) =>
                    setTestPrice(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Time Limit
                  (Minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) =>
                    setTimeLimit(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={styles.label}
                >
                  Questions
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    questionCount
                  }
                  onChange={(e) =>
                    setQuestionCount(
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

            </div>

            <div
              style={{
                marginTop:
                  "20px",
              }}
            >

              <button
                onClick={
                  handleSaveTestSettings
                }
                style={{
                  ...styles.button,
                  background:
                    "#16a34a",
                  color: "#fff",
                }}
              >
                💾 Save Test Series
              </button>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default AdminPanel;

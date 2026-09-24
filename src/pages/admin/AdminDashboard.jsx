import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import {
  ref,
  push,
  set,
  get,
  remove,
} from "firebase/database";
import "./AdminDashboard.css";

/* =========================================================
   EXAMS
========================================================= */

const EXAMS = [
  "UPPCS",
  "UP Police",
  "UP Home Guard",
  "UPSSSC",
  "UP Lekhpal",
  "SSC",
  "RRB NTPC",
  "RRB Group D",
  "CTET",
  "Other",
];

/* =========================================================
   EMPTY QUESTION
========================================================= */

const emptyQuestion = () => ({
  id: Date.now() + Math.random(),
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
  explanationImage: "",
});

/* =========================================================
   EMPTY TEST
========================================================= */

const emptyTest = (testNumber = 1) => ({
  exam: "UPPCS",
  testNumber,
  title: `UPPCS Test ${String(testNumber).padStart(2, "0")}`,
  status: "draft",
  duration: 30,
  price: 0,
  questions: [emptyQuestion()],
});

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ user, onLogout }) {
  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState("tests");

  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);

  const [editingTest, setEditingTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("All");

  const [showTestEditor, setShowTestEditor] = useState(false);

  const currentUserEmail =
    user?.email || "cciaashish@gmail.com";

  /* =======================================================
     LOAD TESTS
  ======================================================= */

  const loadTests = async () => {
    try {
      setLoadingTests(true);
      setMessage("");

      const snapshot = await get(ref(db, "tests"));

      if (!snapshot.exists()) {
        setTests([]);
        return;
      }

      const data = snapshot.val();

      const list = Object.entries(data).map(
        ([id, value]) => ({
          id,
          ...value,
          questions: Array.isArray(value?.questions)
            ? value.questions.map((q) => ({
                ...q,
                options: [
                  ...(q?.options || [
                    "",
                    "",
                    "",
                    "",
                  ]),
                ].slice(0, 4),
              }))
            : [],
        })
      );

      list.sort(
        (a, b) =>
          Number(a.testNumber || 0) -
          Number(b.testNumber || 0)
      );

      setTests(list);
    } catch (error) {
      console.error("Load tests error:", error);

      setMessage(
        `❌ Tests load नहीं हो पाए: ${
          error?.message || "Unknown error"
        }`
      );
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  /* =======================================================
     CREATE NEW TEST
  ======================================================= */

  const createNewTest = () => {
    const examTests = tests.filter(
      (test) => test.exam === "UPPCS"
    );

    const nextNumber = examTests.length + 1;

    const newTest = emptyTest(nextNumber);

    setEditingTest(newTest);
    setSelectedQuestion(0);
    setShowTestEditor(true);
    setMessage("");
  };

  /* =======================================================
     EDIT TEST
  ======================================================= */

  const editTest = (test) => {
    const copiedTest = {
      ...test,

      testNumber: Number(test.testNumber || 1),
      duration: Number(test.duration || 30),
      price: Number(test.price || 0),

      questions:
        Array.isArray(test.questions) &&
        test.questions.length
          ? test.questions.map((q) => ({
              id:
                q?.id ||
                Date.now() + Math.random(),

              question: q?.question || "",

              options: [
                ...(q?.options || [
                  "",
                  "",
                  "",
                  "",
                ]),
              ].slice(0, 4),

              answer: Number(q?.answer || 0),

              explanation:
                q?.explanation || "",

              explanationImage:
                q?.explanationImage || "",
            }))
          : [emptyQuestion()],
    };

    setEditingTest(copiedTest);
    setSelectedQuestion(0);
    setShowTestEditor(true);
    setMessage("");
  };

  /* =======================================================
     DELETE TEST
  ======================================================= */

  const deleteTest = async (test) => {
    const ok = window.confirm(
      `क्या आप "${test?.title || "Test"}" को delete करना चाहते हैं?`
    );

    if (!ok) return;

    try {
      await remove(ref(db, `tests/${test.id}`));

      setTests((prev) =>
        prev.filter((item) => item.id !== test.id)
      );

      setMessage("✅ Test successfully delete हो गया।");
    } catch (error) {
      console.error("Delete test error:", error);

      setMessage(
        `❌ Test delete नहीं हुआ: ${
          error?.message || "Unknown error"
        }`
      );
    }
  };

  /* =======================================================
     UPDATE TEST FIELD
  ======================================================= */

  const updateTestField = (field, value) => {
    setEditingTest((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  /* =======================================================
     UPDATE QUESTION
  ======================================================= */

  const updateQuestion = (
    questionIndex,
    field,
    value
  ) => {
    setEditingTest((prev) => {
      if (!prev) return prev;

      const questions = [...prev.questions];

      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };

      return {
        ...prev,
        questions,
      };
    });
  };

  /* =======================================================
     UPDATE OPTION
  ======================================================= */

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setEditingTest((prev) => {
      if (!prev) return prev;

      const questions = [...prev.questions];

      const options = [
        ...(questions[questionIndex]?.options || [
          "",
          "",
          "",
          "",
        ]),
      ];

      options[optionIndex] = value;

      questions[questionIndex] = {
        ...questions[questionIndex],
        options,
      };

      return {
        ...prev,
        questions,
      };
    });
  };

  /* =======================================================
     ADD QUESTION
  ======================================================= */

  const addQuestion = () => {
    const newQuestion = emptyQuestion();

    setEditingTest((prev) => {
      if (!prev) return prev;

      const questions = [
        ...(prev.questions || []),
        newQuestion,
      ];

      return {
        ...prev,
        questions,
      };
    });

    /*
      नई question का index:
      current questions length
    */
    setSelectedQuestion(
      editingTest?.questions?.length || 0
    );
  };

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const deleteQuestion = (index) => {
    if (!editingTest) return;

    if (editingTest.questions.length <= 1) {
      alert(
        "कम से कम 1 Question होना जरूरी है।"
      );
      return;
    }

    const ok = window.confirm(
      `Question ${index + 1} delete करें?`
    );

    if (!ok) return;

    const totalBeforeDelete =
      editingTest.questions.length;

    setEditingTest((prev) => {
      const questions = prev.questions.filter(
        (_, i) => i !== index
      );

      return {
        ...prev,
        questions,
      };
    });

    setSelectedQuestion((prev) => {
      if (index === prev) {
        return Math.min(
          prev,
          totalBeforeDelete - 2
        );
      }

      if (index < prev) {
        return prev - 1;
      }

      return prev;
    });
  };

  /* =======================================================
     NEW TEST / RESET
  ======================================================= */

  const closeEditor = () => {
    setShowTestEditor(false);
    setEditingTest(null);
    setSelectedQuestion(0);
  };

  /* =======================================================
     SAVE TEST TO FIREBASE
  ======================================================= */

  const saveTest = async () => {
    if (!editingTest) return;

    /* -----------------------------------------------
       VALIDATION
    ----------------------------------------------- */

    if (!editingTest.exam) {
      alert("Exam select करें।");
      return;
    }

    if (
      !editingTest.testNumber ||
      Number(editingTest.testNumber) < 1
    ) {
      alert("Valid Test Number डालें।");
      return;
    }

    if (!editingTest.title?.trim()) {
      alert("Test Title डालिए।");
      return;
    }

    if (
      !editingTest.duration ||
      Number(editingTest.duration) < 1
    ) {
      alert("Duration सही डालिए।");
      return;
    }

    if (!editingTest.questions?.length) {
      alert("कम से कम 1 Question डालिए।");
      return;
    }

    const invalidQuestion =
      editingTest.questions.findIndex((q) => {
        const options = q?.options || [];

        return (
          !q?.question?.trim() ||
          options.length !== 4 ||
          options.some(
            (option) =>
              !String(option || "").trim()
          )
        );
      });

    if (invalidQuestion !== -1) {
      alert(
        `Question ${
          invalidQuestion + 1
        } में Question और सभी 4 Options भरना जरूरी है।`
      );

      setSelectedQuestion(invalidQuestion);

      return;
    }

    /* -----------------------------------------------
       SAVE
    ----------------------------------------------- */

    try {
      setSaving(true);
      setMessage("");

      const cleanQuestions =
        editingTest.questions.map(
          (question, index) => ({
            id:
              question?.id ||
              Date.now() + index,

            question:
              question?.question || "",

            options: [
              ...(question?.options || [
                "",
                "",
                "",
                "",
              ]),
            ].slice(0, 4),

            answer: Number(
              question?.answer || 0
            ),

            explanation:
              question?.explanation || "",

            explanationImage:
              question?.explanationImage || "",
          })
        );

      const payload = {
        exam: editingTest.exam,

        testNumber:
          Number(editingTest.testNumber) || 1,

        title:
          editingTest.title.trim(),

        status:
          editingTest.status || "draft",

        duration:
          Number(editingTest.duration) || 30,

        price:
          Number(editingTest.price) || 0,

        questions: cleanQuestions,

        questionCount:
          cleanQuestions.length,

        totalQuestions:
          cleanQuestions.length,

        createdBy:
          currentUserEmail,

        updatedAt:
          new Date().toISOString(),
      };

      let testId = editingTest.id;

      /* -----------------------------------------------
         NEW TEST
      ----------------------------------------------- */

      if (!testId) {
        const newRef = push(
          ref(db, "tests")
        );

        testId = newRef.key;

        await set(newRef, {
          ...payload,

          id: testId,

          createdAt:
            new Date().toISOString(),
        });
      }

      /* -----------------------------------------------
         UPDATE TEST
      ----------------------------------------------- */

      else {
        await set(
          ref(db, `tests/${testId}`),
          {
            ...payload,

            id: testId,

            createdAt:
              editingTest.createdAt ||
              new Date().toISOString(),
          }
        );
      }

      setMessage(
        "✅ Test Firebase में successfully save हो गया।"
      );

      closeEditor();

      await loadTests();
    } catch (error) {
      console.error(
        "Save test error:",
        error
      );

      setMessage(
        `❌ Save Error: ${
          error?.message ||
          "Unknown Firebase error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     FILTER TESTS
  ======================================================= */

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        String(test?.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(test?.exam || "")
          .toLowerCase()
          .includes(searchText) ||
        String(test?.testNumber || "")
          .toLowerCase()
          .includes(searchText);

      const matchesExam =
        filterExam === "All" ||
        test?.exam === filterExam;

      return (
        matchesSearch &&
        matchesExam
      );
    });
  }, [
    tests,
    search,
    filterExam,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalTests = tests.length;

  const publishedTests = tests.filter(
    (test) =>
      test.status === "published" ||
      test.status === "public"
  ).length;

  const draftTests = tests.filter(
    (test) =>
      !test.status ||
      test.status === "draft"
  ).length;

  const unlistedTests = tests.filter(
    (test) =>
      test.status === "unlisted"
  ).length;

  const totalQuestions = tests.reduce(
    (total, test) =>
      total +
      (Array.isArray(test.questions)
        ? test.questions.length
        : 0),
    0
  );

  /* =======================================================
     CURRENT QUESTION
  ======================================================= */

  const currentQuestion =
    editingTest?.questions?.[
      selectedQuestion
    ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-page">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="brand-icon">
            🎓
          </div>

          <div>
            <h2>
              Study With Power
            </h2>

            <span>
              Admin Panel
            </span>
          </div>

        </div>

        {/* USER */}

        <div className="sidebar-user">

          <div className="user-avatar">
            👤
          </div>

          <div className="sidebar-user-info">

            <strong>
              Admin
            </strong>

            <span>
              {currentUserEmail}
            </span>

          </div>

        </div>

        {/* MENU */}

        <nav className="sidebar-menu">

          <button
            type="button"
            className={
              activeTab === "tests"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActiveTab("tests")
            }
          >
            <span>📝</span>
            Test Manager
          </button>

          <button
            type="button"
            className={
              activeTab === "resources"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActiveTab("resources")
            }
          >
            <span>📚</span>
            Resources
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                window.location.reload();
              }
            }}
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <div className="breadcrumb">
              Admin →{" "}
              {activeTab === "tests"
                ? "Test Manager"
                : "Resources"}
            </div>

            <h1>
              {activeTab === "tests"
                ? "Exam & Test Manager"
                : "Resources Manager"}
            </h1>

            <p>
              अपने सभी Exam, Test और
              Questions आसानी से manage करें।
            </p>

          </div>

          <div className="header-actions">

            <button
              type="button"
              className="refresh-btn"
              onClick={loadTests}
              disabled={loadingTests}
            >
              🔄 Refresh
            </button>

            {activeTab === "tests" && (
              <button
                type="button"
                className="primary-btn"
                onClick={createNewTest}
              >
                ➕ New Test
              </button>
            )}

          </div>

        </header>

        {/* MESSAGE */}

        {message && (
          <div
            className={
              message.startsWith("❌")
                ? "alert error"
                : "alert success"
            }
          >
            {message}
          </div>
        )}

        {/* =================================================
            TEST MANAGER
        ================================================= */}

        {activeTab === "tests" && (
          <>

            {/* STATISTICS */}

            <section className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon blue">
                  📝
                </div>

                <div>
                  <span>
                    Total Tests
                  </span>

                  <strong>
                    {totalTests}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  ✅
                </div>

                <div>
                  <span>
                    Published
                  </span>

                  <strong>
                    {publishedTests}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  📝
                </div>

                <div>
                  <span>
                    Draft
                  </span>

                  <strong>
                    {draftTests}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon purple">
                  🔗
                </div>

                <div>
                  <span>
                    Unlisted
                  </span>

                  <strong>
                    {unlistedTests}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon blue">
                  ❓
                </div>

                <div>
                  <span>
                    Total Questions
                  </span>

                  <strong>
                    {totalQuestions}
                  </strong>
                </div>

              </div>

            </section>

            {/* ALL TESTS */}

            <section className="panel-card">

              <div className="panel-header">

                <div>

                  <h2>
                    📋 All Tests
                  </h2>

                  <p>
                    यहाँ से Test edit,
                    delete और manage करें।
                  </p>

                </div>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={createNewTest}
                >
                  ➕ New Test
                </button>

              </div>

              {/* FILTER */}

              <div className="filter-row">

                <div className="search-box">

                  <span>
                    🔍
                  </span>

                  <input
                    type="text"
                    placeholder="Test या Exam search करें..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>

                <select
                  value={filterExam}
                  onChange={(e) =>
                    setFilterExam(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    सभी Exams
                  </option>

                  {EXAMS.map((exam) => (
                    <option
                      key={exam}
                      value={exam}
                    >
                      {exam}
                    </option>
                  ))}

                </select>

              </div>

              {/* LOADING */}

              {loadingTests ? (
                <div className="loading-box">

                  <div className="spinner"></div>

                  <p>
                    Tests load हो रहे हैं...
                  </p>

                </div>
              ) : filteredTests.length === 0 ? (

                /* EMPTY */

                <div className="empty-box">

                  <div className="empty-icon">
                    📭
                  </div>

                  <h3>
                    कोई Test नहीं मिला
                  </h3>

                  <p>
                    ऊपर से{" "}
                    <b>New Test</b>{" "}
                    पर क्लिक करके
                    पहला Test बनाइए।
                  </p>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={createNewTest}
                  >
                    ➕ Create Test
                  </button>

                </div>

              ) : (

                /* TABLE */

                <div className="table-wrapper">

                  <table className="test-table">

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Exam
                        </th>

                        <th>
                          Test
                        </th>

                        <th>
                          Questions
                        </th>

                        <th>
                          Duration
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredTests.map(
                        (test, index) => (

                          <tr
                            key={test.id}
                          >

                            <td>
                              <span className="table-number">
                                {index + 1}
                              </span>
                            </td>

                            <td>

                              <span className="exam-badge">
                                {test.exam}
                              </span>

                            </td>

                            <td>

                              <div className="test-title-cell">

                                <strong>
                                  {test.title ||
                                    "Untitled Test"}
                                </strong>

                                <small>
                                  Test No.{" "}
                                  {test.testNumber ||
                                    "-"}
                                </small>

                              </div>

                            </td>

                            <td>

                              <b>
                                {Array.isArray(
                                  test.questions
                                )
                                  ? test.questions
                                      .length
                                  : 0}
                              </b>

                            </td>

                            <td>
                              ⏱️{" "}
                              {test.duration ||
                                0}{" "}
                              min
                            </td>

                            <td>

                              {Number(
                                test.price || 0
                              ) === 0 ? (

                                <span className="free-badge">
                                  FREE
                                </span>

                              ) : (
                                `₹${test.price}`
                              )}

                            </td>

                            <td>

                              <span
                                className={`status-badge ${
                                  test.status ||
                                  "draft"
                                }`}
                              >

                                {test.status ===
                                "published" ||
                                test.status ===
                                "public"
                                  ? "🟢 Public"
                                  : test.status ===
                                    "unlisted"
                                  ? "🔗 Unlisted"
                                  : "🟠 Draft"}

                              </span>

                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  type="button"
                                  className="edit-btn"
                                  onClick={() =>
                                    editTest(
                                      test
                                    )
                                  }
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  type="button"
                                  className="delete-btn"
                                  onClick={() =>
                                    deleteTest(
                                      test
                                    )
                                  }
                                >
                                  🗑️
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>
        )}

        {/* =================================================
            RESOURCES
        ================================================= */}

        {activeTab === "resources" && (

          <section className="resource-grid">

            <div className="resource-card">

              <div className="resource-icon">
                📚
              </div>

              <h3>
                Study Material
              </h3>

              <p>
                PDF, Notes और अन्य
                study material manage करें।
              </p>

              <button
                type="button"
                className="secondary-btn"
              >
                Manage Resources
              </button>

            </div>

            <div className="resource-card">

              <div className="resource-icon">
                🤖
              </div>

              <h3>
                AI MCQ Generator
              </h3>

              <p>
                AI की सहायता से नए
                MCQ generate करें।
              </p>

              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  window.location.href =
                    "/ai-mcq-generator"
                }
              >
                Open Generator
              </button>

            </div>

            <div className="resource-card">

              <div className="resource-icon">
                📊
              </div>

              <h3>
                Test Analytics
              </h3>

              <p>
                Test और students की
                performance देखें।
              </p>

              <button
                type="button"
                className="secondary-btn"
              >
                View Analytics
              </button>

            </div>

          </section>

        )}

      </main>

      {/* ===================================================
          TEST EDITOR MODAL
      =================================================== */}

      {showTestEditor &&
        editingTest && (

          <div className="editor-overlay">

            <div className="editor-modal">

              {/* EDITOR HEADER */}

              <div className="editor-header">

                <div>

                  <div className="editor-label">
                    TEST EDITOR
                  </div>

                  <h2>
                    {editingTest.id
                      ? "✏️ Test Edit करें"
                      : "➕ New Test बनाएं"}
                  </h2>

                  <p>
                    Exam → Test → Questions
                    manage करें
                  </p>

                </div>

                <button
                  type="button"
                  className="close-editor"
                  onClick={closeEditor}
                >
                  ✕
                </button>

              </div>

              {/* EDITOR BODY */}

              <div className="editor-body">

                {/* =========================================
                    TEST INFORMATION
                ========================================= */}

                <section className="editor-section">

                  <div className="section-heading">

                    <span>
                      📋
                    </span>

                    <div>

                      <h3>
                        Test Information
                      </h3>

                      <p>
                        Test की basic
                        details भरें।
                      </p>

                    </div>

                  </div>

                  <div className="form-grid">

                    {/* EXAM */}

                    <div className="form-group">

                      <label>
                        🎯 Exam
                      </label>

                      <select
                        value={
                          editingTest.exam
                        }
                        onChange={(e) =>
                          updateTestField(
                            "exam",
                            e.target.value
                          )
                        }
                      >

                        {EXAMS.map(
                          (exam) => (

                            <option
                              key={exam}
                              value={exam}
                            >
                              {exam}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    {/* TEST NUMBER */}

                    <div className="form-group">

                      <label>
                        🔢 Test Number
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          editingTest.testNumber
                        }
                        onChange={(e) =>
                          updateTestField(
                            "testNumber",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* TITLE */}

                    <div className="form-group full">

                      <label>
                        📌 Test Title
                      </label>

                      <input
                        type="text"
                        placeholder="जैसे: UPPCS Test 01 - History"
                        value={
                          editingTest.title
                        }
                        onChange={(e) =>
                          updateTestField(
                            "title",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* STATUS */}

                    <div className="form-group">

                      <label>
                        📢 Status
                      </label>

                      <select
                        value={
                          editingTest.status ||
                          "draft"
                        }
                        onChange={(e) =>
                          updateTestField(
                            "status",
                            e.target.value
                          )
                        }
                      >

                        <option value="draft">
                          🟠 Draft
                        </option>

                        <option value="published">
                          🟢 Public / Published
                        </option>

                        <option value="unlisted">
                          🔗 Unlisted
                        </option>

                      </select>

                    </div>

                    {/* DURATION */}

                    <div className="form-group">

                      <label>
                        ⏱️ Duration
                        (Minutes)
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          editingTest.duration
                        }
                        onChange={(e) =>
                          updateTestField(
                            "duration",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* PRICE */}

                    <div className="form-group">

                      <label>
                        💰 Price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          editingTest.price
                        }
                        onChange={(e) =>
                          updateTestField(
                            "price",
                            e.target.value
                          )
                        }
                      />

                      <small>
                        ₹0 = Free Test
                      </small>

                    </div>

                  </div>

                </section>

                {/* =========================================
                    QUESTION MANAGER
                ========================================= */}

                <section className="editor-section">

                  <div className="question-manager-heading">

                    <div className="section-heading">

                      <span>
                        ❓
                      </span>

                      <div>

                        <h3>
                          Question Manager
                        </h3>

                        <p>
                          Total Questions:{" "}
                          <b>
                            {
                              editingTest
                                .questions
                                .length
                            }
                          </b>
                        </p>

                      </div>

                    </div>

                    <div className="question-actions">

                      <button
                        type="button"
                        className="add-question-btn"
                        onClick={
                          addQuestion
                        }
                      >
                        ➕ Add Question
                      </button>

                      <button
                        type="button"
                        className="remove-question-btn"
                        onClick={() =>
                          deleteQuestion(
                            selectedQuestion
                          )
                        }
                      >
                        🗑️ Delete Question
                      </button>

                    </div>

                  </div>

                  {/* QUESTION TABS */}

                  <div className="question-tabs">

                    {editingTest.questions.map(
                      (_, index) => (

                        <button
                          type="button"
                          key={index}
                          className={
                            selectedQuestion ===
                            index
                              ? "question-tab active"
                              : "question-tab"
                          }
                          onClick={() =>
                            setSelectedQuestion(
                              index
                            )
                          }
                        >
                          {index + 1}
                        </button>

                      )
                    )}

                  </div>

                  {/* CURRENT QUESTION */}

                  {currentQuestion && (

                    <div className="question-editor">

                      <div className="question-title">

                        <span>
                          Question{" "}
                          {selectedQuestion + 1}
                        </span>

                        <span className="required">
                          * Required
                        </span>

                      </div>

                      {/* QUESTION */}

                      <div className="form-group">

                        <label>
                          ❓ Question
                        </label>

                        <textarea
                          rows="4"
                          placeholder="यहाँ प्रश्न लिखें..."
                          value={
                            currentQuestion.question ||
                            ""
                          }
                          onChange={(e) =>
                            updateQuestion(
                              selectedQuestion,
                              "question",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* OPTIONS */}

                      <div className="options-heading">

                        <span>
                          🔤
                        </span>

                        <h4>
                          Options
                        </h4>

                      </div>

                      <div className="options-grid">

                        {[
                          "A",
                          "B",
                          "C",
                          "D",
                        ].map(
                          (
                            letter,
                            optionIndex
                          ) => (

                            <div
                              className="option-row"
                              key={letter}
                            >

                              <div className="option-label">
                                {letter}
                              </div>

                              <input
                                type="text"
                                placeholder={`Option ${letter}`}
                                value={
                                  currentQuestion
                                    .options?.[
                                    optionIndex
                                  ] || ""
                                }
                                onChange={(e) =>
                                  updateOption(
                                    selectedQuestion,
                                    optionIndex,
                                    e.target.value
                                  )
                                }
                              />

                              <label className="correct-option">

                                <input
                                  type="radio"
                                  name={`answer-${selectedQuestion}`}
                                  checked={
                                    Number(
                                      currentQuestion.answer
                                    ) ===
                                    optionIndex
                                  }
                                  onChange={() =>
                                    updateQuestion(
                                      selectedQuestion,
                                      "answer",
                                      optionIndex
                                    )
                                  }
                                />

                                <span>
                                  सही उत्तर
                                </span>

                              </label>

                            </div>

                          )
                        )}

                      </div>

                      {/* EXPLANATION */}

                      <div className="form-group">

                        <label>
                          💡 Explanation
                        </label>

                        <textarea
                          rows="4"
                          placeholder="सही उत्तर की व्याख्या लिखें..."
                          value={
                            currentQuestion.explanation ||
                            ""
                          }
                          onChange={(e) =>
                            updateQuestion(
                              selectedQuestion,
                              "explanation",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* EXPLANATION IMAGE */}

                      <div className="form-group">

                        <label>
                          🖼️ Explanation Image URL{" "}
                          <span className="optional">
                            Optional
                          </span>
                        </label>

                        <input
                          type="url"
                          placeholder="https://..."
                          value={
                            currentQuestion.explanationImage ||
                            ""
                          }
                          onChange={(e) =>
                            updateQuestion(
                              selectedQuestion,
                              "explanationImage",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      {/* QUESTION NAVIGATION */}

                      <div className="question-navigation">

                        <button
                          type="button"
                          className="secondary-btn"
                          disabled={
                            selectedQuestion ===
                            0
                          }
                          onClick={() =>
                            setSelectedQuestion(
                              (prev) =>
                                Math.max(
                                  0,
                                  prev - 1
                                )
                            )
                          }
                        >
                          ← Previous
                        </button>

                        <span>
                          Question{" "}
                          {selectedQuestion + 1}{" "}
                          /{" "}
                          {
                            editingTest
                              .questions
                              .length
                          }
                        </span>

                        <button
                          type="button"
                          className="secondary-btn"
                          disabled={
                            selectedQuestion ===
                            editingTest.questions
                              .length -
                              1
                          }
                          onClick={() =>
                            setSelectedQuestion(
                              (prev) =>
                                Math.min(
                                  editingTest
                                    .questions
                                    .length -
                                    1,
                                  prev + 1
                                )
                            )
                          }
                        >
                          Next →
                        </button>

                      </div>

                    </div>

                  )}

                </section>

              </div>

              {/* EDITOR FOOTER */}

              <div className="editor-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeEditor}
                >
                  ✕ Cancel
                </button>

                <button
                  type="button"
                  className="save-test-btn"
                  onClick={saveTest}
                  disabled={saving}
                >
                  {saving
                    ? "⏳ Saving..."
                    : "💾 Save Test to Firebase"}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default AdminDashboard;

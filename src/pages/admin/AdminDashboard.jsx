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

const emptyQuestion = () => ({
  id: Date.now() + Math.random(),
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
  explanationImage: "",
});

const emptyTest = () => ({
  exam: "UPPCS",
  testNumber: 1,
  title: "UPPCS Test 01",
  status: "draft",
  duration: 30,
  price: 0,
  questions: [emptyQuestion()],
});

function AdminDashboard({ user, onLogout }) {
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

  // --------------------------------------------------
  // Load Tests
  // --------------------------------------------------

  const loadTests = async () => {
    try {
      setLoadingTests(true);

      const snapshot = await get(ref(db, "tests"));

      if (!snapshot.exists()) {
        setTests([]);
        return;
      }

      const data = snapshot.val();

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
        questions: Array.isArray(value.questions)
          ? value.questions
          : [],
      }));

      list.sort(
        (a, b) =>
          Number(a.testNumber || 0) -
          Number(b.testNumber || 0)
      );

      setTests(list);
    } catch (error) {
      console.error(error);
      setMessage("❌ Tests load नहीं हो पाए।");
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // --------------------------------------------------
  // Create New Test
  // --------------------------------------------------

  const createNewTest = () => {
    const newTest = emptyTest();

    const examTests = tests.filter(
      (t) => t.exam === newTest.exam
    );

    newTest.testNumber = examTests.length + 1;

    newTest.title = `${newTest.exam} Test ${String(
      newTest.testNumber
    ).padStart(2, "0")}`;

    setEditingTest(newTest);
    setSelectedQuestion(0);
    setShowTestEditor(true);
    setMessage("");
  };

  // --------------------------------------------------
  // Edit Test
  // --------------------------------------------------

  const editTest = (test) => {
    const copied = {
      ...test,
      questions: (test.questions || []).map((q) => ({
        ...q,
        options: [
          ...(q.options || ["", "", "", ""]),
        ].slice(0, 4),
      })),
    };

    if (!copied.questions.length) {
      copied.questions = [emptyQuestion()];
    }

    setEditingTest(copied);
    setSelectedQuestion(0);
    setShowTestEditor(true);
    setMessage("");
  };

  // --------------------------------------------------
  // Delete Test
  // --------------------------------------------------

  const deleteTest = async (test) => {
    const ok = window.confirm(
      `क्या आप "${test.title}" को delete करना चाहते हैं?`
    );

    if (!ok) return;

    try {
      await remove(ref(db, `tests/${test.id}`));

      setTests((prev) =>
        prev.filter((item) => item.id !== test.id)
      );

      setMessage("✅ Test delete हो गया।");
    } catch (error) {
      console.error(error);
      setMessage("❌ Test delete नहीं हुआ।");
    }
  };

  // --------------------------------------------------
  // Test Field Update
  // --------------------------------------------------

  const updateTestField = (field, value) => {
    setEditingTest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------------------------------
  // Question Update
  // --------------------------------------------------

  const updateQuestion = (index, field, value) => {
    setEditingTest((prev) => {
      const questions = [...prev.questions];

      questions[index] = {
        ...questions[index],
        [field]: value,
      };

      return {
        ...prev,
        questions,
      };
    });
  };

  // --------------------------------------------------
  // Option Update
  // --------------------------------------------------

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setEditingTest((prev) => {
      const questions = [...prev.questions];

      const options = [
        ...(questions[questionIndex].options || [
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

  // --------------------------------------------------
  // Add Question
  // --------------------------------------------------

  const addQuestion = () => {
    setEditingTest((prev) => {
      const questions = [
        ...(prev.questions || []),
        emptyQuestion(),
      ];

      return {
        ...prev,
        questions,
      };
    });

    setTimeout(() => {
      setSelectedQuestion(
        editingTest?.questions?.length || 0
      );
    }, 0);
  };

  // --------------------------------------------------
  // Delete Question
  // --------------------------------------------------

  const deleteQuestion = (index) => {
    if (
      !editingTest ||
      editingTest.questions.length <= 1
    ) {
      alert("कम से कम 1 question होना जरूरी है।");
      return;
    }

    const ok = window.confirm(
      `Question ${index + 1} delete करें?`
    );

    if (!ok) return;

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
      if (prev >= editingTest.questions.length - 1) {
        return Math.max(
          0,
          editingTest.questions.length - 2
        );
      }

      if (prev > index) return prev - 1;

      return prev;
    });
  };

  // --------------------------------------------------
  // Save Test
  // --------------------------------------------------

  const saveTest = async () => {
    if (!editingTest) return;

    if (!editingTest.title?.trim()) {
      alert("Test Title डालिए।");
      return;
    }

    if (!editingTest.questions?.length) {
      alert("कम से कम 1 question डालिए।");
      return;
    }

    const invalidQuestion =
      editingTest.questions.findIndex(
        (q) =>
          !q.question?.trim() ||
          q.options.some(
            (option) => !String(option).trim()
          )
      );

    if (invalidQuestion !== -1) {
      alert(
        `Question ${
          invalidQuestion + 1
        } में Question और सभी 4 Options भरना जरूरी है।`
      );

      setSelectedQuestion(invalidQuestion);
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const cleanQuestions =
        editingTest.questions.map((q, index) => ({
          id: q.id || Date.now() + index,
          question: q.question || "",
          options: q.options || ["", "", "", ""],
          answer: Number(q.answer || 0),
          explanation: q.explanation || "",
          explanationImage:
            q.explanationImage || "",
        }));

      const payload = {
        exam: editingTest.exam,
        testNumber: Number(editingTest.testNumber) || 1,
        title: editingTest.title,
        status: editingTest.status || "draft",
        duration: Number(editingTest.duration) || 30,
        price: Number(editingTest.price) || 0,
        questions: cleanQuestions,
        questionCount: cleanQuestions.length,
        createdBy: currentUserEmail,
        updatedAt: new Date().toISOString(),
      };

      let testId = editingTest.id;

      if (!testId) {
        const newRef = push(ref(db, "tests"));
        testId = newRef.key;

        await set(newRef, {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      } else {
        await set(ref(db, `tests/${testId}`), {
          ...payload,
          id: testId,
          createdAt:
            editingTest.createdAt ||
            new Date().toISOString(),
        });
      }

      setMessage("✅ Test Firebase में successfully save हो गया।");

      setShowTestEditor(false);
      setEditingTest(null);

      await loadTests();
    } catch (error) {
      console.error(error);

      setMessage(
        `❌ Save Error: ${
          error?.message || "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Filter Tests
  // --------------------------------------------------

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        !search ||
        String(test.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(test.exam || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesExam =
        filterExam === "All" ||
        test.exam === filterExam;

      return matchesSearch && matchesExam;
    });
  }, [tests, search, filterExam]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalTests = tests.length;

  const publishedTests = tests.filter(
    (t) => t.status === "published"
  ).length;

  const draftTests = tests.filter(
    (t) => t.status === "draft"
  ).length;

  const unlistedTests = tests.filter(
    (t) => t.status === "unlisted"
  ).length;

  // --------------------------------------------------
  // Current Question
  // --------------------------------------------------

  const currentQuestion =
    editingTest?.questions?.[selectedQuestion];

  return (
    <div className="admin-page">
      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-icon">🎓</div>

          <div>
            <h2>Study With Power</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">👤</div>

          <div className="sidebar-user-info">
            <strong>Admin</strong>
            <span>{currentUserEmail}</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className={
              activeTab === "tests"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => setActiveTab("tests")}
          >
            <span>📝</span>
            Test Manager
          </button>

          <button
            className={
              activeTab === "resources"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => setActiveTab("resources")}
          >
            <span>📚</span>
            Resources
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
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

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="admin-main">
        {/* Header */}

        <header className="admin-header">
          <div>
            <div className="breadcrumb">
              Admin → {activeTab === "tests"
                ? "Test Manager"
                : "Resources"}
            </div>

            <h1>
              {activeTab === "tests"
                ? "Exam & Test Manager"
                : "Resources"}
            </h1>

            <p>
              अपने सभी Exam, Test और Questions आसानी से
              manage करें।
            </p>
          </div>

          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={loadTests}
              disabled={loadingTests}
            >
              🔄 Refresh
            </button>

            <button
              className="primary-btn"
              onClick={createNewTest}
            >
              ➕ New Test
            </button>
          </div>
        </header>

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

        {/* =========================================
            TEST MANAGER
        ========================================= */}

        {activeTab === "tests" && (
          <>
            {/* Statistics */}

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  📝
                </div>

                <div>
                  <span>Total Tests</span>
                  <strong>{totalTests}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  ✅
                </div>

                <div>
                  <span>Published</span>
                  <strong>{publishedTests}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  📝
                </div>

                <div>
                  <span>Draft</span>
                  <strong>{draftTests}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  🔗
                </div>

                <div>
                  <span>Unlisted</span>
                  <strong>{unlistedTests}</strong>
                </div>
              </div>
            </section>

            {/* Test List */}

            <section className="panel-card">
              <div className="panel-header">
                <div>
                  <h2>📋 All Tests</h2>
                  <p>
                    यहाँ से Test edit, delete और manage करें।
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={createNewTest}
                >
                  ➕ New Test
                </button>
              </div>

              <div className="filter-row">
                <div className="search-box">
                  🔍
                  <input
                    type="text"
                    placeholder="Test या Exam search करें..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>

                <select
                  value={filterExam}
                  onChange={(e) =>
                    setFilterExam(e.target.value)
                  }
                >
                  <option value="All">
                    सभी Exams
                  </option>

                  {EXAMS.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </select>
              </div>

              {loadingTests ? (
                <div className="loading-box">
                  <div className="spinner"></div>
                  <p>Tests load हो रहे हैं...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="empty-box">
                  <div>📭</div>
                  <h3>कोई Test नहीं मिला</h3>
                  <p>
                    ऊपर से <b>New Test</b> पर क्लिक करके
                    पहला Test बनाइए।
                  </p>

                  <button
                    className="primary-btn"
                    onClick={createNewTest}
                  >
                    ➕ Create Test
                  </button>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="test-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Exam</th>
                        <th>Test</th>
                        <th>Questions</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTests.map(
                        (test, index) => (
                          <tr key={test.id}>
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
                                  {test.title}
                                </strong>

                                <small>
                                  Test No.{" "}
                                  {test.testNumber}
                                </small>
                              </div>
                            </td>

                            <td>
                              <b>
                                {
                                  test.questions
                                    ?.length || 0
                                }
                              </b>
                            </td>

                            <td>
                              ⏱️ {test.duration || 0} min
                            </td>

                            <td>
                              {Number(test.price || 0) ===
                              0 ? (
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
                                "published"
                                  ? "🟢 Published"
                                  : test.status ===
                                    "unlisted"
                                  ? "🔗 Unlisted"
                                  : "🟠 Draft"}
                              </span>
                            </td>

                            <td>
                              <div className="action-buttons">
                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    editTest(test)
                                  }
                                >
                                  ✏️ Edit
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={() =>
                                    deleteTest(test)
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

        {/* =========================================
            RESOURCES
        ========================================= */}

        {activeTab === "resources" && (
          <section className="resource-grid">
            <div className="resource-card">
              <div className="resource-icon">
                📚
              </div>

              <h3>Study Material</h3>

              <p>
                PDF, Notes और अन्य study material manage
                करें।
              </p>

              <button className="secondary-btn">
                Manage Resources
              </button>
            </div>

            <div className="resource-card">
              <div className="resource-icon">
                🤖
              </div>

              <h3>AI MCQ Generator</h3>

              <p>
                AI की सहायता से नए MCQ generate करें।
              </p>

              <button
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

              <h3>Test Analytics</h3>

              <p>
                Test और students की performance देखें।
              </p>

              <button className="secondary-btn">
                View Analytics
              </button>
            </div>
          </section>
        )}
      </main>

      {/* =========================================
          TEST EDITOR MODAL
      ========================================= */}

      {showTestEditor && editingTest && (
        <div className="editor-overlay">
          <div className="editor-modal">
            {/* Editor Header */}

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
                  Exam → Test → Questions manage करें
                </p>
              </div>

              <button
                className="close-editor"
                onClick={() => {
                  setShowTestEditor(false);
                  setEditingTest(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Test Information */}

            <div className="editor-body">
              <section className="editor-section">
                <div className="section-heading">
                  <span>📋</span>

                  <div>
                    <h3>Test Information</h3>
                    <p>
                      Test की basic details भरें।
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>🎯 Exam</label>

                    <select
                      value={editingTest.exam}
                      onChange={(e) =>
                        updateTestField(
                          "exam",
                          e.target.value
                        )
                      }
                    >
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

                  <div className="form-group">
                    <label>🔢 Test Number</label>

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

                  <div className="form-group full">
                    <label>📌 Test Title</label>

                    <input
                      type="text"
                      placeholder="जैसे: UPPCS Test 01 - History"
                      value={editingTest.title}
                      onChange={(e) =>
                        updateTestField(
                          "title",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>📢 Status</label>

                    <select
                      value={
                        editingTest.status || "draft"
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

                  <div className="form-group">
                    <label>⏱️ Duration (Minutes)</label>

                    <input
                      type="number"
                      min="1"
                      value={editingTest.duration}
                      onChange={(e) =>
                        updateTestField(
                          "duration",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>💰 Price (₹)</label>

                    <input
                      type="number"
                      min="0"
                      value={editingTest.price}
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

              {/* Question Manager */}

              <section className="editor-section">
                <div className="question-manager-heading">
                  <div className="section-heading">
                    <span>❓</span>

                    <div>
                      <h3>Question Manager</h3>

                      <p>
                        Total Questions:{" "}
                        <b>
                          {editingTest.questions.length}
                        </b>
                      </p>
                    </div>
                  </div>

                  <div className="question-actions">
                    <button
                      className="add-question-btn"
                      onClick={addQuestion}
                    >
                      ➕ Add Question
                    </button>

                    <button
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

                {/* Question Numbers */}

                <div className="question-tabs">
                  {editingTest.questions.map(
                    (_, index) => (
                      <button
                        key={index}
                        className={
                          selectedQuestion === index
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

                    <div className="form-group">
                      <label>
                        ❓ Question
                      </label>

                      <textarea
                        rows="4"
                        placeholder="यहाँ प्रश्न लिखें..."
                        value={
                          currentQuestion.question
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

                    <div className="options-heading">
                      <span>🔤</span>
                      <h4>Options</h4>
                    </div>

                    <div className="options-grid">
                      {["A", "B", "C", "D"].map(
                        (letter, optionIndex) => (
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
                                  .options[
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

                    <div className="form-group">
                      <label>
                        🖼️ Explanation Image URL
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
                  </div>
                )}
              </section>
            </div>

            {/* Editor Footer */}

            <div className="editor-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowTestEditor(false);
                  setEditingTest(null);
                }}
              >
                ✕ Cancel
              </button>

              <button
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

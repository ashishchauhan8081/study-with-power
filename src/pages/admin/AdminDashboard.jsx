import React, { useEffect, useState } from "react";
import {
  ref,
  push,
  set,
  update,
  remove,
  onValue,
} from "firebase/database";

import { db } from "../../firebase";
import "./AdminDashboard.css";

const DEFAULT_QUESTION = {
  question: "",
  options: {
    A: "",
    B: "",
    C: "",
    D: "",
  },
  answer: "A",
  explanation: "",
  explanationImage: "",
};

function AdminDashboard({ onBack }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  const [showTestForm, setShowTestForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [testForm, setTestForm] = useState({
    exam: "UPPCS",
    testNumber: 1,
    title: "",
    status: "Draft",
    duration: 30,
    price: 0,
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [message, setMessage] = useState("");

  // -----------------------------------------
  // EXAMS
  // -----------------------------------------

  const exams = [
    "UPPCS",
    "UP Police",
    "UP Home Guard",
    "UPSSSC",
    "UPPET",
    "SSC CGL",
    "SSC CHSL",
    "RRB NTPC",
    "RRB Group D",
    "CTET",
    "NDA",
    "Bank",
  ];

  // -----------------------------------------
  // LOAD TESTS
  // -----------------------------------------

  useEffect(() => {
    const testsRef = ref(db, "tests");

    const unsubscribe = onValue(testsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setTests([]);
        return;
      }

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      list.sort((a, b) => {
        return Number(a.testNumber || 0) - Number(b.testNumber || 0);
      });

      setTests(list);
    });

    return () => unsubscribe();
  }, []);

  // -----------------------------------------
  // NEW TEST
  // -----------------------------------------

  const createNewTest = () => {
    const nextNumber =
      tests.length > 0
        ? Math.max(...tests.map((t) => Number(t.testNumber || 0))) + 1
        : 1;

    setTestForm({
      exam: "UPPCS",
      testNumber: nextNumber,
      title: `UPPCS Test ${String(nextNumber).padStart(2, "0")}`,
      status: "Draft",
      duration: 30,
      price: 0,
    });

    setQuestions([
      {
        id: Date.now(),
        ...DEFAULT_QUESTION,
        options: { ...DEFAULT_QUESTION.options },
      },
    ]);

    setCurrentQuestion(0);
    setSelectedTest(null);
    setShowTestForm(true);
    setActiveMenu("tests");
  };

  // -----------------------------------------
  // EDIT TEST
  // -----------------------------------------

  const editTest = (test) => {
    setSelectedTest(test);

    setTestForm({
      exam: test.exam || "UPPCS",
      testNumber: test.testNumber || 1,
      title: test.title || "",
      status: test.status || "Draft",
      duration: test.duration || 30,
      price: test.price || 0,
    });

    const loadedQuestions = Array.isArray(test.questions)
      ? test.questions
      : test.questions
      ? Object.values(test.questions)
      : [];

    setQuestions(
      loadedQuestions.length
        ? loadedQuestions.map((q) => ({
            ...DEFAULT_QUESTION,
            ...q,
            options: {
              ...DEFAULT_QUESTION.options,
              ...(q.options || {}),
            },
          }))
        : [
            {
              id: Date.now(),
              ...DEFAULT_QUESTION,
              options: { ...DEFAULT_QUESTION.options },
            },
          ]
    );

    setCurrentQuestion(0);
    setShowTestForm(true);
    setActiveMenu("tests");
  };

  // -----------------------------------------
  // TEST FORM CHANGE
  // -----------------------------------------

  const handleTestChange = (e) => {
    const { name, value } = e.target;

    setTestForm((prev) => ({
      ...prev,
      [name]:
        name === "testNumber" ||
        name === "duration" ||
        name === "price"
          ? Number(value)
          : value,
    }));
  };

  // -----------------------------------------
  // QUESTION CHANGE
  // -----------------------------------------

  const updateQuestion = (field, value) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === currentQuestion
          ? {
              ...q,
              [field]: value,
            }
          : q
      )
    );
  };

  const updateOption = (option, value) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === currentQuestion
          ? {
              ...q,
              options: {
                ...q.options,
                [option]: value,
              },
            }
          : q
      )
    );
  };

  const setCorrectAnswer = (answer) => {
    updateQuestion("answer", answer);
  };

  // -----------------------------------------
  // ADD QUESTION
  // -----------------------------------------

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      ...DEFAULT_QUESTION,
      options: { ...DEFAULT_QUESTION.options },
    };

    setQuestions((prev) => [...prev, newQuestion]);

    setCurrentQuestion(questions.length);
  };

  // -----------------------------------------
  // DELETE QUESTION
  // -----------------------------------------

  const deleteQuestion = () => {
    if (questions.length === 1) {
      alert("कम से कम 1 प्रश्न होना जरूरी है।");
      return;
    }

    const updated = questions.filter(
      (_, index) => index !== currentQuestion
    );

    setQuestions(updated);

    if (currentQuestion >= updated.length) {
      setCurrentQuestion(updated.length - 1);
    }
  };

  // -----------------------------------------
  // SAVE TEST
  // -----------------------------------------

  const saveTest = async () => {
    if (!testForm.title.trim()) {
      alert("कृपया Test Title डालें।");
      return;
    }

    if (questions.length === 0) {
      alert("कम से कम 1 प्रश्न जोड़ें।");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const cleanedQuestions = questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question || "",
        options: {
          A: q.options?.A || "",
          B: q.options?.B || "",
          C: q.options?.C || "",
          D: q.options?.D || "",
        },
        answer: q.answer || "A",
        explanation: q.explanation || "",
        explanationImage: q.explanationImage || "",
      }));

      const testData = {
        exam: testForm.exam,
        testNumber: Number(testForm.testNumber),
        title: testForm.title,
        status: testForm.status,
        duration: Number(testForm.duration),
        price: Number(testForm.price),
        questionCount: cleanedQuestions.length,
        questions: cleanedQuestions,
        updatedAt: Date.now(),
      };

      if (selectedTest?.id) {
        await update(ref(db, `tests/${selectedTest.id}`), testData);
        setMessage("✅ Test सफलतापूर्वक Update हो गया।");
      } else {
        const newRef = push(ref(db, "tests"));

        await set(newRef, {
          ...testData,
          createdAt: Date.now(),
        });

        setMessage("✅ Test Firebase में Save हो गया।");
      }

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      alert(
        "❌ Test Save नहीं हुआ।\n\n" +
          (error?.message || "Firebase error")
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // DELETE TEST
  // -----------------------------------------

  const deleteTest = async (testId) => {
    const confirmDelete = window.confirm(
      "क्या आप यह पूरा Test delete करना चाहते हैं?"
    );

    if (!confirmDelete) return;

    try {
      await remove(ref(db, `tests/${testId}`));
      alert("✅ Test delete हो गया।");

      if (selectedTest?.id === testId) {
        setSelectedTest(null);
        setShowTestForm(false);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Test delete नहीं हुआ।");
    }
  };

  // -----------------------------------------
  // DASHBOARD STATS
  // -----------------------------------------

  const totalTests = tests.length;

  const publishedTests = tests.filter(
    (t) => String(t.status).toLowerCase() === "published"
  ).length;

  const draftTests = tests.filter(
    (t) => String(t.status).toLowerCase() === "draft"
  ).length;

  const totalQuestions = tests.reduce(
    (sum, test) =>
      sum +
      Number(
        test.questionCount ||
          (Array.isArray(test.questions)
            ? test.questions.length
            : test.questions
            ? Object.keys(test.questions).length
            : 0)
      ),
    0
  );

  // -----------------------------------------
  // CURRENT QUESTION
  // -----------------------------------------

  const current = questions[currentQuestion] || {
    ...DEFAULT_QUESTION,
    options: { ...DEFAULT_QUESTION.options },
  };

  return (
    <div className="admin-wrapper">

      {/* ================= HEADER ================= */}

      <header className="admin-header">
        <div className="admin-logo-area">
          <div className="admin-logo">📚</div>

          <div>
            <h1>Study With Power</h1>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="header-right">
          <span className="admin-online">
            🟢 Admin Online
          </span>

          {onBack && (
            <button
              className="website-btn"
              onClick={onBack}
            >
              🌐 Website
            </button>
          )}
        </div>
      </header>

      <div className="admin-body">

        {/* ================= SIDEBAR ================= */}

        <aside className="admin-sidebar">

          <button
            className={
              activeMenu === "dashboard"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => {
              setActiveMenu("dashboard");
              setShowTestForm(false);
            }}
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            className={
              activeMenu === "tests"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => {
              setActiveMenu("tests");
              setShowTestForm(false);
            }}
          >
            📝
            <span>Test Series</span>
          </button>

          <button
            className="sidebar-item"
            onClick={createNewTest}
          >
            ➕
            <span>New Test</span>
          </button>

          <div className="sidebar-divider"></div>

          <div className="sidebar-title">
            QUICK INFO
          </div>

          <div className="sidebar-info">
            <span>Tests</span>
            <strong>{totalTests}</strong>
          </div>

          <div className="sidebar-info">
            <span>Questions</span>
            <strong>{totalQuestions}</strong>
          </div>

        </aside>

        {/* ================= MAIN ================= */}

        <main className="admin-main">

          {/* ================= DASHBOARD ================= */}

          {activeMenu === "dashboard" && !showTestForm && (
            <div>

              <div className="page-heading">
                <div>
                  <h2>Admin Dashboard</h2>
                  <p>
                    अपने Test Series और Questions को manage करें।
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={createNewTest}
                >
                  ➕ New Test
                </button>
              </div>

              {/* STAT CARDS */}

              <div className="stats-grid">

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
                    📄
                  </div>

                  <div>
                    <span>Draft Tests</span>
                    <strong>{draftTests}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    ❓
                  </div>

                  <div>
                    <span>Total Questions</span>
                    <strong>{totalQuestions}</strong>
                  </div>
                </div>

              </div>

              {/* RECENT TESTS */}

              <div className="panel-card">

                <div className="panel-header">
                  <div>
                    <h3>📚 Test Series</h3>
                    <p>सभी Tests यहाँ दिखाई देंगे।</p>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() => setActiveMenu("tests")}
                  >
                    सभी Tests देखें →
                  </button>
                </div>

                {tests.length === 0 ? (
                  <div className="empty-state">
                    <div>📭</div>
                    <h3>अभी कोई Test नहीं है</h3>
                    <p>
                      पहला Test बनाने के लिए New Test पर क्लिक करें।
                    </p>

                    <button
                      className="primary-btn"
                      onClick={createNewTest}
                    >
                      ➕ पहला Test बनाएं
                    </button>
                  </div>
                ) : (
                  <div className="test-table-wrapper">
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
                        {tests.slice(0, 10).map((test) => (
                          <tr key={test.id}>

                            <td>
                              {test.testNumber}
                            </td>

                            <td>
                              <strong>
                                {test.exam}
                              </strong>
                            </td>

                            <td>
                              {test.title}
                            </td>

                            <td>
                              {test.questionCount ||
                                (Array.isArray(test.questions)
                                  ? test.questions.length
                                  : 0)}
                            </td>

                            <td>
                              {test.duration} min
                            </td>

                            <td>
                              ₹{test.price || 0}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${String(
                                  test.status || "Draft"
                                ).toLowerCase()}`}
                              >
                                {test.status || "Draft"}
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
                                    deleteTest(test.id)
                                  }
                                >
                                  🗑️
                                </button>

                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ================= TEST LIST ================= */}

          {activeMenu === "tests" && !showTestForm && (
            <div>

              <div className="page-heading">
                <div>
                  <h2>📝 Test Series</h2>
                  <p>
                    Exam के अनुसार Test manage करें।
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={createNewTest}
                >
                  ➕ New Test
                </button>
              </div>

              <div className="test-grid">

                {tests.map((test) => (
                  <div
                    className="test-card"
                    key={test.id}
                  >

                    <div className="test-card-top">

                      <span className="exam-badge">
                        {test.exam}
                      </span>

                      <span
                        className={`status-badge ${String(
                          test.status || "Draft"
                        ).toLowerCase()}`}
                      >
                        {test.status || "Draft"}
                      </span>

                    </div>

                    <h3>
                      Test {test.testNumber} — {test.title}
                    </h3>

                    <div className="test-meta">

                      <span>
                        ❓{" "}
                        {test.questionCount ||
                          (Array.isArray(test.questions)
                            ? test.questions.length
                            : 0)}{" "}
                        Questions
                      </span>

                      <span>
                        ⏱️ {test.duration} Minutes
                      </span>

                      <span>
                        💰 ₹{test.price || 0}
                      </span>

                    </div>

                    <div className="test-card-actions">

                      <button
                        className="edit-btn large"
                        onClick={() => editTest(test)}
                      >
                        ✏️ Manage Questions
                      </button>

                      <button
                        className="delete-btn large"
                        onClick={() =>
                          deleteTest(test.id)
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>

              {tests.length === 0 && (
                <div className="empty-state">
                  <div>📚</div>
                  <h3>कोई Test उपलब्ध नहीं है</h3>

                  <button
                    className="primary-btn"
                    onClick={createNewTest}
                  >
                    ➕ New Test बनाएं
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ================= CREATE / EDIT TEST ================= */}

          {showTestForm && (
            <div>

              <div className="breadcrumb">
                Admin → Test Series → Questions
              </div>

              <div className="page-heading">

                <div>
                  <h2>
                    {selectedTest
                      ? "✏️ Test Edit करें"
                      : "➕ New Test बनाएं"}
                  </h2>

                  <p>
                    Test details और questions यहाँ manage करें।
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowTestForm(false);
                    setSelectedTest(null);
                  }}
                >
                  ← Back
                </button>

              </div>

              {/* TEST INFORMATION */}

              <div className="panel-card">

                <div className="panel-header">
                  <div>
                    <h3>📋 Test Information</h3>
                    <p>
                      Test की basic information भरें।
                    </p>
                  </div>
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      🎯 Exam
                    </label>

                    <select
                      name="exam"
                      value={testForm.exam}
                      onChange={handleTestChange}
                    >
                      {exams.map((exam) => (
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
                    <label>
                      🔢 Test Number
                    </label>

                    <input
                      type="number"
                      name="testNumber"
                      min="1"
                      value={testForm.testNumber}
                      onChange={handleTestChange}
                    />
                  </div>

                  <div className="form-group full">
                    <label>
                      📌 Test Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      placeholder="जैसे: UPPCS Test 01 - History"
                      value={testForm.title}
                      onChange={handleTestChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      📢 Status
                    </label>

                    <select
                      name="status"
                      value={testForm.status}
                      onChange={handleTestChange}
                    >
                      <option value="Draft">
                        Draft
                      </option>

                      <option value="Published">
                        Published
                      </option>

                      <option value="Unlisted">
                        Unlisted
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      ⏱️ Duration (Minutes)
                    </label>

                    <input
                      type="number"
                      name="duration"
                      min="1"
                      value={testForm.duration}
                      onChange={handleTestChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      💰 Price (₹)
                    </label>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={testForm.price}
                      onChange={handleTestChange}
                    />

                    <small>
                      ₹0 = Free Test
                    </small>
                  </div>

                </div>

              </div>

              {/* QUESTION MANAGER */}

              <div className="panel-card question-panel">

                <div className="question-header">

                  <div>
                    <h3>❓ Question Manager</h3>

                    <p>
                      Question {currentQuestion + 1} /{" "}
                      {questions.length}
                    </p>
                  </div>

                  <div className="question-actions">

                    <button
                      className="add-question-btn"
                      onClick={addQuestion}
                    >
                      ➕ Add Question
                    </button>

                    <button
                      className="delete-question-btn"
                      onClick={deleteQuestion}
                    >
                      🗑️ Delete Question
                    </button>

                  </div>

                </div>

                {/* QUESTION NUMBERS */}

                <div className="question-tabs">

                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={
                        currentQuestion === index
                          ? "question-tab active"
                          : "question-tab"
                      }
                      onClick={() =>
                        setCurrentQuestion(index)
                      }
                    >
                      {index + 1}
                    </button>
                  ))}

                </div>

                {/* QUESTION */}

                <div className="question-box">

                  <label>
                    ❓ Question {currentQuestion + 1}
                  </label>

                  <textarea
                    rows="4"
                    placeholder="यहाँ प्रश्न लिखें..."
                    value={current.question}
                    onChange={(e) =>
                      updateQuestion(
                        "question",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* OPTIONS */}

                <div className="options-section">

                  <h4>🔤 Options</h4>

                  {["A", "B", "C", "D"].map(
                    (option) => (
                      <div
                        className={`option-row ${
                          current.answer === option
                            ? "correct"
                            : ""
                        }`}
                        key={option}
                      >

                        <div className="option-label">
                          {option}
                        </div>

                        <input
                          type="text"
                          placeholder={`Option ${option}`}
                          value={
                            current.options?.[
                              option
                            ] || ""
                          }
                          onChange={(e) =>
                            updateOption(
                              option,
                              e.target.value
                            )
                          }
                        />

                        <label className="correct-radio">

                          <input
                            type="radio"
                            name={`answer-${currentQuestion}`}
                            checked={
                              current.answer ===
                              option
                            }
                            onChange={() =>
                              setCorrectAnswer(
                                option
                              )
                            }
                          />

                          सही उत्तर

                        </label>

                      </div>
                    )
                  )}

                </div>

                {/* EXPLANATION */}

                <div className="question-box">

                  <label>
                    💡 Explanation
                  </label>

                  <textarea
                    rows="4"
                    placeholder="सही उत्तर की व्याख्या लिखें..."
                    value={current.explanation}
                    onChange={(e) =>
                      updateQuestion(
                        "explanation",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="question-box">

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
                      current.explanationImage
                    }
                    onChange={(e) =>
                      updateQuestion(
                        "explanationImage",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* NAVIGATION */}

                <div className="question-navigation">

                  <button
                    className="secondary-btn"
                    disabled={currentQuestion === 0}
                    onClick={() =>
                      setCurrentQuestion(
                        (prev) =>
                          Math.max(prev - 1, 0)
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <span>
                    {currentQuestion + 1} /{" "}
                    {questions.length}
                  </span>

                  <button
                    className="secondary-btn"
                    disabled={
                      currentQuestion ===
                      questions.length - 1
                    }
                    onClick={() =>
                      setCurrentQuestion(
                        (prev) =>
                          Math.min(
                            prev + 1,
                            questions.length - 1
                          )
                      )
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* SAVE */}

              <div className="save-section">

                {message && (
                  <div className="success-message">
                    {message}
                  </div>
                )}

                <button
                  className="save-test-btn"
                  onClick={saveTest}
                  disabled={loading}
                >
                  {loading
                    ? "⏳ Saving..."
                    : "💾 Save Test to Firebase"}
                </button>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;

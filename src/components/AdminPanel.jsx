import React, { useEffect, useState } from "react";
import "../App.css";
import "./AdminPanel.css";

import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import firebaseConfig from "../firebase-config.json";

// ======================================================
// FIREBASE
// ======================================================

const firebaseApp = initializeApp({
  ...firebaseConfig,
  databaseURL:
    firebaseConfig.databaseURL ||
    "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

// ======================================================
// ADMIN
// ======================================================

const ADMIN_EMAIL = "cciashish@gmail.com";

// ======================================================
// EXAMS
// ======================================================

const exams = [
  { id: "upsc", name: "UPSC", icon: "🇮🇳" },
  { id: "uppcs", name: "UPPCS", icon: "🏛️" },
  { id: "uppet", name: "UP PET", icon: "🎯" },
  { id: "bpsc", name: "BPSC", icon: "🏛️" },
  { id: "mppsc", name: "MPPSC", icon: "📚" },
  { id: "ssc", name: "SSC", icon: "📝" },
  { id: "railway", name: "Railway", icon: "🚆" },
  { id: "banking", name: "Banking", icon: "🏦" },
  { id: "upsssc", name: "UPSSSC", icon: "📖" },
  { id: "roaro", name: "RO/ARO", icon: "📜" },
  { id: "police", name: "Police", icon: "👮" },
  { id: "teaching", name: "Teaching", icon: "👨‍🏫" },
];

// ======================================================
// QUESTION
// ======================================================

function createQuestion(id = 1) {
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    explanationImage: "",
  };
}

// ======================================================
// ADMIN PANEL
// ======================================================

export default function AdminPanel({
  user,
  tests = {},
  resources = [],
  onClose,
}) {
  // ====================================================
  // AUTH
  // ====================================================

  const [currentUser, setCurrentUser] = useState(
    user || null
  );

  const [authChecking, setAuthChecking] = useState(
    !user
  );

  // ====================================================
  // DATA
  // ====================================================

  const [cloudTests, setCloudTests] = useState(
    tests || {}
  );

  const [siteResources, setSiteResources] = useState(
    resources || []
  );

  // ====================================================
  // TEST SETTINGS
  // ====================================================

  const [selectedExam, setSelectedExam] =
    useState("uppcs");

  const [testNumber, setTestNumber] =
    useState(1);

  const [testTitle, setTestTitle] =
    useState("");

  const [testStatus, setTestStatus] =
    useState("draft");

  const [testDuration, setTestDuration] =
    useState(30);

  const [testPrice, setTestPrice] =
    useState(0);

  // ====================================================
  // QUESTIONS
  // ====================================================

  const [questions, setQuestions] =
    useState([createQuestion(1)]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  // ====================================================
  // UI
  // ====================================================

  const [activeSection, setActiveSection] =
    useState("tests");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ====================================================
  // AUTH LISTENER
  // ====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (loggedUser) => {
        setCurrentUser(loggedUser);
        setAuthChecking(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // LOAD TESTS
  // ====================================================

  useEffect(() => {
    const testsRef = ref(db, "tests");

    const unsubscribe = onValue(
      testsRef,
      (snapshot) => {
        setCloudTests(
          snapshot.val() || {}
        );
      },
      (error) => {
        console.error(
          "Admin tests error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // LOAD RESOURCES
  // ====================================================

  useEffect(() => {
    const resourceRef = ref(
      db,
      "siteContent/resources"
    );

    const unsubscribe = onValue(
      resourceRef,
      (snapshot) => {
        const value = snapshot.val();

        if (Array.isArray(value)) {
          setSiteResources(value);
        } else if (
          value &&
          typeof value === "object"
        ) {
          setSiteResources(
            Object.values(value)
          );
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // ADMIN SECURITY
  // ====================================================

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          ⏳ Exam Test Admin Panel Loading...
        </div>
      </div>
    );
  }

  if (
    !currentUser ||
    currentUser.email !== ADMIN_EMAIL
  ) {
    return (
      <div className="admin-page">
        <div className="admin-denied">

          <div className="denied-icon">
            🔐
          </div>

          <h2>
            Admin Access Denied
          </h2>

          <p>
            केवल authorized admin account
            से Admin Panel खोला जा सकता है।
          </p>

          <button
            className="admin-btn primary"
            onClick={onClose}
          >
            ← वापस जाएँ
          </button>

        </div>
      </div>
    );
  }

  // ====================================================
  // TEST ID
  // ====================================================

  const getTestId = () => {
    return `${selectedExam}_test_${testNumber}`;
  };

  // ====================================================
  // RESET
  // ====================================================

  const resetTestForm = () => {
    setSelectedExam("uppcs");
    setTestNumber(1);
    setTestTitle("");
    setTestStatus("draft");
    setTestDuration(30);
    setTestPrice(0);

    setQuestions([
      createQuestion(1),
    ]);

    setCurrentQuestion(0);
    setMessage("");
  };

  // ====================================================
  // LOAD TEST
  // ====================================================

  const loadTest = (id, test) => {
    if (!test) return;

    setActiveSection("tests");

    setSelectedExam(
      test.exam || "uppcs"
    );

    setTestNumber(
      Number(test.testNumber || 1)
    );

    setTestTitle(
      test.title || ""
    );

    setTestStatus(
      test.status || "draft"
    );

    setTestDuration(
      Number(test.duration || 30)
    );

    setTestPrice(
      Number(test.price || 0)
    );

    const loadedQuestions =
      Array.isArray(test.questions)
        ? test.questions
        : [];

    if (loadedQuestions.length) {
      setQuestions(
        loadedQuestions.map(
          (q, index) => ({
            id:
              q.id ??
              index + 1,

            question:
              q.question ||
              q.questionText ||
              "",

            options:
              Array.isArray(q.options)
                ? [
                    q.options[0] || "",
                    q.options[1] || "",
                    q.options[2] || "",
                    q.options[3] || "",
                  ]
                : [
                    "",
                    "",
                    "",
                    "",
                  ],

            answer:
              Number.isInteger(q.answer)
                ? q.answer
                : 0,

            explanation:
              q.explanation || "",

            explanationImage:
              q.explanationImage || "",
          })
        )
      );
    } else {
      setQuestions([
        createQuestion(1),
      ]);
    }

    setCurrentQuestion(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // ADD QUESTION
  // ====================================================

  const addQuestion = () => {
    if (questions.length >= 150) {
      alert(
        "अधिकतम 150 Questions रख सकते हैं।"
      );
      return;
    }

    const newQuestion =
      createQuestion(
        questions.length + 1
      );

    setQuestions((old) => [
      ...old,
      newQuestion,
    ]);

    setCurrentQuestion(
      questions.length
    );
  };

  // ====================================================
  // UPDATE QUESTION
  // ====================================================

  const updateQuestion = (
    field,
    value
  ) => {
    setQuestions((old) =>
      old.map((q, index) =>
        index === currentQuestion
          ? {
              ...q,
              [field]: value,
            }
          : q
      )
    );
  };

  // ====================================================
  // UPDATE OPTION
  // ====================================================

  const updateOption = (
    optionIndex,
    value
  ) => {
    setQuestions((old) =>
      old.map((q, index) => {
        if (
          index !== currentQuestion
        ) {
          return q;
        }

        const newOptions = [
          ...q.options,
        ];

        newOptions[
          optionIndex
        ] = value;

        return {
          ...q,
          options: newOptions,
        };
      })
    );
  };

  // ====================================================
  // DELETE QUESTION
  // ====================================================

  const deleteQuestion = () => {
    if (questions.length === 1) {
      alert(
        "कम से कम 1 Question होना चाहिए।"
      );
      return;
    }

    const ok = window.confirm(
      `Question ${
        currentQuestion + 1
      } delete करें?`
    );

    if (!ok) return;

    setQuestions((old) =>
      old
        .filter(
          (_, index) =>
            index !== currentQuestion
        )
        .map((q, index) => ({
          ...q,
          id: index + 1,
        }))
    );

    setCurrentQuestion((old) =>
      Math.max(
        0,
        Math.min(
          old,
          questions.length - 2
        )
      )
    );
  };

  // ====================================================
  // VALIDATE
  // ====================================================

  const validateTest = () => {
    if (!selectedExam) {
      alert(
        "Exam select करें।"
      );
      return false;
    }

    if (!testNumber) {
      alert(
        "Test Number डालें।"
      );
      return false;
    }

    if (!testTitle.trim()) {
      alert(
        "Test Title डालें।"
      );
      return false;
    }

    if (!questions.length) {
      alert(
        "कम से कम 1 Question डालें।"
      );
      return false;
    }

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const q =
        questions[i];

      if (
        !q.question.trim()
      ) {
        alert(
          `Question ${
            i + 1
          } खाली है।`
        );

        setCurrentQuestion(i);

        return false;
      }

      if (
        q.options.some(
          (option) =>
            !String(
              option || ""
            ).trim()
        )
      ) {
        alert(
          `Question ${
            i + 1
          } के सभी 4 options भरें।`
        );

        setCurrentQuestion(i);

        return false;
      }

      if (
        q.answer < 0 ||
        q.answer > 3
      ) {
        alert(
          `Question ${
            i + 1
          } का सही उत्तर select करें।`
        );

        setCurrentQuestion(i);

        return false;
      }
    }

    return true;
  };

  // ====================================================
  // SAVE TEST
  // ====================================================

  const saveTest = async () => {
    if (!validateTest()) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const id =
        getTestId();

      const cleanQuestions =
        questions.map(
          (q, index) => ({
            id: index + 1,

            question:
              q.question.trim(),

            options:
              q.options.map(
                (option) =>
                  String(
                    option || ""
                  ).trim()
              ),

            answer:
              Number(q.answer),

            explanation:
              String(
                q.explanation || ""
              ).trim(),

            explanationImage:
              String(
                q.explanationImage ||
                  ""
              ).trim(),
          })
        );

      const testData = {
        id,

        exam:
          selectedExam,

        testNumber:
          Number(testNumber),

        title:
          testTitle.trim(),

        status:
          testStatus,

        duration:
          Number(testDuration),

        price:
          Number(testPrice),

        questions:
          cleanQuestions,

        totalQuestions:
          cleanQuestions.length,

        updatedAt:
          Date.now(),

        updatedBy:
          currentUser?.email ||
          ADMIN_EMAIL,
      };

      await set(
        ref(db, `tests/${id}`),
        testData
      );

      setMessage(
        `✅ ${testTitle} successfully save हो गया।`
      );

      setCloudTests(
        (old) => ({
          ...old,
          [id]: testData,
        })
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {
      console.error(
        "Save test error:",
        error
      );

      alert(
        "❌ Test save नहीं हुआ:\n" +
          error.message
      );

    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // DELETE TEST
  // ====================================================

  const deleteTest = async (
    id,
    title
  ) => {
    const ok =
      window.confirm(
        `"${title}" को delete करना चाहते हैं?`
      );

    if (!ok) return;

    try {
      await remove(
        ref(db, `tests/${id}`)
      );

      alert(
        "✅ Test delete हो गया।"
      );

      if (
        id === getTestId()
      ) {
        resetTestForm();
      }

    } catch (error) {
      console.error(error);

      alert(
        "Delete error:\n" +
          error.message
      );
    }
  };

  // ====================================================
  // RESOURCE UPDATE
  // ====================================================

  const updateResource = (
    index,
    field,
    value
  ) => {
    setSiteResources(
      (old) =>
        old.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  };

  // ====================================================
  // SAVE RESOURCES
  // ====================================================

  const saveResources = async () => {
    try {
      setSaving(true);

      await set(
        ref(
          db,
          "siteContent/resources"
        ),
        siteResources
      );

      alert(
        "✅ Resources save हो गए।"
      );

    } catch (error) {
      alert(
        "Resources save error:\n" +
          error.message
      );

    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // TEST LIST
  // ====================================================

  const testEntries =
    Object.entries(
      cloudTests || {}
    ).sort(
      (a, b) =>
        Number(
          a[1]?.testNumber || 0
        ) -
        Number(
          b[1]?.testNumber || 0
        )
    );

  const currentQuestionData =
    questions[
      currentQuestion
    ] || createQuestion(1);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="admin-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div>
          <h1>
            ⚙️ Exam Test Admin Panel
          </h1>

          <p>
            Exam Test
          </p>
        </div>

        <div className="admin-header-right">

          <span className="admin-email">
            👤 {currentUser?.email}
          </span>

          <button
            className="admin-btn danger"
            onClick={onClose}
          >
            ✕ Close
          </button>

        </div>

      </header>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="admin-tabs">

        <button
          className={
            activeSection === "tests"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("tests")
          }
        >
          📝 Test Manager
        </button>

        <button
          className={
            activeSection === "resources"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("resources")
          }
        >
          📚 Resources
        </button>

      </div>

      {/* =================================================
          TEST MANAGER
      ================================================= */}

      {activeSection === "tests" && (
        <div className="admin-content">

          {/* =================================================
              TEST SETTINGS
          ================================================= */}

          <div className="admin-card">

            <div className="card-title">

              <div>
                <h2>
                  📝 Exam & Test Manager
                </h2>

                <p>
                  Exam → Test → Questions
                  manage करें
                </p>
              </div>

              <button
                className="admin-btn secondary"
                onClick={resetTestForm}
              >
                ＋ New Test
              </button>

            </div>

            <div className="form-grid">

              {/* EXAM */}

              <div className="form-group">

                <label>
                  🎯 Exam
                </label>

                <select
                  value={selectedExam}
                  onChange={(e) =>
                    setSelectedExam(
                      e.target.value
                    )
                  }
                >
                  {exams.map(
                    (exam) => (
                      <option
                        key={exam.id}
                        value={exam.id}
                      >
                        {exam.icon}{" "}
                        {exam.name}
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
                  value={testNumber}
                  onChange={(e) =>
                    setTestNumber(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

              </div>

              {/* TEST TITLE */}

              <div className="form-group full">

                <label>
                  📚 Test Title
                </label>

                <input
                  type="text"
                  placeholder="जैसे UP PET Test 01"
                  value={testTitle}
                  onChange={(e) =>
                    setTestTitle(
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
                  value={testStatus}
                  onChange={(e) =>
                    setTestStatus(
                      e.target.value
                    )
                  }
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="public">
                    Public
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
                  value={testDuration}
                  onChange={(e) =>
                    setTestDuration(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label>
                  💰 Test Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={testPrice}
                  onChange={(e) =>
                    setTestPrice(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

                <small>
                  ₹0 = Free Test
                </small>

              </div>

            </div>

          </div>

          {/* =================================================
              QUESTION EDITOR
          ================================================= */}

          <div className="admin-card">

            <div className="card-title">

              <div>
                <h2>
                  ❓ Questions
                </h2>

                <p>
                  Total Questions:{" "}
                  <strong>
                    {questions.length}
                  </strong>
                </p>
              </div>

              <button
                className="admin-btn primary"
                onClick={addQuestion}
              >
                ＋ Add Question
              </button>

            </div>

            {/* QUESTION NAV */}

            <div className="question-navigation">

              {questions.map(
                (q, index) => (
                  <button
                    key={q.id}
                    className={
                      currentQuestion === index
                        ? "question-number active"
                        : "question-number"
                    }
                    onClick={() =>
                      setCurrentQuestion(
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

            <div className="question-editor">

              <div className="question-editor-header">

                <h3>
                  Question{" "}
                  {currentQuestion + 1}
                </h3>

                <button
                  className="admin-btn danger"
                  onClick={
                    deleteQuestion
                  }
                >
                  🗑️ Delete
                </button>

              </div>

              {/* QUESTION */}

              <div className="form-group">

                <label>
                  प्रश्न
                </label>

                <textarea
                  rows="4"
                  placeholder="यहाँ प्रश्न लिखें..."
                  value={
                    currentQuestionData.question
                  }
                  onChange={(e) =>
                    updateQuestion(
                      "question",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* OPTIONS */}

              <div className="options-box">

                <h3>
                  चार Options
                </h3>

                {currentQuestionData.options.map(
                  (option, index) => (
                    <div
                      className="option-row"
                      key={index}
                    >

                      <span className="option-label">
                        {String.fromCharCode(
                          65 + index
                        )}
                      </span>

                      <input
                        type="text"
                        placeholder={`Option ${
                          index + 1
                        }`}
                        value={option}
                        onChange={(e) =>
                          updateOption(
                            index,
                            e.target.value
                          )
                        }
                      />

                    </div>
                  )
                )}

              </div>

              {/* ANSWER */}

              <div className="form-group">

                <label>
                  ✅ सही उत्तर
                </label>

                <select
                  value={
                    currentQuestionData.answer
                  }
                  onChange={(e) =>
                    updateQuestion(
                      "answer",
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  <option value={0}>
                    A
                  </option>

                  <option value={1}>
                    B
                  </option>

                  <option value={2}>
                    C
                  </option>

                  <option value={3}>
                    D
                  </option>

                </select>

              </div>

              {/* EXPLANATION */}

              <div className="form-group">

                <label>
                  💡 Explanation
                </label>

                <textarea
                  rows="5"
                  placeholder="सही उत्तर का explanation लिखें..."
                  value={
                    currentQuestionData.explanation
                  }
                  onChange={(e) =>
                    updateQuestion(
                      "explanation",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* IMAGE URL */}

              <div className="form-group">

                <label>
                  🖼️ Explanation Image URL
                </label>

                <input
                  type="text"
                  placeholder="https://..."
                  value={
                    currentQuestionData.explanationImage
                  }
                  onChange={(e) =>
                    updateQuestion(
                      "explanationImage",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* QUESTION CONTROLS */}

            <div className="question-controls">

              <button
                className="admin-btn secondary"
                disabled={
                  currentQuestion === 0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (old) =>
                      Math.max(
                        0,
                        old - 1
                      )
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
                className="admin-btn secondary"
                disabled={
                  currentQuestion ===
                  questions.length - 1
                }
                onClick={() =>
                  setCurrentQuestion(
                    (old) =>
                      Math.min(
                        questions.length - 1,
                        old + 1
                      )
                  )
                }
              >
                Next →
              </button>

            </div>

          </div>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="admin-card save-card">

            <div>
              <h3>
                💾 Save Test
              </h3>

              <p>
                Exam:{" "}
                <strong>
                  {
                    exams.find(
                      (e) =>
                        e.id ===
                        selectedExam
                    )?.name
                  }
                </strong>
                {" | "}
                Test:{" "}
                <strong>
                  {testTitle ||
                    `Test ${testNumber}`}
                </strong>
                {" | "}
                Questions:{" "}
                <strong>
                  {questions.length}
                </strong>
              </p>
            </div>

            <button
              className="admin-btn success"
              onClick={saveTest}
              disabled={saving}
            >
              {saving
                ? "⏳ Saving..."
                : "💾 Save Test"}
            </button>

          </div>

          {/* =================================================
              EXISTING TESTS
          ================================================= */}

          <div className="admin-card">

            <div className="card-title">

              <div>
                <h2>
                  📋 Existing Tests
                </h2>

                <p>
                  Firebase में saved tests
                </p>
              </div>

            </div>

            {testEntries.length === 0 ? (
              <div className="empty-box">
                अभी कोई Test नहीं है।
              </div>
            ) : (
              <div className="test-list">

                {testEntries.map(
                  ([id, test]) => {

                    const exam =
                      exams.find(
                        (e) =>
                          e.id ===
                          test.exam
                      );

                    return (
                      <div
                        className="test-list-item"
                        key={id}
                      >

                        <div className="test-info">

                          <div className="test-icon">
                            {exam?.icon ||
                              "📝"}
                          </div>

                          <div>

                            <h3>
                              {test.title ||
                                "Untitled Test"}
                            </h3>

                            <p>
                              {exam?.name ||
                                test.exam}{" "}
                              • Test{" "}
                              {test.testNumber ||
                                "-"}{" "}
                              •{" "}
                              {test.totalQuestions ||
                                test.questions
                                  ?.length ||
                                0}{" "}
                              Questions
                            </p>

                            <small>
                              💰 ₹
                              {test.price ||
                                0}
                              {" • "}
                              📢{" "}
                              {test.status ||
                                "draft"}
                            </small>

                          </div>

                        </div>

                        <div className="test-actions">

                          <button
                            className="admin-btn secondary"
                            onClick={() =>
                              loadTest(
                                id,
                                test
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="admin-btn danger"
                            onClick={() =>
                              deleteTest(
                                id,
                                test.title ||
                                  "Test"
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* =================================================
          RESOURCES
      ================================================= */}

      {activeSection ===
        "resources" && (
        <div className="admin-content">

          <div className="admin-card">

            <div className="card-title">

              <div>
                <h2>
                  📚 Resources Manager
                </h2>

                <p>
                  App के Resources manage करें
                </p>
              </div>

              <button
                className="admin-btn success"
                onClick={saveResources}
                disabled={saving}
              >
                {saving
                  ? "⏳ Saving..."
                  : "💾 Save Resources"}
              </button>

            </div>

            {siteResources.length ===
            0 ? (
              <div className="empty-box">
                कोई Resource उपलब्ध नहीं है।
              </div>
            ) : (
              <div className="resources-editor">

                {siteResources.map(
                  (resource, index) => (
                    <div
                      className="resource-editor-item"
                      key={index}
                    >

                      <div className="form-group">

                        <label>
                          Icon
                        </label>

                        <input
                          type="text"
                          value={
                            resource.icon ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "icon",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Title
                        </label>

                        <input
                          type="text"
                          value={
                            resource.title ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Description
                        </label>

                        <textarea
                          rows="3"
                          value={
                            resource.text ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "text",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Page
                        </label>

                        <input
                          type="text"
                          value={
                            resource.page ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "page",
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <label className="resource-enabled">

                        <input
                          type="checkbox"
                          checked={
                            resource.enabled !==
                            false
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "enabled",
                              e.target.checked
                            )
                          }
                        />

                        Active / Visible

                      </label>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

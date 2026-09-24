import React, { useEffect, useState } from "react";
import "./AdminPanel.css";

import { getApps, getApp, initializeApp } from "firebase/app";
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

/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      databaseURL:
        firebaseConfig.databaseURL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

const db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);

/* =========================================================
   ADMIN
   ========================================================= */

const ADMIN_EMAIL = "cciashish@gmail.com";

/* =========================================================
   EXAMS
   ========================================================= */

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

/* =========================================================
   DEFAULT QUESTION
   ========================================================= */

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

/* =========================================================
   ADMIN PANEL
   ========================================================= */

export default function AdminPanel({
  user,
  tests = {},
  resources = [],
  onClose,
}) {
  const [currentUser, setCurrentUser] = useState(user || null);
  const [authChecking, setAuthChecking] = useState(!user);

  const [cloudTests, setCloudTests] = useState(tests || {});
  const [siteResources, setSiteResources] = useState(resources || []);

  /* TEST SETTINGS */

  const [selectedExam, setSelectedExam] = useState("uppcs");
  const [testNumber, setTestNumber] = useState(1);
  const [testTitle, setTestTitle] = useState("");
  const [testStatus, setTestStatus] = useState("draft");
  const [testDuration, setTestDuration] = useState(30);
  const [testPrice, setTestPrice] = useState(0);

  /* QUESTIONS */

  const [questions, setQuestions] = useState([
    createQuestion(1),
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  /* UI */

  const [activeSection, setActiveSection] = useState("tests");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* =======================================================
     AUTH
     ======================================================= */

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

  /* =======================================================
     LOAD TESTS
     ======================================================= */

  useEffect(() => {
    const testsRef = ref(db, "tests");

    const unsubscribe = onValue(
      testsRef,
      (snapshot) => {
        setCloudTests(snapshot.val() || {});
      },
      (error) => {
        console.error("Admin tests error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =======================================================
     LOAD RESOURCES
     ======================================================= */

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
          setSiteResources(Object.values(value));
        } else {
          setSiteResources([]);
        }
      },
      (error) => {
        console.error(
          "Resources load error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  /* =======================================================
     AUTH CHECK
     ======================================================= */

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
    currentUser.email?.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
  ) {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <div className="denied-icon">
            🔐
          </div>

          <h2>Admin Access Denied</h2>

          <p>
            केवल authorized admin account से
            Admin Panel खोला जा सकता है।
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

  /* =======================================================
     HELPERS
     ======================================================= */

  const getTestId = () =>
    `${selectedExam}_test_${Number(testNumber)}`;

  const getExamName = (id) =>
    exams.find(
      (exam) => exam.id === id
    )?.name || id;

  /* =======================================================
     RESET FORM
     ======================================================= */

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     LOAD TEST
     ======================================================= */

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
              q?.id ??
              index + 1,

            question:
              q?.question ||
              q?.questionText ||
              "",

            options:
              Array.isArray(q?.options)
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
              Number.isInteger(
                Number(q?.answer)
              )
                ? Math.max(
                    0,
                    Math.min(
                      3,
                      Number(q.answer)
                    )
                  )
                : 0,

            explanation:
              q?.explanation || "",

            explanationImage:
              q?.explanationImage ||
              "",
          })
        )
      );
    } else {
      setQuestions([
        createQuestion(1),
      ]);
    }

    setCurrentQuestion(0);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     ADD QUESTION
     ======================================================= */

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

    setTimeout(() => {
      window.scrollTo({
        top:
          document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  /* =======================================================
     UPDATE QUESTION
     ======================================================= */

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

  /* =======================================================
     UPDATE OPTION
     ======================================================= */

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

  /* =======================================================
     DELETE QUESTION
     ======================================================= */

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

    const newQuestions =
      questions
        .filter(
          (_, index) =>
            index !== currentQuestion
        )
        .map((q, index) => ({
          ...q,
          id: index + 1,
        }));

    setQuestions(newQuestions);

    setCurrentQuestion((old) =>
      Math.max(
        0,
        Math.min(
          old,
          newQuestions.length - 1
        )
      )
    );
  };

  /* =======================================================
     VALIDATE TEST
     ======================================================= */

  const validateTest = () => {
    if (!selectedExam) {
      alert(
        "Exam select करें।"
      );
      return false;
    }

    if (
      !Number(testNumber) ||
      Number(testNumber) < 1
    ) {
      alert(
        "Test Number सही डालें।"
      );
      return false;
    }

    if (!testTitle.trim()) {
      alert(
        "Test Title डालें।"
      );
      return false;
    }

    if (
      !Number(testDuration) ||
      Number(testDuration) < 1
    ) {
      alert(
        "Duration सही डालें।"
      );
      return false;
    }

    if (Number(testPrice) < 0) {
      alert(
        "Price सही डालें।"
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
        !String(
          q.question || ""
        ).trim()
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
        !Array.isArray(
          q.options
        ) ||
        q.options.length !== 4 ||
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
        !Number.isInteger(
          Number(q.answer)
        ) ||
        Number(q.answer) < 0 ||
        Number(q.answer) > 3
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

  /* =======================================================
     SAVE TEST
     ======================================================= */

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
              String(
                q.question || ""
              ).trim(),

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
                q.explanation ||
                  ""
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

        examName:
          getExamName(
            selectedExam
          ),

        testNumber:
          Number(testNumber),

        title:
          testTitle.trim(),

        status:
          testStatus,

        duration:
          Number(
            testDuration
          ) || 30,

        price:
          Number(
            testPrice
          ) || 0,

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
        ref(
          db,
          `tests/${id}`
        ),
        testData
      );

      setCloudTests(
        (old) => ({
          ...old,
          [id]:
            testData,
        })
      );

      setMessage(
        `✅ ${testTitle.trim()} successfully save हो गया।`
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

  /* =======================================================
     DELETE TEST
     ======================================================= */

  const deleteTest = async (
    id,
    title
  ) => {
    const ok =
      window.confirm(
        `"${title || id}" को delete करना चाहते हैं?`
      );

    if (!ok) return;

    try {
      await remove(
        ref(
          db,
          `tests/${id}`
        )
      );

      setCloudTests(
        (old) => {
          const copy = {
            ...old,
          };

          delete copy[id];

          return copy;
        }
      );

      if (
        id ===
        getTestId()
      ) {
        resetTestForm();
      }

      alert(
        "✅ Test delete हो गया।"
      );
    } catch (error) {
      console.error(
        "Delete test error:",
        error
      );

      alert(
        "❌ Delete error:\n" +
          error.message
      );
    }
  };

  /* =======================================================
     RESOURCES
     ======================================================= */

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

  const saveResources =
    async () => {
      try {
        setSaving(true);

        await set(
          ref(
            db,
            "siteContent/resources"
          ),
          siteResources
        );

        setMessage(
          "✅ Resources save हो गए।"
        );
      } catch (error) {
        console.error(
          "Resources save error:",
          error
        );

        alert(
          "❌ Resources save error:\n" +
            error.message
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     ADD RESOURCE
     ======================================================= */

  const addResource = () => {
    setSiteResources(
      (old) => [
        ...old,
        {
          title: "",
          description: "",
          url: "",
          image: "",
        },
      ]
    );
  };

  /* =======================================================
     DELETE RESOURCE
     ======================================================= */

  const deleteResource = (
    index
  ) => {
    const ok =
      window.confirm(
        "यह resource delete करें?"
      );

    if (!ok) return;

    setSiteResources(
      (old) =>
        old.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  /* =======================================================
     TEST LIST
     ======================================================= */

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
    ] ||
    createQuestion(1);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="admin-page">

      {/* HEADER */}

      <header className="admin-header">

        <div className="admin-header-title">
          <h1>
            ⚙️ Exam Test Admin Panel
          </h1>

          <p>
            Exam Test
          </p>
        </div>

        <div className="admin-header-right">

          <span className="admin-email">
            👤{" "}
            {currentUser?.email}
          </span>

          <button
            className="admin-btn danger"
            onClick={onClose}
          >
            ✕ Close
          </button>

        </div>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {/* TABS */}

      <div className="admin-tabs">

        <button
          className={
            activeSection ===
            "tests"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection(
              "tests"
            )
          }
        >
          📝 Test Manager
        </button>

        <button
          className={
            activeSection ===
            "resources"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection(
              "resources"
            )
          }
        >
          📚 Resources
        </button>

      </div>

      {/* ==================================================
          TEST MANAGER
          ================================================== */}

      {activeSection ===
        "tests" && (
        <div className="admin-content">

          {/* TEST SETTINGS */}

          <div className="admin-card">

            <div className="card-title">

              <div>
                <h2>
                  📝 Exam & Test Manager
                </h2>

                <p>
                  Exam → Test → Questions manage करें
                </p>
              </div>

              <button
                className="admin-btn secondary"
                onClick={
                  resetTestForm
                }
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
                  value={
                    selectedExam
                  }
                  onChange={(e) =>
                    setSelectedExam(
                      e.target.value
                    )
                  }
                >
                  {exams.map(
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
                          exam.icon
                        }{" "}
                        {
                          exam.name
                        }
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
                    testNumber
                  }
                  onChange={(e) =>
                    setTestNumber(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* TITLE */}

              <div className="form-group form-group-full">

                <label>
                  📌 Test Title
                </label>

                <input
                  type="text"
                  placeholder="जैसे: UPPCS Test 01 - History"
                  value={
                    testTitle
                  }
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
                  value={
                    testStatus
                  }
                  onChange={(e) =>
                    setTestStatus(
                      e.target.value
                    )
                  }
                >
                  <option value="draft">
                    📝 Draft
                  </option>

                  <option value="unlisted">
                    🔗 Unlisted
                  </option>

                  <option value="public">
                    🌐 Public
                  </option>
                </select>

              </div>

              {/* DURATION */}

              <div className="form-group">

                <label>
                  ⏱️ Duration (Minutes)
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    testDuration
                  }
                  onChange={(e) =>
                    setTestDuration(
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
                    testPrice
                  }
                  onChange={(e) =>
                    setTestPrice(
                      e.target.value
                    )
                  }
                />

                <small>
                  ₹0 = Free Test
                </small>

              </div>

            </div>

          </div>

          {/* QUESTION MANAGER */}

          <div className="admin-card">

            <div className="card-title question-card-title">

              <div>
                <h2>
                  ❓ Question Manager
                </h2>

                <p>
                  Question{" "}
                  {currentQuestion +
                    1}{" "}
                  /{" "}
                  {
                    questions.length
                  }
                </p>
              </div>

              <div className="question-top-actions">

                <button
                  className="admin-btn secondary"
                  onClick={
                    addQuestion
                  }
                >
                  ＋ Add Question
                </button>

                <button
                  className="admin-btn danger"
                  onClick={
                    deleteQuestion
                  }
                >
                  🗑️ Delete Question
                </button>

              </div>

            </div>

            {/* QUESTION NUMBERS */}

            <div className="question-number-list">

              {questions.map(
                (q, index) => (
                  <button
                    key={
                      q.id
                    }
                    type="button"
                    className={
                      index ===
                      currentQuestion
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

            {/* QUESTION */}

            <div className="form-group form-group-full">

              <label>
                ❓ Question{" "}
                {currentQuestion +
                  1}
              </label>

              <textarea
                rows="5"
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

            <div className="options-editor">

              <h3>
                🔤 Options
              </h3>

              {currentQuestionData.options.map(
                (
                  option,
                  index
                ) => (
                  <div
                    className="option-row"
                    key={index}
                  >

                    <div className="option-label">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(
                        65 + index
                      )}`}
                      value={
                        option
                      }
                      onChange={(e) =>
                        updateOption(
                          index,
                          e.target
                            .value
                        )
                      }
                    />

                    <label className="answer-radio">

                      <input
                        type="radio"
                        name={`answer-${currentQuestion}`}
                        checked={
                          Number(
                            currentQuestionData.answer
                          ) ===
                          index
                        }
                        onChange={() =>
                          updateQuestion(
                            "answer",
                            index
                          )
                        }
                      />

                      <span>
                        सही
                      </span>

                    </label>

                  </div>
                )
              )}

            </div>

            {/* EXPLANATION */}

            <div className="form-group form-group-full">

              <label>
                💡 सही उत्तर की व्याख्या
              </label>

              <textarea
                rows="5"
                placeholder="सही उत्तर की व्याख्या लिखें..."
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

            {/* EXPLANATION IMAGE */}

            <div className="form-group form-group-full">

              <label>
                🖼️ Explanation Image URL
              </label>

              <input
                type="url"
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

            {/* SAVE BUTTON */}

            <div className="save-test-area">

              <button
                className="save-test-btn"
                onClick={
                  saveTest
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "⏳ Saving..."
                  : "💾 Save Test"}
              </button>

            </div>

          </div>

          {/* EXISTING TESTS */}

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

            {testEntries.length ===
            0 ? (
              <div className="empty-box">
                अभी कोई Test save नहीं है।
              </div>
            ) : (
              <div className="test-list">

                {testEntries.map(
                  ([id, test]) => (
                    <div
                      className="test-list-item"
                      key={id}
                    >

                      <div className="test-list-info">

                        <strong>
                          {test.testNumber
                            ? `Test ${test.testNumber} - `
                            : ""}
                          {test.title ||
                            id}
                        </strong>

                        <span>
                          {getExamName(
                            test.exam
                          )}{" "}
                          •{" "}
                          {test.totalQuestions ||
                            test.questions
                              ?.length ||
                            0}{" "}
                          Questions •{" "}
                          {test.duration ||
                            0}{" "}
                          min
                        </span>

                        <span
                          className={`status-badge ${test.status || "draft"}`}
                        >
                          {test.status ===
                          "public"
                            ? "🌐 Public"
                            : test.status ===
                              "unlisted"
                            ? "🔗 Unlisted"
                            : "📝 Draft"}
                        </span>

                      </div>

                      <div className="test-list-actions">

                        <button
                          className="admin-btn edit"
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
                              test.title
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* ==================================================
          RESOURCES
          ================================================== */}

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
                  Website resources manage करें
                </p>
              </div>

              <button
                className="admin-btn secondary"
                onClick={
                  addResource
                }
              >
                ＋ Add Resource
              </button>

            </div>

            {siteResources.length ===
            0 ? (
              <div className="empty-box">
                अभी कोई resource नहीं है।
              </div>
            ) : (
              <div className="resources-list">

                {siteResources.map(
                  (
                    resource,
                    index
                  ) => (
                    <div
                      className="resource-editor"
                      key={index}
                    >

                      <div className="resource-number">
                        Resource{" "}
                        {index + 1}
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
                              e.target
                                .value
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
                            resource.description ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "description",
                              e.target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          URL
                        </label>

                        <input
                          type="url"
                          value={
                            resource.url ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "url",
                              e.target
                                .value
                            )
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Image URL
                        </label>

                        <input
                          type="url"
                          value={
                            resource.image ||
                            ""
                          }
                          onChange={(e) =>
                            updateResource(
                              index,
                              "image",
                              e.target
                                .value
                            )
                          }
                        />

                      </div>

                      <button
                        className="admin-btn danger"
                        onClick={() =>
                          deleteResource(
                            index
                          )
                        }
                      >
                        🗑️ Delete Resource
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

            <div className="save-resource-area">

              <button
                className="save-test-btn"
                onClick={
                  saveResources
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "⏳ Saving..."
                  : "💾 Save Resources"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

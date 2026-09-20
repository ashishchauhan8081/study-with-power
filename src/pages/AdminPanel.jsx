import React, { useEffect, useState } from "react";
import "../App.css";
import "./AdminPanel.css";

import {
  getApps,
  getApp,
  initializeApp,
} from "firebase/app";

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
  const [currentUser, setCurrentUser] =
    useState(user || null);

  const [authChecking, setAuthChecking] =
    useState(!user);

  const [cloudTests, setCloudTests] =
    useState(tests || {});

  const [siteResources, setSiteResources] =
    useState(resources || []);

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

  const [questions, setQuestions] =
    useState([createQuestion(1)]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [activeSection, setActiveSection] =
    useState("tests");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ====================================================
  // AUTH
  // ====================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (loggedUser) => {
          setCurrentUser(loggedUser);
          setAuthChecking(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // TESTS
  // ====================================================

  useEffect(() => {
    const testsRef =
      ref(db, "tests");

    const unsubscribe =
      onValue(
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
  // RESOURCES
  // ====================================================

  useEffect(() => {
    const resourceRef =
      ref(
        db,
        "siteContent/resources"
      );

    const unsubscribe =
      onValue(
        resourceRef,
        (snapshot) => {
          const value =
            snapshot.val();

          if (
            Array.isArray(value)
          ) {
            setSiteResources(value);
          } else if (
            value &&
            typeof value === "object"
          ) {
            setSiteResources(
              Object.values(value)
            );
          } else {
            setSiteResources([]);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // SECURITY
  // ====================================================

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          ⏳ Admin Panel Loading...
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
  // HELPERS
  // ====================================================

  const getTestId = () =>
    `${selectedExam}_test_${testNumber}`;

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

    const loaded =
      Array.isArray(test.questions)
        ? test.questions
        : [];

    if (loaded.length) {
      setQuestions(
        loaded.map(
          (q, index) => ({
            id:
              q?.id ??
              index + 1,

            question:
              q?.question ||
              q?.questionText ||
              "",

            options:
              Array.isArray(
                q?.options
              )
                ? [
                    q.options[0] ||
                      "",
                    q.options[1] ||
                      "",
                    q.options[2] ||
                      "",
                    q.options[3] ||
                      "",
                  ]
                : [
                    "",
                    "",
                    "",
                    "",
                  ],

            answer:
              Number.isInteger(
                q?.answer
              )
                ? Math.max(
                    0,
                    Math.min(
                      3,
                      q.answer
                    )
                  )
                : 0,

            explanation:
              q?.explanation ||
              "",

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
      old.map(
        (q, index) =>
          index ===
          currentQuestion
            ? {
                ...q,
                [field]:
                  value,
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
      old.map(
        (q, index) => {
          if (
            index !==
            currentQuestion
          ) {
            return q;
          }

          const newOptions =
            [...q.options];

          newOptions[
            optionIndex
          ] = value;

          return {
            ...q,
            options:
              newOptions,
          };
        }
      )
    );
  };

  // ====================================================
  // DELETE QUESTION
  // ====================================================

  const deleteQuestion = () => {
    if (
      questions.length === 1
    ) {
      alert(
        "कम से कम 1 Question होना चाहिए।"
      );
      return;
    }

    const ok =
      window.confirm(
        `Question ${
          currentQuestion + 1
        } delete करें?`
      );

    if (!ok) return;

    const newQuestions =
      questions
        .filter(
          (_, index) =>
            index !==
            currentQuestion
        )
        .map(
          (q, index) => ({
            ...q,
            id:
              index + 1,
          })
        );

    setQuestions(
      newQuestions
    );

    setCurrentQuestion(
      (old) =>
        Math.max(
          0,
          Math.min(
            old,
            newQuestions.length -
              1
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

    if (
      !Number(testNumber) ||
      Number(testNumber) < 1
    ) {
      alert(
        "Test Number सही डालें।"
      );
      return false;
    }

    if (
      !testTitle.trim()
    ) {
      alert(
        "Test Title डालें।"
      );
      return false;
    }

    if (
      !questions.length
    ) {
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

        setCurrentQuestion(
          i
        );

        return false;
      }

      if (
        !Array.isArray(
          q.options
        ) ||
        q.options.length !==
          4 ||
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

        setCurrentQuestion(
          i
        );

        return false;
      }

      if (
        !Number.isInteger(
          Number(q.answer)
        ) ||
        Number(q.answer) <
          0 ||
        Number(q.answer) >
          3
      ) {
        alert(
          `Question ${
            i + 1
          } का सही उत्तर select करें।`
        );

        setCurrentQuestion(
          i
        );

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
            id:
              index + 1,

            question:
              String(
                q.question ||
                  ""
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
          const copy =
            {
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
      alert(
        "❌ Delete error:\n" +
          error.message
      );
    }
  };

  // ====================================================
  // RESOURCES
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

        alert(
          "✅ Resources save हो गए।"
        );
      } catch (error) {
        alert(
          "❌ Resources save error:\n" +
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
          a[1]?.testNumber ||
            0
        ) -
        Number(
          b[1]?.testNumber ||
            0
        )
    );

  const currentQuestionData =
    questions[
      currentQuestion
    ] ||
    createQuestion(1);

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="admin-page">

      <header className="admin-header">
        <div>
          <h1>
            ⚙️ Exam Test Admin Panel
          </h1>

          <p>
            Exam Test Management
          </p>
        </div>

        <div className="admin-header-right">
          <span className="admin-email">
            👤{" "}
            {
              currentUser?.email
            }
          </span>

          <button
            className="admin-btn danger"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>
      </header>

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

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

      {activeSection ===
        "tests" && (
        <div className="admin-content">

          {/* SETTINGS */}

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
                onClick={
                  resetTestForm
                }
              >
                ＋ New Test
              </button>

            </div>

            <div className="form-grid">

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
                      e.target
                        .value
                    )
                  }
                >
                  {exams.map(
                    (exam) => (
                      <option
                        key={
                          exam.id
                        }
  

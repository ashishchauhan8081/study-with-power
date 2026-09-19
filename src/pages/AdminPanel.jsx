import React, { useEffect, useState } from "react";
import "../App.css";
import "./AdminPanel.css";

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

import { initializeApp } from "firebase/app";

import firebaseConfig from "../firebase-config.json";

import QuestionManager from "./QuestionManager";

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
// DEFAULT QUESTION
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

  const [currentUser, setCurrentUser] =
    useState(user || null);

  const [authChecking, setAuthChecking] =
    useState(!user);

  // ====================================================
  // FIREBASE DATA
  // ====================================================

  const [cloudTests, setCloudTests] =
    useState(tests || {});

  const [siteResources, setSiteResources] =
    useState(resources || []);

  // ====================================================
  // TEST DETAILS
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
  // LOAD TESTS
  // ====================================================

  useEffect(() => {
    const testsRef = ref(db, "tests");

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
  // LOAD RESOURCES
  // ====================================================

  useEffect(() => {
    const resourceRef = ref(
      db,
      "siteContent/resources"
    );

    const unsubscribe =
      onValue(
        resourceRef,
        (snapshot) => {
          const value =
            snapshot.val();

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
        (error) => {
          console.error(
            "Resource error:",
            error
          );
        }
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
  // TEST ID
  // ====================================================

  const getTestId = () => {
    return `${selectedExam}_test_${testNumber}`;
  };

  // ====================================================
  // RESET TEST
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      Number(
        test.testNumber || 1
      )
    );

    setTestTitle(
      test.title || ""
    );

    setTestStatus(
      test.status || "draft"
    );

    setTestDuration(
      Number(
        test.duration || 30
      )
    );

    setTestPrice(
      Number(
        test.price || 0
      )
    );

    const loadedQuestions =
      Array.isArray(test.questions)
        ? test.questions
        : [];

    if (
      loadedQuestions.length
    ) {
      setQuestions(
        loadedQuestions.map(
          (q, index) => ({
            id:
              q?.id ??
              index + 1,

            question:
              q?.question ||
              q?.questionText ||
              q?.text ||
              "",

            options:
              Array.isArray(
                q?.options
              )
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
              normalizeAnswer(
                q?.answer
              ),

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

    setMessage(
      `✏️ ${test.title || "Test"} edit mode में खुल गया।`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // VALIDATE TEST
  // ====================================================

  const validateTest = () => {
    if (!selectedExam) {
      alert(
        "कृपया Exam select करें।"
      );
      return false;
    }

    if (
      !testNumber ||
      Number(testNumber) < 1
    ) {
      alert(
        "सही Test Number डालें।"
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
        "कम से कम 1 Question होना चाहिए।"
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
        q.options.length < 4
      ) {
        alert(
          `Question ${
            i + 1
          } के 4 Options जरूरी हैं।`
        );

        setCurrentQuestion(i);

        return false;
      }

      for (
        let j = 0;
        j < 4;
        j++
      ) {
        if (
          !String(
            q.options[j] || ""
          ).trim()
        ) {
          alert(
            `Question ${
              i + 1
            } का Option ${
              String.fromCharCode(
                65 + j
              )
            } खाली है।`
          );

          setCurrentQuestion(i);

          return false;
        }
      }

      if (
        Number(q.answer) < 0 ||
        Number(q.answer) > 3
      ) {
        alert(
          `Question ${
            i + 1
          } का सही Answer select करें।`
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
            id:
              index + 1,

            question:
              String(
                q.question || ""
              ).trim(),

            options:
              q.options
                .slice(0, 4)
                .map(
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
        ref(
          db,
          `tests/${id}`
        ),
        testData
      );

      setCloudTests(
        (old) => ({
          ...old,
          [id]: testData,
        })
      );

      setMessage(
        `✅ ${testTitle} successfully save हो गया।`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {
      console.error(
        "Save Test Error:",
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
        id === getTestId()
      ) {
        resetTestForm();
      }

      alert(
        "✅ Test delete हो गया।"
      );

    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "❌ Test delete नहीं हुआ:\n" +
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
        console.error(
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

  // ====================================================
  // ADD RESOURCE
  // ====================================================

  const addResource = () => {
    setSiteResources(
      (old) => [
        ...old,
        {
          icon: "📚",
          title: "New Resource",
          text: "",
          page: "resources",
          enabled: true,
        },
      ]
    );
  };

  // ====================================================
  // DELETE RESOURCE
  // ====================================================

  const deleteResource = (
    index
  ) => {
    const ok =
      window.confirm(
        "यह Resource delete करें?"
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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="admin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="admin-header">

        <div>
          <h1>
            ⚙️ Admin Panel
          </h1>

          <p>
            Study With Power
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

      {/* ==================================================
          MESSAGE
      ================================================== */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {/* ==================================================
          TABS
      ================================================== */}

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
                  📝 Test Manager
                </h2>

                <p>
                  Test की basic details
                  भरें
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
    

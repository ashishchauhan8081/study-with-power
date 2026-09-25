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
   ADMIN EMAIL
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
   EMPTY QUESTION
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
   JSON NORMALIZER
========================================================= */

function normalizeImportedQuestions(data) {
  let source = [];

  if (Array.isArray(data)) {
    source = data;
  } else if (Array.isArray(data?.questions)) {
    source = data.questions;
  } else if (Array.isArray(data?.data)) {
    source = data.data;
  }

  return source.map((q, index) => {
    let answerValue =
      q?.answer ??
      q?.correctAnswer ??
      q?.correct ??
      q?.answerIndex ??
      0;

    /*
      A/B/C/D
    */

    if (typeof answerValue === "string") {
      const answer = answerValue.trim().toUpperCase();

      if (answer === "A") {
        answerValue = 0;
      } else if (answer === "B") {
        answerValue = 1;
      } else if (answer === "C") {
        answerValue = 2;
      } else if (answer === "D") {
        answerValue = 3;
      } else if (/^\d+$/.test(answer)) {
        answerValue = Number(answer);
      } else {
        answerValue = 0;
      }
    }

    answerValue = Number(answerValue);

    /*
      JSON में 1-4 answer होने पर
      A=1 B=2 C=3 D=4 मानेंगे।
    */

    if (
      Number.isInteger(answerValue) &&
      answerValue >= 1 &&
      answerValue <= 4
    ) {
      answerValue = answerValue - 1;
    }

    if (
      !Number.isInteger(answerValue) ||
      answerValue < 0 ||
      answerValue > 3
    ) {
      answerValue = 0;
    }

    /*
      Options
    */

    const options = Array.isArray(q?.options)
      ? q.options
      : [
          q?.optionA ?? q?.A ?? "",
          q?.optionB ?? q?.B ?? "",
          q?.optionC ?? q?.C ?? "",
          q?.optionD ?? q?.D ?? "",
        ];

    return {
      id: q?.id ?? index + 1,

      question:
        q?.question ??
        q?.questionText ??
        q?.text ??
        "",

      options: [
        options[0] ?? "",
        options[1] ?? "",
        options[2] ?? "",
        options[3] ?? "",
      ],

      answer: answerValue,

      explanation:
        q?.explanation ??
        q?.solution ??
        "",

      explanationImage:
        q?.explanationImage ??
        q?.image ??
        "",
    };
  });
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
  /* =======================================================
     AUTH
  ======================================================= */

  const [currentUser, setCurrentUser] =
    useState(user || null);

  const [authChecking, setAuthChecking] =
    useState(!user);

  /* =======================================================
     FIREBASE DATA
  ======================================================= */

  const [cloudTests, setCloudTests] =
    useState(tests || {});

  const [siteResources, setSiteResources] =
    useState(resources || []);

  /* =======================================================
     TEST SETTINGS
  ======================================================= */

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

  /* =======================================================
     QUESTIONS
  ======================================================= */

  const [questions, setQuestions] =
    useState([createQuestion(1)]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  /* =======================================================
     UI
  ======================================================= */

  const [activeSection, setActiveSection] =
    useState("tests");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [importingQuestions, setImportingQuestions] =
    useState(false);

  const [importInputKey, setImportInputKey] =
    useState(Date.now());

  /* =======================================================
     AUTH LISTENER
  ======================================================= */

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

  /* =======================================================
     LOAD TESTS
  ======================================================= */

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
          "Tests load error:",
          error
        );
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
          setSiteResources(
            Object.values(value)
          );
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
     AUTH LOADING
  ======================================================= */

  if (authChecking) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          ⏳ Admin Panel Loading...
        </div>
      </div>
    );
  }

  /* =======================================================
     ADMIN SECURITY
  ======================================================= */

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

          <h2>
            Admin Access Denied
          </h2>

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

  const getExamName = (id) =>
    exams.find(
      (exam) => exam.id === id
    )?.name || id;

  const getTestId = () =>
    `${selectedExam}_test_${Number(
      testNumber
    )}`;

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
     LOAD EXISTING TEST
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

    if (loadedQuestions.length > 0) {
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
              Number(q?.answer) || 0,

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
    setQuestions((prev) => {
      const nextIndex =
        prev.length;

      return [
        ...prev,
        createQuestion(
          nextIndex + 1
        ),
      ];
    });

    setCurrentQuestion(
      questions.length
    );

    setMessage(
      `✅ Question ${
        questions.length + 1
      } added.`
    );
  };

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const deleteQuestion = () => {
    if (questions.length <= 1) {
      alert(
        "कम से कम 1 Question होना जरूरी है।"
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
      questions.filter(
        (_, index) =>
          index !== currentQuestion
      );

    setQuestions(
      newQuestions.map(
        (q, index) => ({
          ...q,
          id: index + 1,
        })
      )
    );

    setCurrentQuestion(
      Math.min(
        currentQuestion,
        newQuestions.length - 1
      )
    );
  };

  /* =======================================================
     UPDATE QUESTION
  ======================================================= */

  const updateQuestion = (
    field,
    value
  ) => {
    setQuestions((prev) =>
      prev.map(
        (question, index) =>
          index === currentQuestion
            ? {
                ...question,
                [field]: value,
              }
            : question
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
    setQuestions((prev) =>
      prev.map(
        (question, index) => {
          if (
            index !==
            currentQuestion
          ) {
            return question;
          }

          const options = [
            ...(question.options || [
              "",
              "",
              "",
              "",
            ]),
          ];

          options[optionIndex] =
            value;

          return {
            ...question,
            options,
          };
        }
      )
    );
  };

  /* =======================================================
     IMPORT QUESTIONS JSON
  ======================================================= */

  const handleImportQuestionsJSON =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      try {
        setImportingQuestions(true);
        setMessage("");

        const fileText =
          await file.text();

        let data;

        try {
          data =
            JSON.parse(fileText);
        } catch (error) {
          alert(
            "❌ JSON file सही format में नहीं है।"
          );
          return;
        }

        const importedQuestions =
          normalizeImportedQuestions(
            data
          );

        if (
          !importedQuestions.length
        ) {
          alert(
            "❌ JSON में कोई Question नहीं मिला।"
          );
          return;
        }

        /* VALIDATION */

        const invalidIndex =
          importedQuestions.findIndex(
            (q) => {
              return (
                !String(
                  q.question || ""
                ).trim() ||
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
              );
            }
          );

        if (
          invalidIndex !== -1
        ) {
          alert(
            `❌ Question ${
              invalidIndex + 1
            } में Question और सभी 4 Options भरना जरूरी है।`
          );

          setCurrentQuestion(
            invalidIndex
          );

          return;
        }

        if (
          importedQuestions.length >
          150
        ) {
          alert(
            "❌ Maximum 150 Questions allowed हैं।"
          );
          return;
        }

        const replaceExisting =
          window.confirm(
            `JSON में ${importedQuestions.length} Questions मिले हैं।

OK = पुराने Questions हटाकर JSON Questions लगाएँ

Cancel = पुराने Questions के साथ JSON Questions जोड़ें`
          );

        const finalQuestions =
          replaceExisting
            ? importedQuestions
            : [
                ...questions,
                ...importedQuestions,
              ];

        if (
          finalQuestions.length >
          150
        ) {
          alert(
            `❌ कुल Questions ${finalQuestions.length} हो रहे हैं। Maximum 150 Questions रखें।`
          );
          return;
        }

        setQuestions(
          finalQuestions.map(
            (q, index) => ({
              ...q,
              id: index + 1,
            })
          )
        );

        setCurrentQuestion(0);

        setMessage(
          `✅ ${importedQuestions.length} Questions JSON से Import हो गए। अब Save Test दबाएँ।`
        );
      } catch (error) {
        console.error(
          "JSON Import Error:",
          error
        );

        alert(
          `❌ JSON Import Error: ${
            error?.message ||
            "Unknown error"
          }`
        );
      } finally {
        setImportingQuestions(false);

        setImportInputKey(
          Date.now()
        );
      }
    };

  /* =======================================================
     EXPORT QUESTIONS JSON
  ======================================================= */

  const exportQuestionsJSON =
    () => {
      if (!questions.length) {
        alert(
          "Export करने के लिए कोई Question नहीं है।"
        );
        return;
      }

      const data = {
        exam: selectedExam,
        testNumber:
          Number(testNumber) || 1,

        title:
          testTitle ||
          `${getExamName(
            selectedExam
          )} Test ${testNumber}`,

        questions:
          questions.map(
            (q, index) => ({
              id: index + 1,

              question:
                q.question || "",

              options: [
                q.options?.[0] ||
                  "",
                q.options?.[1] ||
                  "",
                q.options?.[2] ||
                  "",
                q.options?.[3] ||
                  "",
              ],

              answer:
                Number(q.answer) || 0,

              explanation:
                q.explanation ||
                "",

              explanationImage:
                q.explanationImage ||
                "",
            })
          ),
      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            ),
          ],
          {
            type:
              "application/json;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `${selectedExam}-test-${testNumber}-questions.json`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(url);
    };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateTest = () => {
    if (!selectedExam) {
      alert(
        "Exam select करें।"
      );
      return false;
    }

    if (
      !testNumber ||
      Number(testNumber) < 1
    ) {
      alert(
        "Valid Test Number डालें।"
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
      !testDuration ||
      Number(testDuration) < 1
    ) {
      alert(
        "Duration सही डालें।"
      );
      return false;
    }

    if (!questions.length) {
      alert(
        "कम से कम 1 Question होना चाहिए।"
      );
      return false;
    }

    const invalidIndex =
      questions.findIndex(
        (q) => {
          if (
            !q.question ||
            !q.question.trim()
          ) {
            return true;
          }

          if (
            !Array.isArray(
              q.options
            ) ||
            q.options.length !==
              4
          ) {
            return true;
          }

          if (
            q.options.some(
              (option) =>
                !String(
                  option || ""
                ).trim()
            )
          ) {
            return true;
          }

          if (
            Number(q.answer) < 0 ||
            Number(q.answer) > 3
          ) {
            return true;
          }

          return false;
        }
      );

    if (
      invalidIndex !== -1
    ) {
      alert(
        `Question ${
          invalidIndex + 1
        } में Question और सभी 4 Options भरना जरूरी है।`
      );

      setCurrentQuestion(
        invalidIndex
      );

      return false;
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

      const testId =
        getTestId();

      const cleanQuestions =
        questions.map(
          (q, index) => ({
            id: index + 1,

            question:
              String(
                q.question || ""
              ).trim(),

            options: [
              String(
                q.options?.[0] ||
                  ""
              ).trim(),

              String(
                q.options?.[1] ||
                  ""
              ).trim(),

              String(
                q.options?.[2] ||
                  ""
              ).trim(),

              String(
                q.options?.[3] ||
                  ""
              ).trim(),
            ],

            answer:
              Number(q.answer) || 0,

            explanation:
              q.explanation ||
              "",

            explanationImage:
              q.explanationImage ||
              "",
          })
        );

      const payload = {
        id: testId,

        exam: selectedExam,

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
          Number(testDuration),

        price:
          Number(testPrice) || 0,

        questions:
          cleanQuestions,

        totalQuestions:
          cleanQuestions.length,

        questionCount:
          cleanQuestions.length,

        createdBy:
          currentUser?.email ||
          ADMIN_EMAIL,

        updatedAt:
          new Date().toISOString(),
      };

      await set(
        ref(
          db,
          `tests/${testId}`
        ),
        payload
      );

      setMessage(
        "✅ Test Firebase में successfully save हो गया।"
      );

      /*
        Firebase listener automatically
        cloudTests update कर देगा।
      */
    } catch (error) {
      console.error(
        "Save Test Error:",
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
     DELETE TEST
  ======================================================= */

  const deleteTest = async (
    id,
    title
  ) => {
    const ok =
      window.confirm(
        `क्या आप "${title || id}" को delete करना चाहते हैं?`
      );

    if (!ok) return;

    try {
      await remove(
        ref(
          db,
          `tests/${id}`
        )
      );

      setMessage(
        "✅ Test delete हो गया।"
      );

      /*
        New Test form
      */
      resetTestForm();
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );

      setMessage(
        `❌ Delete Error: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }
  };

  /* =======================================================
     RESOURCE FUNCTIONS
  ======================================================= */

  const addResource = () => {
    setSiteResources(
      (prev) => [
        ...prev,
        {
          title: "",
          description: "",
          url: "",
          image: "",
        },
      ]
    );
  };

  const updateResource = (
    index,
    field,
    value
  ) => {
    setSiteResources(
      (prev) =>
        prev.map(
          (
            resource,
            i
          ) =>
            i === index
              ? {
                  ...resource,
                  [field]:
                    value,
                }
              : resource
        )
    );
  };

  const deleteResource = (
    index
  ) => {
    setSiteResources(
      (prev) =>
        prev.filter(
          (_, i) =>
            i !== index
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
          "Resources Error:",
          error
        );

        setMessage(
          `❌ Resources save error: ${
            error?.message ||
            "Unknown error"
          }`
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     TEST ENTRIES
  ======================================================= */

  const testEntries =
    Object.entries(
      cloudTests || {}
    ).sort(
      ([, a], [, b]) =>
        Number(
          a?.testNumber || 0
        ) -
        Number(
          b?.testNumber || 0
        )
    );

  /* =======================================================
     CURRENT QUESTION
  ======================================================= */

  const currentQuestionData =
    questions[
      currentQuestion
    ] ||
    createQuestion(
      currentQuestion + 1
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div className="admin-header-title">

          <h1>
            🎓 Study With Power
          </h1>

          <p>
            Exam & Test Admin Panel
          </p>

        </div>

        <div className="admin-header-right">

          <span className="admin-email">
            👤{" "}
            {currentUser?.email}
          </span>

          {onClose && (
            <button
              className="admin-btn secondary"
              onClick={onClose}
            >
              ← Close
            </button>
          )}

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
          TABS
      ================================================= */}

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

      {/* =================================================
          TEST MANAGER
      ================================================= */}

      {activeSection ===
        "tests" && (
        <div className="admin-content">

          {/* ===============================================
              TEST INFORMATION
          =============================================== */}

          <div className="admin-card">

            <div className="card-title">

              <div>

                <h2>
                  📋 Test Information
                </h2>

                <p>
                  Exam, Test Number,
                  Status, Duration और
                  Price सेट करें।
                </p>

              </div>

              <button
                className="admin-btn secondary"
                onClick={
                  resetTestForm
                }
              >
                ➕ New Test
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
                  📢 Test Status
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
                    🟠 Draft
                  </option>

                  <option value="public">
                    🟢 Public
                  </option>

                  <option value="published">
                    🟢 Published
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

          {/* ===============================================
              QUESTION MANAGER
          =============================================== */}

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

                {/* HIDDEN JSON INPUT */}

                <input
                  key={
                    importInputKey
                  }
                  id="questions-json-input"
                  type="file"
                  accept=".json,application/json"
                  style={{
                    display:
                      "none",
                  }}
                  onChange={
                    handleImportQuestionsJSON
                  }
                />

                {/* IMPORT */}

                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() =>
                    document
                      .getElementById(
                        "questions-json-input"
                      )
                      ?.click()
                  }
                  disabled={
                    importingQuestions
                  }
                >
                  {importingQuestions
                    ? "⏳ Importing..."
                    : "📥 Import Questions JSON"}
                </button>

                {/* EXPORT */}

                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={
                    exportQuestionsJSON
                  }
                >
                  📤 Export Questions JSON
                </button>

                {/* ADD */}

                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={
                    addQuestion
                  }
                >
                  ➕ Add Question
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={
                    deleteQuestion
                  }
                >
                  🗑️ Delete Question
                </button>

              </div>

            </div>

            {/* ============================================
                QUESTION TABS
            ============================================ */}

            <div className="question-tabs">

              {questions.map(
                (q, index) => (
                  <button
                    key={
                      q.id ||
                      index
                    }
                    type="button"
                    className={
                      currentQuestion ===
                      index
                        ? "active"
                        : ""
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

            {/* ============================================
                QUESTION EDITOR
            ============================================ */}

            <div className="question-editor">

              <div className="question-number">
                ❓ Question{" "}
                {currentQuestion +
                  1}
              </div>

              {/* QUESTION */}

              <div className="form-group form-group-full">

                <label>
                  ❓ Question
                </label>

                <textarea
                  rows="5"
                  placeholder="यहाँ प्रश्न लिखें..."
                  value={
                    currentQuestionData.question ||
                    ""
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

              <div className="options-heading">
                🔤 Options
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
                    index
                  ) => (
                    <div
                      className="option-row"
                      key={
                        letter
                      }
                    >

                      <div className="option-label">
                        {
                          letter
                        }
                      </div>

                      <input
                        type="text"
                        placeholder={`Option ${letter}`}
                        value={
                          currentQuestionData
                            .options?.[
                            index
                          ] || ""
                        }
                        onChange={(e) =>
                          updateOption(
                            index,
                            e.target
                              .value
                          )
                        }
                      />

                      <label className="correct-option">

                        <input
                          type="radio"
                          name={`correct-answer-${currentQuestion}`}
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
                          सही उत्तर
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
                    currentQuestionData.explanation ||
                    ""
                  }
                  onChange={(e) =>
                    updateQuestion(
                      "explanation",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* IMAGE */}

              <div className="form-group form-group-full">

                <label>
                  🖼️ Explanation Image URL
                </label>

                <input
                  type="url"
                  placeholder="https://..."
                  value={
                    currentQuestionData.explanationImage ||
                    ""
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
                  className="admin-btn secondary"
                  disabled={
                    currentQuestion ===
                    0
                  }
                  onClick={() =>
                    setCurrentQuestion(
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

                <strong>
                  Question{" "}
                  {currentQuestion +
                    1}{" "}
                  /{" "}
                  {
                    questions.length
                  }
                </strong>

                <button
                  className="admin-btn secondary"
                  disabled={
                    currentQuestion >=
                    questions.length -
                      1
                  }
                  onClick={() =>
                    setCurrentQuestion(
                      (prev) =>
                        Math.min(
                          questions.length -
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

            {/* SAVE */}

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
                  : "💾 Save Test to Firebase"}
              </button>

            </div>

          </div>

          {/* ===============================================
              EXISTING TESTS
          =============================================== */}

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
                          className={`status-badge ${
                            test.status ||
                            "draft"
                          }`}
                        >
                          {test.status ===
                            "public" ||
                          test.status ===
                            "published"
                            ? "🟢 Public"
                            : test.status ===
                              "unlisted"
                            ? "🔗 Unlisted"
                            : "🟠 Draft"}
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
                  Website resources manage करें
                </p>

              </div>

              <button
                className="admin-btn secondary"
                onClick={
                  addResource
                }
              >
                ➕ Add Resource
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
                      key={
                        index
                      }
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

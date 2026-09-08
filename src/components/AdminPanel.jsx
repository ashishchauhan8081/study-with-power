// src/components/AdminPanel.jsx

import React, { useEffect, useState } from "react";

import {
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";

import { db, auth } from "../firebase";

const ADMIN_EMAIL = "cciashish@gmail.com";

// =====================================================
// EMPTY QUESTION
// =====================================================

const createEmptyQuestion = (id = 1) => ({
  id,
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
});

// =====================================================
// ADMIN PANEL
// =====================================================

function AdminPanel({ onClose }) {

  // ===================================================
  // STATE
  // ===================================================

  const [tests, setTests] = useState({});

  const [exam, setExam] = useState("uppcs");

  const [testNumber, setTestNumber] = useState(1);

  const [title, setTitle] =
    useState("UPPCS Test 01");

  const [status, setStatus] =
    useState("draft");

  // ===================================================
  // NEW: FREE / PAID
  // ===================================================

  const [isPaid, setIsPaid] =
    useState(false);

  const [price, setPrice] =
    useState(0);

  // ===================================================
  // QUESTIONS
  // ===================================================

  const [questions, setQuestions] = useState([
    createEmptyQuestion(1),
  ]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ===================================================
  // USER
  // ===================================================

  const user = auth.currentUser;

  const isAdmin =
    user?.email === ADMIN_EMAIL;

  // ===================================================
  // DATABASE LISTENER
  // ===================================================

  useEffect(() => {

    if (!isAdmin) return;

    const testsRef = ref(db, "tests");

    return onValue(
      testsRef,
      (snapshot) => {

        setTests(
          snapshot.val() || {}
        );

      }
    );

  }, [isAdmin]);

  // ===================================================
  // UPDATE QUESTION
  // ===================================================

  const updateQuestion = (
    index,
    field,
    value
  ) => {

    setQuestions((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

  };

  // ===================================================
  // UPDATE OPTION
  // ===================================================

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {

    setQuestions((prev) =>
      prev.map((item, i) => {

        if (i !== questionIndex) {
          return item;
        }

        const newOptions = [
          ...(item.options || [
            "",
            "",
            "",
            "",
          ]),
        ];

        newOptions[optionIndex] =
          value;

        return {
          ...item,
          options: newOptions,
        };

      })
    );

  };

  // ===================================================
  // ADD QUESTION
  // ===================================================

  const addQuestion = () => {

    if (questions.length >= 150) {

      alert(
        "अधिकतम 150 प्रश्न ही जोड़े जा सकते हैं।"
      );

      return;
    }

    const newQuestion =
      createEmptyQuestion(
        questions.length + 1
      );

    setQuestions((prev) => [
      ...prev,
      newQuestion,
    ]);

    setCurrentQuestion(
      questions.length
    );

    setMessage(
      `➕ प्रश्न ${
        questions.length + 1
      } जोड़ दिया गया।`
    );

    setTimeout(() => {

      document
        .getElementById(
          "question-editor"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

    }, 100);

  };

  // ===================================================
  // DELETE QUESTION
  // ===================================================

  const deleteQuestion = (index) => {

    if (questions.length === 1) {

      alert(
        "कम से कम 1 प्रश्न होना चाहिए।"
      );

      return;
    }

    const ok =
      window.confirm(
        `प्रश्न ${
          index + 1
        } delete करना है?`
      );

    if (!ok) return;

    const updated =
      questions
        .filter(
          (_, i) => i !== index
        )
        .map((item, i) => ({
          ...item,
          id: i + 1,
        }));

    setQuestions(updated);

    setCurrentQuestion(
      Math.min(
        currentQuestion,
        updated.length - 1
      )
    );

    setMessage(
      "🗑️ प्रश्न delete हो गया।"
    );

  };

  // ===================================================
  // NEW TEST
  // ===================================================

  const newTest = () => {

    setExam("uppcs");

    setTestNumber(1);

    setTitle(
      "UPPCS Test 01"
    );

    setStatus("draft");

    // FREE BY DEFAULT
    setIsPaid(false);

    setPrice(0);

    setQuestions([
      createEmptyQuestion(1),
    ]);

    setCurrentQuestion(0);

    setMessage(
      "📝 नया Test तैयार है।"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  // ===================================================
  // LOAD EXISTING TEST
  // ===================================================

  const loadTest = (
    id,
    data
  ) => {

    setExam(
      data.exam || "uppcs"
    );

    setTestNumber(
      Number(
        data.testNumber || 1
      )
    );

    setTitle(
      data.title || ""
    );

    setStatus(
      data.status || "draft"
    );

    // =================================================
    // LOAD PAID INFORMATION
    // =================================================

    setIsPaid(
      data.isPaid === true ||
      data.type === "paid"
    );

    setPrice(
      Number(data.price || 0)
    );

    // =================================================
    // LOAD QUESTIONS
    // =================================================

    const loaded =
      Array.isArray(data.questions)
        ? data.questions
        : [];

    const formatted =
      loaded
        .slice(0, 150)
        .map(
          (item, index) => ({
            id: index + 1,

            question:
              item?.question ||
              "",

            options: [
              item?.options?.[0] ||
                "",
              item?.options?.[1] ||
                "",
              item?.options?.[2] ||
                "",
              item?.options?.[3] ||
                "",
            ],

            answer:
              Number(
                item?.answer ?? 0
              ),

            explanation:
              item?.explanation ||
              "",
          })
        );

    setQuestions(
      formatted.length
        ? formatted
        : [
            createEmptyQuestion(1),
          ]
    );

    setCurrentQuestion(0);

    setMessage(
      `✏️ ${
        data.title || id
      } edit mode में खुल गया।`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  // ===================================================
  // VALIDATE QUESTIONS
  // ===================================================

  const validateQuestions = () => {

    if (questions.length === 0) {

      alert(
        "कम से कम 1 प्रश्न होना चाहिए।"
      );

      return false;
    }

    if (questions.length > 150) {

      alert(
        "अधिकतम 150 प्रश्न ही हो सकते हैं।"
      );

      return false;
    }

    // =================================================
    // PAID TEST PRICE VALIDATION
    // =================================================

    if (isPaid) {

      const numericPrice =
        Number(price);

      if (
        !numericPrice ||
        numericPrice <= 0
      ) {

        alert(
          "Paid Test के लिए Price डालें।"
        );

        return false;
      }

    }

    // =================================================
    // QUESTION VALIDATION
    // =================================================

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {

      const q =
        questions[i];

      if (
        !q.question ||
        !q.question.trim()
      ) {

        alert(
          `प्रश्न ${
            i + 1
          } खाली है।`
        );

        setCurrentQuestion(i);

        return false;
      }

      if (
        !q.options ||
        q.options.length !== 4
      ) {

        alert(
          `प्रश्न ${
            i + 1
          } में 4 विकल्प होने चाहिए।`
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
          !q.options[j] ||
          !q.options[j].trim()
        ) {

          alert(
            `प्रश्न ${
              i + 1
            } का विकल्प ${String.fromCharCode(
              65 + j
            )} खाली है।`
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
          `प्रश्न ${
            i + 1
          } का सही उत्तर चुनें।`
        );

        setCurrentQuestion(i);

        return false;
      }

    }

    return true;

  };

  // ===================================================
  // SAVE TEST
  // ===================================================

  const saveTest = async () => {

    if (!isAdmin) {

      alert(
        "Admin access नहीं है।"
      );

      return;
    }

    if (!title.trim()) {

      alert(
        "Test title डालें।"
      );

      return;
    }

    if (!validateQuestions()) {
      return;
    }

    // =================================================
    // CLEAN QUESTIONS
    // =================================================

    const cleanQuestions =
      questions.map(
        (item, index) => ({
          id: index + 1,

          question:
            item.question.trim(),

          options: [
            item.options[0].trim(),
            item.options[1].trim(),
            item.options[2].trim(),
            item.options[3].trim(),
          ],

          answer:
            Number(item.answer),

          explanation:
            item.explanation
              ? item.explanation.trim()
              : "",
        })
      );

    const id =
      `${exam}_test_${testNumber}`;

    // =================================================
    // TEST DATA
    // =================================================

    const testData = {

      id,

      exam,

      testNumber:
        Number(testNumber),

      title:
        title.trim(),

      status,

      // =================================================
      // PAID INFORMATION
      // =================================================

      isPaid:
        Boolean(isPaid),

      type:
        isPaid
          ? "paid"
          : "free",

      price:
        isPaid
          ? Number(price)
          : 0,

      currency:
        "INR",

      // =================================================
      // QUESTIONS
      // =================================================

      questions:
        cleanQuestions,

      updatedAt:
        Date.now(),

      updatedBy:
        user.email,
    };

    setLoading(true);

    try {

      // =================================================
      // MAIN TEST
      // =================================================

      await set(
        ref(
          db,
          `tests/${id}`
        ),
        testData
      );

      // =================================================
      // PUBLIC TEST
      // =================================================

      if (status === "public") {

        await set(
          ref(
            db,
            `publicTests/${id}`
          ),
          testData
        );

      } else {

        await remove(
          ref(
            db,
            `publicTests/${id}`
          )
        );

      }

      setMessage(

        status === "public"

          ? isPaid
            ? `💰 Paid Test PUBLIC हो गया। Price: ₹${Number(
                price
              )}`
            : "🌐 Free Test PUBLIC हो गया।"

          : status === "unlisted"

          ? "🔗 Test UNLISTED हो गया।"

          : "📝 Test DRAFT में save हो गया।"

      );

    } catch (error) {

      console.error(error);

      alert(
        "Save नहीं हुआ: " +
          error.message
      );

    } finally {

      setLoading(false);

    }

  };

  // ===================================================
  // DELETE TEST
  // ===================================================

  const deleteTest = async (id) => {

    const ok =
      window.confirm(
        `${id} delete करना है?`
      );

    if (!ok) return;

    try {

      await remove(
        ref(
          db,
          `tests/${id}`
        )
      );

      await remove(
        ref(
          db,
          `publicTests/${id}`
        )
      );

      setMessage(
        "🗑️ Test delete हो गया।"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Delete error: " +
          error.message
      );

    }

  };

  // ===================================================
  // ACCESS CHECK
  // ===================================================

  if (!isAdmin) {

    return (

      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: 30,
          background: "#fff",
          borderRadius: 18,
          boxShadow:
            "0 10px 30px rgba(0,0,0,.10)",
          textAlign: "center",
        }}
      >

        <h1>
          🔐 Admin Panel
        </h1>

        <p>
          केवल Admin account से
          access किया जा सकता है।
        </p>

        <p>
          Admin:
          <strong>
            {" "}
            {ADMIN_EMAIL}
          </strong>
        </p>

        <button
          onClick={onClose}
          style={{
            ...buttonStyle,
            background: "#2563eb",
          }}
        >
          ⬅️ वापस जाएँ
        </button>

      </div>

    );

  }

  // ===================================================
  // DATA
  // ===================================================

  const testList =
    Object.entries(tests);

  const question =
    questions[currentQuestion];

  // ===================================================
  // UI
  // ===================================================

  return (

    <main
      style={{
        maxWidth: 1200,
        margin: "30px auto",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#1d4ed8,#7c3aed)",
          color: "#fff",
          padding: 25,
          borderRadius: 20,
          marginBottom: 20,
        }}
      >

        <h1>
          👑 Study With Power
          Admin Panel
        </h1>

        <p>
          Admin: {user?.email}
        </p>

      </div>

      {/* =================================================
          TEST MANAGER
      ================================================= */}

      <div
        style={{
          background: "#fff",
          padding: 25,
          borderRadius: 18,
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
          marginBottom: 25,
        }}
      >

        <h2>
          📝 Test Manager
        </h2>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
          }}
        >
          Test बनाएं, Questions जोड़ें और
          Free/Paid सेट करें।
        </p>

        {/* =================================================
            TEST DETAILS
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
          }}
        >

          {/* EXAM */}

          <div>

            <label style={labelStyle}>
              Exam
            </label>

            <select
              value={exam}
              onChange={(e) =>
                setExam(
                  e.target.value
                )
              }
              style={inputStyle}
            >

              <option value="upsc">
                UPSC
              </option>

              <option value="uppcs">
                UPPCS
              </option>

              <option value="uppet">
                UPPET
              </option>

              <option value="bpsc">
                BPSC
              </option>

              <option value="mppsc">
                MPPSC
              </option>

              <option value="ssc">
                SSC
              </option>

              <option value="railway">
                Railway
              </option>

              <option value="banking">
                Banking
              </option>

              <option value="upsssc">
                UPSSSC
              </option>

              <option value="roaro">
                RO/ARO
              </option>

              <option value="police">
                Police
              </option>

              <option value="teaching">
                Teaching
              </option>

            </select>

          </div>

          {/* TEST NUMBER */}

          <div>

            <label style={labelStyle}>
              Test Number
            </label>

            <input
              type="number"
              min="1"
              max="100"
              value={testNumber}
              onChange={(e) =>
                setTestNumber(
                  Number(
                    e.target.value
                  )
                )
              }
              placeholder="Test Number"
              style={inputStyle}
            />

          </div>

          {/* TITLE */}

          <div
            style={{
              gridColumn:
                "span 1",
            }}
          >

            <label style={labelStyle}>
              Test Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Test Title"
              style={inputStyle}
            />

          </div>

          {/* STATUS */}

          <div>

            <label style={labelStyle}>
              Visibility / Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              style={inputStyle}
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

        </div>

        {/* =================================================
            FREE / PAID SECTION
        ================================================= */}

        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 14,
            border:
              "2px solid #e2e8f0",
            background:
              isPaid
                ? "#fff7ed"
                : "#f0fdf4",
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: 15,
            }}
          >
            💰 Test Access
          </h3>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >

            {/* FREE BUTTON */}

            <button
              type="button"
              onClick={() => {

                setIsPaid(false);
                setPrice(0);

              }}
              style={{
                padding:
                  "12px 22px",
                border: 0,
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 800,
                background:
                  !isPaid
                    ? "#16a34a"
                    : "#e2e8f0",
                color:
                  !isPaid
                    ? "#fff"
                    : "#334155",
              }}
            >
              🆓 Free
            </button>

            {/* PAID BUTTON */}

            <button
              type="button"
              onClick={() =>
                setIsPaid(true)
              }
              style={{
                padding:
                  "12px 22px",
                border: 0,
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 800,
                background:
                  isPaid
                    ? "#f97316"
                    : "#e2e8f0",
                color:
                  isPaid
                    ? "#fff"
                    : "#334155",
              }}
            >
              🔒 Paid
            </button>

            {/* PRICE */}

            {isPaid && (

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 8,
                }}
              >

                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  placeholder="Price"
                  style={{
                    ...inputStyle,
                    width: 140,
                  }}
                />

              </div>

            )}

          </div>

          <div
            style={{
              marginTop: 12,
              color: "#64748b",
              fontSize: 14,
            }}
          >

            {isPaid
              ? `🔒 यह Paid Test है। Price: ₹${Number(
                  price || 0
                )}`
              : "🆓 यह Free Test है। Students इसे बिना payment के दे सकेंगे।"}

          </div>

        </div>

        {/* =================================================
            QUESTION COUNT
        ================================================= */}

        <div
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 12,
            background: "#eff6ff",
            color: "#1d4ed8",
            fontWeight: 800,
            fontSize: 18,
          }}
        >

          📚 कुल प्रश्न:
          {" "}
          {questions.length}
          {" / 150"}

        </div>

        {/* =================================================
            QUESTION NUMBER BUTTONS
        ================================================= */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 15,
          }}
        >

          {questions.map(
            (_, index) => (

              <button
                key={index}
                type="button"
                onClick={() => {

                  setCurrentQuestion(
                    index
                  );

                  setTimeout(() => {

                    document
                      .getElementById(
                        "question-editor"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                        block:
                          "start",
                      });

                  }, 50);

                }}
                style={{
                  width: 42,
                  height: 42,
                  border: 0,
                  borderRadius: 9,
                  cursor: "pointer",
                  background:
                    currentQuestion ===
                    index
                      ? "#16a34a"
                      : "#2563eb",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                {index + 1}
              </button>

            )
          )}

        </div>

        {/* =================================================
            QUESTION FORM
        ================================================= */}

        {question && (

          <div
            id="question-editor"
            style={{
              marginTop: 25,
              padding: 22,
              border:
                "2px solid #dbeafe",
              borderRadius: 18,
              background: "#f8fafc",
            }}
          >

            {/* QUESTION HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  color: "#1e3a8a",
                }}
              >
                प्रश्न{" "}
                {currentQuestion + 1}
              </h2>

              <button
                type="button"
                onClick={() =>
                  deleteQuestion(
                    currentQuestion
                  )
                }
                style={{
                  ...smallButton,
                  background:
                    "#dc2626",
                }}
              >
                🗑️ प्रश्न Delete
              </button>

            </div>

            {/* QUESTION */}

            <label style={labelStyle}>
              प्रश्न
            </label>

            <textarea
              value={
                question.question
              }
              onChange={(e) =>
                updateQuestion(
                  currentQuestion,
                  "question",
                  e.target.value
                )
              }
              placeholder="यहाँ पूरा प्रश्न लिखें..."
              style={{
                ...textareaStyle,
                minHeight: 120,
              }}
            />

            {/* OPTIONS */}

            <h3
              style={{
                marginTop: 25,
                marginBottom: 15,
              }}
            >
              विकल्प
            </h3>

            {question.options.map(
              (option, index) => (

                <div
                  key={index}
                  style={{
                    marginBottom: 14,
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >

                    {/* A B C D */}

                    <div
                      style={{
                        width: 44,
                        minWidth: 44,
                        height: 44,
                        borderRadius:
                          "50%",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          question.answer ===
                          index
                            ? "#16a34a"
                            : "#2563eb",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 18,
                      }}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </div>

                    {/* OPTION */}

                    <input
                      value={option}
                      onChange={(e) =>
                        updateOption(
                          currentQuestion,
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`विकल्प ${String.fromCharCode(
                        65 + index
                      )}`}
                      style={{
                        ...inputStyle,
                        flex: 1,
                      }}
                    />

                    {/* CORRECT */}

                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(
                          currentQuestion,
                          "answer",
                          index
                        )
                      }
                      style={{
                        border: 0,
                        borderRadius: 10,
                        padding:
                          "11px 14px",
                        cursor: "pointer",
                        background:
                          question.answer ===
                          index
                            ? "#16a34a"
                            : "#e2e8f0",
                        color:
                          question.answer ===
                          index
                            ? "#fff"
                            : "#334155",
                        fontWeight: 800,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {question.answer ===
                      index
                        ? "✓ सही उत्तर"
                        : "सही चुनें"}
                    </button>

                  </div>

                </div>

              )
            )}

            {/* EXPLANATION */}

            <label
              style={{
                ...labelStyle,
                marginTop: 25,
              }}
            >
              व्याख्या
            </label>

            <textarea
              value={
                question.explanation
              }
              onChange={(e) =>
                updateQuestion(
                  currentQuestion,
                  "explanation",
                  e.target.value
                )
              }
              placeholder="यहाँ सही उत्तर की व्याख्या लिखें..."
              style={{
                ...textareaStyle,
                minHeight: 140,
              }}
            />

            {/* PREVIOUS / NEXT */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 12,
                marginTop: 25,
              }}
            >

              <button
                type="button"
                disabled={
                  currentQuestion === 0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (value) =>
                      Math.max(
                        0,
                        value - 1
                      )
                  )
                }
                style={{
                  ...buttonStyle,
                  marginTop: 0,
                  background:
                    currentQuestion ===
                    0
                      ? "#94a3b8"
                      : "#64748b",
                }}
              >
                ← पिछला प्रश्न
              </button>

              <button
                type="button"
                onClick={() => {

                  if (
                    currentQuestion <
                    questions.length - 1
                  ) {

                    setCurrentQuestion(
                      (value) =>
                        value + 1
                    );

                  } else {

                    addQuestion();

                  }

                }}
                style={{
                  ...buttonStyle,
                  marginTop: 0,
                  background:
                    "#2563eb",
                }}
              >
                {currentQuestion <
                questions.length - 1
                  ? "अगला प्रश्न →"
                  : "➕ नया प्रश्न"}
              </button>

            </div>

          </div>

        )}

        {/* =================================================
            ADD QUESTION
        ================================================= */}

        <button
          type="button"
          onClick={addQuestion}
          disabled={
            questions.length >= 150
          }
          style={{
            ...buttonStyle,
            width: "100%",
            marginTop: 20,
            background:
              questions.length >= 150
                ? "#94a3b8"
                : "#7c3aed",
          }}
        >
          {questions.length >= 150
            ? "✓ 150 प्रश्न पूरे हो गए"
            : "➕ नया प्रश्न जोड़ें"}
        </button>

        {/* =================================================
            SAVE / NEW / WEBSITE
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >

          <button
            type="button"
            onClick={saveTest}
            disabled={loading}
            style={{
              ...buttonStyle,
              flex: 1,
              marginTop: 0,
              background:
                "#16a34a",
            }}
          >
            {loading
              ? "⏳ Saving..."
              : isPaid
              ? `💾 Save Paid Test ₹${Number(
                  price || 0
                )}`
              : "💾 Save Free Test"}
          </button>

          <button
            type="button"
            onClick={newTest}
            style={{
              ...buttonStyle,
              marginTop: 0,
              background:
                "#f59e0b",
            }}
          >
            🔄 नया Test
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              marginTop: 0,
              background:
                "#64748b",
            }}
          >
            ⬅️ Website
          </button>

        </div>

        {/* MESSAGE */}

        {message && (

          <div
            style={{
              marginTop: 15,
              padding: 15,
              borderRadius: 10,
              background: "#ecfdf5",
              color: "#166534",
              fontWeight: 700,
            }}
          >
            {message}
          </div>

        )}

      </div>

      {/* =================================================
          SAVED TESTS
      ================================================= */}

      <div
        style={{
          background: "#fff",
          padding: 25,
          borderRadius: 18,
          boxShadow:
            "0 8px 25px rgba(0,0,0,.08)",
        }}
      >

        <h2>
          📚 Saved Tests
        </h2>

        {testList.length === 0 ? (

          <p>
            अभी कोई Test Database
            में नहीं है।
          </p>

        ) : (

          testList.map(
            ([id, data]) => (

              <div
                key={id}
                style={{
                  border:
                    "1px solid #e2e8f0",
                  padding: 15,
                  borderRadius: 12,
                  marginBottom: 10,
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 15,
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <strong>
                    {data.title}
                  </strong>

                  <div
                    style={{
                      marginTop: 5,
                    }}
                  >
                    {id}
                  </div>

                  <small>
                    Questions:
                    {" "}
                    {data.questions
                      ?.length || 0}

                    {" • "}

                    Status:
                    {" "}
                    {data.status}

                    {" • "}

                    {data.isPaid ||
                    data.type === "paid"
                      ? `🔒 Paid ₹${Number(
                          data.price || 0
                        )}`
                      : "🆓 Free"}
                  </small>

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      loadTest(
                        id,
                        data
                      )
                    }
                    style={
                      smallButton
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteTest(id)
                    }
                    style={{
                      ...smallButton,
                      background:
                        "#dc2626",
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

    </main>

  );
}

// =====================================================
// STYLES
// =====================================================

const inputStyle = {

  width: "100%",

  boxSizing:
    "border-box",

  padding: "13px",

  borderRadius: 10,

  border:
    "1px solid #cbd5e1",

  fontSize: 16,

  outline: "none",

};

const textareaStyle = {

  width: "100%",

  boxSizing:
    "border-box",

  padding: 15,

  borderRadius: 12,

  border:
    "1px solid #cbd5e1",

  fontSize: 17,

  lineHeight: 1.6,

  resize: "vertical",

  fontFamily: "inherit",

  outline: "none",

};

const labelStyle = {

  display: "block",

  marginBottom: 8,

  fontWeight: 800,

  fontSize: 17,

  color: "#334155",

};

const buttonStyle = {

  marginTop: 15,

  padding:
    "13px 20px",

  border: 0,

  borderRadius: 10,

  color: "#fff",

  fontWeight: 800,

  cursor: "pointer",

};

const smallButton = {

  padding:
    "9px 14px",

  border: 0,

  borderRadius: 8,

  background:
    "#2563eb",

  color: "#fff",

  cursor: "pointer",

  fontWeight: 700,

};

export default AdminPanel;
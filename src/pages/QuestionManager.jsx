import React, { useState } from "react";
import "./QuestionManager.css";

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

export default function QuestionManager({
  questions = [],
  setQuestions,
  currentQuestion = 0,
  setCurrentQuestion,
}) {
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  // =====================================================
  // ADD QUESTION
  // =====================================================

  const addQuestion = () => {
    if (questions.length >= 150) {
      alert("अधिकतम 150 Questions रख सकते हैं।");
      return;
    }

    const newQuestion = createQuestion(
      questions.length + 1
    );

    setQuestions([
      ...questions,
      newQuestion,
    ]);

    setCurrentQuestion(
      questions.length
    );
  };

  // =====================================================
  // UPDATE QUESTION
  // =====================================================

  const updateQuestion = (
    field,
    value
  ) => {
    setQuestions(
      questions.map((q, index) =>
        index === currentQuestion
          ? {
              ...q,
              [field]: value,
            }
          : q
      )
    );
  };

  // =====================================================
  // UPDATE OPTION
  // =====================================================

  const updateOption = (
    optionIndex,
    value
  ) => {
    setQuestions(
      questions.map((q, index) => {
        if (index !== currentQuestion) {
          return q;
        }

        const options = [
          ...q.options,
        ];

        options[optionIndex] = value;

        return {
          ...q,
          options,
        };
      })
    );
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const deleteQuestion = () => {
    if (questions.length <= 1) {
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

    const updated =
      questions
        .filter(
          (_, index) =>
            index !== currentQuestion
        )
        .map((q, index) => ({
          ...q,
          id: index + 1,
        }));

    setQuestions(updated);

    setCurrentQuestion(
      Math.min(
        currentQuestion,
        updated.length - 1
      )
    );
  };

  // =====================================================
  // DUPLICATE QUESTION
  // =====================================================

  const duplicateQuestion = () => {
    if (questions.length >= 150) {
      alert(
        "अधिकतम 150 Questions रख सकते हैं।"
      );
      return;
    }

    const source =
      questions[currentQuestion];

    const copy = {
      ...source,
      id: questions.length + 1,
      options: [
        ...source.options,
      ],
    };

    const updated = [
      ...questions,
      copy,
    ];

    setQuestions(updated);

    setCurrentQuestion(
      updated.length - 1
    );
  };

  // =====================================================
  // IMPORT JSON
  // =====================================================

  const importQuestions = () => {
    if (!importText.trim()) {
      alert(
        "पहले JSON Questions paste करें।"
      );
      return;
    }

    try {
      const parsed =
        JSON.parse(importText);

      if (!Array.isArray(parsed)) {
        alert(
          "JSON Array format में होना चाहिए।"
        );
        return;
      }

      if (
        parsed.length === 0
      ) {
        alert(
          "JSON में कोई Question नहीं है।"
        );
        return;
      }

      if (
        parsed.length > 150
      ) {
        alert(
          "अधिकतम 150 Questions import कर सकते हैं।"
        );
        return;
      }

      const formatted =
        parsed.map(
          (q, index) => ({
            id:
              index + 1,

            question:
              q.question ||
              q.questionText ||
              q.text ||
              "",

            options:
              Array.isArray(
                q.options
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
              normalizeAnswer(
                q.answer ??
                  q.correctAnswer ??
                  0,
                q.options || []
              ),

            explanation:
              q.explanation ||
              "",

            explanationImage:
              q.explanationImage ||
              "",
          })
        );

      setQuestions(formatted);

      setCurrentQuestion(0);

      setImportText("");

      setShowImport(false);

      alert(
        `✅ ${formatted.length} Questions import हो गए।`
      );
    } catch (error) {
      console.error(error);

      alert(
        "❌ JSON गलत है। कृपया सही JSON format डालें।"
      );
    }
  };

  // =====================================================
  // CLEAR ALL QUESTIONS
  // =====================================================

  const clearQuestions = () => {
    const ok = window.confirm(
      "क्या आप सभी Questions delete करना चाहते हैं?"
    );

    if (!ok) return;

    setQuestions([
      createQuestion(1),
    ]);

    setCurrentQuestion(0);
  };

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const question =
    questions[
      currentQuestion
    ] ||
    createQuestion(1);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="question-manager">

      {/* HEADER */}

      <div className="qm-header">

        <div>
          <h2>
            📚 Question Manager
          </h2>

          <p>
            कुल{" "}
            <strong>
              {questions.length}
            </strong>{" "}
            / 150 Questions
          </p>
        </div>

        <div className="qm-header-buttons">

          <button
            className="qm-btn blue"
            onClick={
              addQuestion
            }
          >
            ＋ Add Question
          </button>

          <button
            className="qm-btn purple"
            onClick={() =>
              setShowImport(
                !showImport
              )
            }
          >
            📥 Import JSON
          </button>

          <button
            className="qm-btn red-outline"
            onClick={
              clearQuestions
            }
          >
            🗑️ Clear All
          </button>

        </div>

      </div>

      {/* IMPORT JSON */}

      {showImport && (
        <div className="qm-import-box">

          <h3>
            📥 JSON से Questions Import करें
          </h3>

          <p>
            नीचे अपने Questions का JSON
            paste करें।
          </p>

          <textarea
            rows="12"
            placeholder={`[
  {
    "id": 1,
    "question": "भारत की राजधानी क्या है?",
    "options": [
      "मुंबई",
      "नई दिल्ली",
      "कोलकाता",
      "चेन्नई"
    ],
    "answer": 1,
    "explanation": "भारत की राजधानी नई दिल्ली है।"
  }
]`}
            value={importText}
            onChange={(e) =>
              setImportText(
                e.target.value
              )
            }
          />

          <div className="qm-import-actions">

            <button
              className="qm-btn green"
              onClick={
                importQuestions
              }
            >
              ✅ Import Questions
            </button>

            <button
              className="qm-btn gray"
              onClick={() => {
                setImportText("");
                setShowImport(false);
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* QUESTION NUMBER LIST */}

      <div className="qm-number-list">

        {questions.map(
          (q, index) => (
            <button
              key={index}
              className={
                currentQuestion ===
                index
                  ? "qm-number active"
                  : "qm-number"
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

      {/* QUESTION EDITOR */}

      <div className="qm-editor">

        <div className="qm-editor-top">

          <h3>
            Question{" "}
            {currentQuestion + 1}
          </h3>

          <div>

            <button
              className="qm-btn orange"
              onClick={
                duplicateQuestion
              }
            >
              📋 Duplicate
            </button>

            <button
              className="qm-btn red"
              onClick={
                deleteQuestion
              }
            >
              🗑️ Delete
            </button>

          </div>

        </div>

        {/* QUESTION */}

        <div className="qm-field">

          <label>
            Question
          </label>

          <textarea
            rows="5"
            placeholder="यहाँ Question लिखें..."
            value={
              question.question
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

        <div className="qm-options">

          {question.options.map(
            (
              option,
              index
            ) => (
              <div
                className="qm-field"
                key={index}
              >

                <label>
                  Option{" "}
                  {String.fromCharCode(
                    65 + index
                  )}
                </label>

                <input
                  type="text"
                  placeholder={`Option ${String.fromCharCode(
                    65 + index
                  )}`}
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

        <div className="qm-field">

          <label>
            ✅ सही Answer
          </label>

          <select
            value={
              question.answer
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
              A - Option A
            </option>

            <option value={1}>
              B - Option B
            </option>

            <option value={2}>
              C - Option C
            </option>

            <option value={3}>
              D - Option D
            </option>

          </select>

        </div>

        {/* EXPLANATION */}

        <div className="qm-field">

          <label>
            📖 Explanation
          </label>

          <textarea
            rows="6"
            placeholder="सही उत्तर की पूरी व्याख्या..."
            value={
              question.explanation
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

        <div className="qm-field">

          <label>
            🖼️ Explanation Image URL
            (Optional)
          </label>

          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={
              question.explanationImage ||
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

      </div>

      {/* NAVIGATION */}

      <div className="qm-navigation">

        <button
          className="qm-btn gray"
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
          Question{" "}
          {currentQuestion + 1}{" "}
          / {questions.length}
        </span>

        <button
          className="qm-btn blue"
          onClick={() => {

            if (
              currentQuestion <
              questions.length - 1
            ) {
              setCurrentQuestion(
                (old) =>
                  old + 1
              );
            } else {
              addQuestion();
            }

          }}
        >
          {currentQuestion <
          questions.length - 1
            ? "Next →"
            : "＋ Add Next"}
        </button>

      </div>

    </div>
  );
}

// =====================================================
// ANSWER NORMALIZER
// =====================================================

function normalizeAnswer(
  answer,
  options
) {
  if (
    typeof answer ===
      "number" &&
    Number.isInteger(answer)
  ) {
    if (
      answer >= 0 &&
      answer <= 3
    ) {
      return answer;
    }

    if (
      answer >= 1 &&
      answer <= 4
    ) {
      return answer - 1;
    }
  }

  const raw =
    String(answer || "")
      .trim();

  if (!raw) return 0;

  // A/B/C/D

  const letter =
    raw
      .toUpperCase()
      .match(
        /^[ABCD]/
      );

  if (letter) {
    return (
      "ABCD".indexOf(
        letter[0]
      )
    );
  }

  // 1/2/3/4

  if (
    /^\d+$/.test(raw)
  ) {
    const n =
      Number(raw);

    if (
      n >= 1 &&
      n <= 4
    ) {
      return n - 1;
    }

    if (
      n >= 0 &&
      n <= 3
    ) {
      return n;
    }
  }

  // Option text

  if (
    Array.isArray(options)
  ) {
    const index =
      options.findIndex(
        (option) =>
          String(option)
            .trim()
            .toLowerCase() ===
          raw
            .toLowerCase()
      );

    if (index >= 0) {
      return index;
    }
  }

  return 0;
}

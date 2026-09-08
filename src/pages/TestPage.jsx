import React, { useEffect, useMemo, useState } from "react";

export default function TestPage({ test, onBack }) {
  // Maximum 150 questions
  const questions = (test?.questions || []).slice(0, 150);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(
    Number(test?.durationMinutes || 120) * 60
  );

  // ================= TIMER =================
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }

        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // ================= SCORE =================
  const scoreData = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q, index) => {
      const selected = answers[index];

      if (selected === undefined) {
        unanswered++;
      } else if (selected === q.answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const marks = Number(test?.marksPerQuestion ?? 1);

    const negativeMarks = test?.negativeMarking
      ? Number(test?.negativeMarks ?? marks / 3)
      : 0;

    const score =
      correct * marks - wrong * negativeMarks;

    return {
      correct,
      wrong,
      unanswered,
      score,
    };
  }, [answers, questions, test]);

  // ================= SELECT ANSWER =================
  const selectAnswer = (index) => {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [current]: index,
    }));
  };

  // ================= SUBMIT =================
  const submitTest = () => {
    if (window.confirm("क्या आप Test Submit करना चाहते हैं?")) {
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ================= TIMER FORMAT =================
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const secs = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${secs}`;
  };

  // ================= NO QUESTIONS =================
  if (!questions.length) {
    return (
      <main className="ai-container">
        <div className="ai-card">

          <button
            className="ai-button"
            onClick={onBack}
          >
            ⬅️ वापस
          </button>

          <h2>❌ Test में Questions नहीं मिले</h2>

          <p>
            इस Test में कोई प्रश्न उपलब्ध नहीं है।
          </p>

        </div>
      </main>
    );
  }

  // ================= RESULT =================
  if (submitted) {
    return (
      <main className="ai-container">
        <div className="ai-card">

          <div style={{ textAlign: "center" }}>

            <div style={{ fontSize: 60 }}>
              🏆
            </div>

            <h1>
              {test?.title || "Test Result"}
            </h1>

            <h2
              style={{
                fontSize: 42,
                margin: "10px 0",
              }}
            >
              {scoreData.score.toFixed(2)}
            </h2>

            <p>
              कुल प्रश्न: {questions.length}
            </p>

          </div>

          {/* SUMMARY */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              margin: "25px 0",
            }}
          >

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#ecfdf5",
                textAlign: "center",
              }}
            >
              <b>सही</b>

              <div style={{ fontSize: 28 }}>
                {scoreData.correct}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#fef2f2",
                textAlign: "center",
              }}
            >
              <b>गलत</b>

              <div style={{ fontSize: 28 }}>
                {scoreData.wrong}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "#f8fafc",
                textAlign: "center",
              }}
            >
              <b>छोड़े</b>

              <div style={{ fontSize: 28 }}>
                {scoreData.unanswered}
              </div>
            </div>

          </div>

          {/* EXPLANATIONS */}
          <h2>
            📖 प्रश्नों की व्याख्या
          </h2>

          {questions.map((q, index) => {

            const selected = answers[index];

            const isCorrect =
              selected !== undefined &&
              selected === q.answer;

            return (
              <div
                key={q.id ?? index}
                style={{
                  marginTop: 16,
                  padding: 18,
                  borderRadius: 14,
                  border: "1px solid #dce3ed",
                  background: "#fff",
                }}
              >

                <b>
                  {index + 1}. {q.question}
                </b>

                <p>
                  आपका उत्तर:{" "}
                  {selected === undefined
                    ? "नहीं दिया"
                    : q.options?.[selected] ?? "—"}
                </p>

                <p>
                  <strong>
                    सही उत्तर:
                  </strong>{" "}
                  {q.options?.[q.answer] ?? "—"}
                </p>

                <p
                  style={{
                    lineHeight: 1.7,
                    color: "#475569",
                  }}
                >
                  💡{" "}
                  {q.explanation ||
                    "इस प्रश्न की व्याख्या उपलब्ध नहीं है।"}
                </p>

                <div style={{ fontWeight: 800 }}>
                  {selected === undefined
                    ? "⚪ अनुत्तरित"
                    : isCorrect
                    ? "✅ सही"
                    : "❌ गलत"}
                </div>

              </div>
            );
          })}

          <button
            className="ai-button"
            style={{ marginTop: 22 }}
            onClick={onBack}
          >
            ⬅️ Test Series पर वापस जाएँ
          </button>

        </div>
      </main>
    );
  }

  const question = questions[current];

  // ================= TEST PAGE =================
  return (
    <main className="ai-container">
      <div className="ai-card">

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >

          <button
            className="ai-button"
            onClick={onBack}
          >
            ⬅️ Test List
          </button>

          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              color:
                timeLeft < 300
                  ? "#dc2626"
                  : "#0f172a",
            }}
          >
            ⏱️ {formatTime(timeLeft)}
          </div>

        </div>

        {/* TITLE */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: 5,
          }}
        >
          {test?.title || "Test"}
        </h1>

        {/* QUESTION NUMBER */}
        <div
          style={{
            textAlign: "center",
            color: "#64748b",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          प्रश्न {current + 1} / {questions.length}
        </div>

        {/* PROGRESS */}
        <div
          style={{
            margin: "18px 0",
            height: 8,
            borderRadius: 10,
            background: "#e2e8f0",
            overflow: "hidden",
          }}
        >

          <div
            style={{
              width:
                `${((current + 1) /
                  questions.length) *
                  100}%`,
              height: "100%",
              background: "#2563eb",
              transition: "width 0.2s ease",
            }}
          />

        </div>

        {/* QUESTION BOX */}
        <div
          style={{
            padding: 22,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #dce3ed",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              marginBottom: 22,
              lineHeight: 1.7,
              fontSize: 22,
              overflowWrap: "anywhere",
            }}
          >
            {current + 1}. {question.question}
          </h2>

          {/* OPTIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >

            {(question.options || []).map(
              (option, index) => {

                const selected =
                  answers[current] === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      selectAnswer(index)
                    }
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,

                      width: "100%",
                      minHeight: 55,

                      boxSizing: "border-box",

                      padding:
                        "15px 16px",

                      borderRadius: 12,

                      border: selected
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",

                      background: selected
                        ? "#eff6ff"
                        : "#ffffff",

                      color: "#0f172a",

                      textAlign: "left",

                      fontSize: 17,

                      lineHeight: 1.5,

                      cursor: "pointer",

                      overflowWrap:
                        "anywhere",

                      whiteSpace:
                        "normal",
                    }}
                  >

                    <span
                      style={{
                        minWidth: 32,
                        fontWeight: 900,
                      }}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                      .
                    </span>

                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {option}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* NAVIGATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 22,
          }}
        >

          <button
            className="ai-button"
            disabled={current === 0}
            onClick={() =>
              setCurrent((value) =>
                Math.max(0, value - 1)
              )
            }
          >
            ⬅️ पिछला
          </button>

          {current < questions.length - 1 ? (

            <button
              className="ai-button"
              onClick={() =>
                setCurrent((value) =>
                  Math.min(
                    questions.length - 1,
                    value + 1
                  )
                )
              }
            >
              अगला ➡️
            </button>

          ) : (

            <button
              className="ai-button"
              onClick={submitTest}
            >
              ✅ Test Submit करें
            </button>

          )}

        </div>

      </div>
    </main>
  );
}
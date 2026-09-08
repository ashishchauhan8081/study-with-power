import React, { useMemo, useState } from "react";

// Maximum 150 questions
const MAX_QUESTIONS = 150;

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];

  return questions.slice(0, MAX_QUESTIONS).map((q, index) => ({
    id: q?.id ?? index + 1,
    question: q?.question ?? q?.questionText ?? q?.text ?? "",
    options: Array.isArray(q?.options) ? q.options.slice(0, 4) : ["", "", "", ""],
    answer: q?.answer,
    explanation: q?.explanation ?? "",
  }));
}

// Firebase में answer अलग-अलग रूप में save हो सकता है:
// 0 / 1 / 2 / 3, "0", "A", "A.", option text, "भाग I" आदि।
function getCorrectIndex(question) {
  const options = question?.options || [];
  const answer = question?.answer;

  if (typeof answer === "number" && Number.isInteger(answer)) {
    return answer >= 0 && answer < options.length ? answer : -1;
  }

  const raw = String(answer ?? "").trim();
  if (!raw) return -1;

  // Numeric answer: 0-3 or 1-4
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    if (n >= 0 && n < options.length) return n;
    if (n >= 1 && n <= options.length) return n - 1;
  }

  const upper = raw.toUpperCase();
  const letterMatch = upper.match(/^([ABCD])(?:\.|\)|\s|$)/);
  if (letterMatch) {
    const index = "ABCD".indexOf(letterMatch[1]);
    if (index >= 0 && index < options.length) return index;
  }

  // Exact option text / text after A. / A - etc.
  const cleaned = raw
    .replace(/^[ABCD]\s*[.\-:)]+\s*/i, "")
    .trim();

  const exactIndex = options.findIndex(
    (option) => String(option ?? "").trim() === cleaned || String(option ?? "").trim() === raw
  );
  if (exactIndex >= 0) return exactIndex;

  // Hindi Roman/Devanagari part labels, e.g. "भाग I", "भाग II"...
  const partMatch = raw.match(/भाग\s*(I{1,3}|IV|V|1|2|3|4)/i);
  if (partMatch) {
    const part = partMatch[1].toUpperCase();
    const partMap = { I: 0, II: 1, III: 2, IV: 3, V: 4, "1": 0, "2": 1, "3": 2, "4": 3 };
    const index = partMap[part];
    if (index !== undefined && index < options.length) return index;
  }

  return -1;
}

export default function TestRunner({ test, onBack }) {
  const questions = useMemo(
    () => normalizeQuestions(test?.questions || []),
    [test]
  );

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const buttonBase = {
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const calculateResult = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      const correctIndex = getCorrectIndex(q);
      if (answers[index] === correctIndex) correct += 1;
    });

    const wrong = Math.max(0, questions.length - correct);
    const percentage = questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0;

    return { correct, wrong, percentage };
  };

  const goPrevious = () => {
    setCurrent((value) => Math.max(0, value - 1));
    setShowExplanation(false);
  };

  const goNext = () => {
    setShowExplanation(false);
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
    } else {
      setSubmitted(true);
    }
  };

  const selectOption = (index) => {
    const alreadyAnswered = answers[current] !== undefined;
    if (alreadyAnswered) return;

    setAnswers((prev) => ({
      ...prev,
      [current]: index,
    }));

    if (reviewMode) {
      // Retest में answer चुनने के बाद उसी question पर सही/गलत + explanation दिखेगा।
      setShowExplanation(true);
      return;
    }

    // पहली बार Test: option click होते ही next question।
    window.setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent((value) => value + 1);
      } else {
        setSubmitted(true);
      }
    }, 150);
  };

  if (!questions.length) {
    return (
      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
        <button
          type="button"
          onClick={onBack}
          style={{ ...buttonBase, padding: "12px 20px", background: "#e2e8f0", color: "#111827", fontSize: "17px", fontWeight: 700, marginBottom: 20 }}
        >
          ← Test List
        </button>
        <div style={{ background: "#fff", border: "1px solid #dbe3ee", borderRadius: 18, padding: "50px 20px", textAlign: "center" }}>
          <h2>इस Test में Questions नहीं हैं।</h2>
        </div>
      </div>
    );
  }

  if (submitted) {
    const { correct, wrong, percentage } = calculateResult();

    return (
      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 760, margin: "30px auto", background: "#fff", borderRadius: 18, padding: 35, textAlign: "center", boxSizing: "border-box", boxShadow: "0 10px 35px rgba(0,0,0,.10)" }}>
          <div style={{ fontSize: 52 }}>🎉</div>
          <h1 style={{ color: "#1d4ed8", marginBottom: 8 }}>Test Complete</h1>
          <h2 style={{ marginTop: 0 }}>{test?.title || "Test"}</h2>

          <div style={{ fontSize: 42, fontWeight: 800, color: "#1d4ed8", margin: "20px 0 10px" }}>
            {correct} / {questions.length}
          </div>
          <p style={{ fontSize: 20, margin: "8px 0" }}>
            प्रतिशत: <strong>{percentage}%</strong>
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 15, flexWrap: "wrap", margin: "25px 0" }}>
            <div style={{ padding: "15px 25px", borderRadius: 12, background: "#dcfce7", color: "#166534", fontWeight: 800, fontSize: 20 }}>
              ✓ सही: {correct}
            </div>
            <div style={{ padding: "15px 25px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontWeight: 800, fontSize: 20 }}>
              ✗ गलत: {wrong}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 25 }}>
            <button
              type="button"
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setSubmitted(false);
                setReviewMode(true);
                setShowExplanation(false);
              }}
              style={{ ...buttonBase, padding: "13px 20px", background: "#1264d8", color: "#fff", fontSize: 17, fontWeight: 700 }}
            >
              🔄 Retest / व्याख्या देखें
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{ ...buttonBase, padding: "13px 20px", background: "#e2e8f0", color: "#111827", fontSize: 17, fontWeight: 700 }}
            >
              ← Test List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const selected = answers[current];
  const hasSelected = selected !== undefined;
  const correctIndex = getCorrectIndex(question);
  const userCorrect = hasSelected && selected === correctIndex;

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
      <button
        type="button"
        onClick={onBack}
        style={{ ...buttonBase, padding: "12px 20px", background: "#e2e8f0", color: "#111827", fontSize: 17, fontWeight: 700, marginBottom: 20 }}
      >
        ← Test List
      </button>

      <div style={{ width: "100%", background: "#fff", border: "1px solid #dbe3ee", borderRadius: 18, padding: 30, boxSizing: "border-box", overflow: "visible" }}>
        {/* TEST NAME + QUESTION NUMBER */}
        <div style={{ width: "100%", borderBottom: "1px solid #e2e8f0", paddingBottom: 18, marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
            {test?.exam || "UPPCS"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginTop: 4 }}>
            {test?.title || "Test"}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginTop: 6 }}>
            प्रश्न {current + 1} / {questions.length}
            {reviewMode && <span style={{ marginLeft: 10, color: "#7c3aed" }}>• Retest</span>}
          </div>
        </div>

        {/* QUESTION */}
        <div style={{ width: "100%", marginBottom: 28 }}>
          <h2 style={{ width: "100%", margin: 0, padding: 0, color: "#111827", textAlign: "left", fontSize: 28, fontWeight: 600, lineHeight: 1.6, wordBreak: "break-word", overflowWrap: "anywhere" }}>
            {current + 1}. {question.question}
          </h2>
        </div>

        {/* OPTIONS */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 14, width: "100%", clear: "both" }}>
          {(question.options || []).slice(0, 4).map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = index === correctIndex;
            const showAnswerColors = reviewMode && hasSelected;

            let background = "#1264d8";
            if (showAnswerColors) {
              if (isCorrect) {
                background = "#16a34a"; // सही option हमेशा GREEN
              } else if (isSelected) {
                background = "#dc2626"; // चुना हुआ गलत option RED
              } else {
                background = "#3578d4";
              }
            }

            return (
              <button
                key={index}
                type="button"
                disabled={hasSelected}
                onClick={() => selectOption(index)}
                style={{
                  ...buttonBase,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  minHeight: 64,
                  margin: 0,
                  padding: "16px 20px",
                  background,
                  color: "#fff",
                  textAlign: "left",
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  cursor: hasSelected ? "default" : "pointer",
                  boxShadow: isCorrect && showAnswerColors
                    ? "0 5px 15px rgba(22,163,74,.30)"
                    : isSelected && showAnswerColors
                    ? "0 5px 15px rgba(220,38,38,.30)"
                    : "0 5px 15px rgba(18,100,216,.20)",
                }}
              >
                <span style={{ flex: "0 0 55px", width: 55, fontSize: 21, fontWeight: 800 }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                <span style={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1.4 }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* REVIEW RESULT + EXPLANATION */}
        {reviewMode && showExplanation && hasSelected && (
          <div style={{ width: "100%", marginTop: 22, padding: 20, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, boxSizing: "border-box" }}>
            <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 10, color: userCorrect ? "#15803d" : "#b91c1c" }}>
              {userCorrect ? "✓ सही उत्तर" : "✗ गलत उत्तर"}
            </div>

            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, color: "#1e3a8a" }}>
              सही उत्तर: {correctIndex >= 0
                ? `${String.fromCharCode(65 + correctIndex)}. ${question.options[correctIndex]}`
                : "सही उत्तर उपलब्ध नहीं है"}
            </div>

            <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6, color: "#1e3a8a" }}>
              व्याख्या
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.7, color: "#334155", whiteSpace: "pre-wrap" }}>
              {question.explanation || "इस प्रश्न की व्याख्या Admin Panel में उपलब्ध नहीं है।"}
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 15, marginTop: 30, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={current === 0}
            onClick={goPrevious}
            style={{ ...buttonBase, padding: "13px 22px", background: current === 0 ? "#bfdbfe" : "#1264d8", color: "#fff", fontSize: 17, fontWeight: 700, opacity: current === 0 ? 0.75 : 1 }}
          >
            ← Previous
          </button>

          {reviewMode && (
            <button
              type="button"
              disabled={!hasSelected}
              onClick={goNext}
              style={{ ...buttonBase, padding: "13px 22px", background: hasSelected ? (current === questions.length - 1 ? "#16a34a" : "#1264d8") : "#94a3b8", color: "#fff", fontSize: 17, fontWeight: 700, cursor: hasSelected ? "pointer" : "not-allowed" }}
            >
              {current === questions.length - 1 ? "✓ Review Complete" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

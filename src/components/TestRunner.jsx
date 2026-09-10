import React, { useEffect, useMemo, useState } from "react";

const EXAM_FOLDERS = {
  upsc: "upsc",
  uppcs: "uppcs",
  uppet: "uppet",
  upsssc: "upsssc",
  "ro-aro": "ro-aro",
  bpsc: "bpsc",
  mppsc: "mppsc",
  ssc: "ssc",
  railway: "railway",
  police: "police",
  teaching: "teaching",
};

const TEST_MODULES = import.meta.glob("../data/questions/*/test*.js", {
  eager: true,
});

function getQuestions(examId, testNumber) {
  const folder = EXAM_FOLDERS[examId] || examId;
  const key = `../data/questions/${folder}/test${String(testNumber).padStart(2, "0")}.js`;
  const mod = TEST_MODULES[key];
  return mod?.default || mod?.questions || mod?.test?.questions || [];
}

export default function TestRunner({ test, onBack }) {
  const questions = useMemo(
    () => getQuestions(test.examId, test.testNumber),
    [test.examId, test.testNumber]
  );

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    setCurrent(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(30 * 60);
  }, [test.examId, test.testNumber]);

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished]);

  const getAnswer = (q) => q?.answer ?? q?.correctAnswer ?? q?.correct ?? "";

  const getOptions = (q) => {
    if (Array.isArray(q?.options)) {
      return q.options.map((value, index) => ({
        key: String.fromCharCode(65 + index),
        value: typeof value === "object"
          ? value?.value ?? value?.text ?? ""
          : value,
      }));
    }

    return Object.entries(q?.options || {}).map(([key, value], index) => ({
      key: String(key).toUpperCase(),
      value: typeof value === "object"
        ? value?.value ?? value?.text ?? ""
        : value,
      index,
    }));
  };

  const normalizeAnswer = (value) => {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "number") {
      return String.fromCharCode(65 + value);
    }

    const text = String(value).trim();
    const letter = text.match(/^([A-Da-d])(?:[).:\-\s]|$)/);
    if (letter) return letter[1].toUpperCase();

    return text.toLowerCase();
  };

  const isCorrect = (q, value) => {
    const correct = normalizeAnswer(getAnswer(q));
    const selected = normalizeAnswer(value);
    return !!correct && !!selected && correct === selected;
  };

  const score = questions.reduce(
    (sum, q, i) => sum + (isCorrect(q, answers[i]) ? 1 : 0),
    0
  );

  const choose = (value) => {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  };

  const restartTest = () => {
    setCurrent(0);
    setAnswers({});
    setFinished(false);
    setTimeLeft(30 * 60);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!questions.length) {
    return (
      <main className="ai-container">
        <div className="ai-card">
          <h2>📚 {test.examTitle}</h2>
          <h3>{test.title}</h3>
          <p>इस Test की question file अभी खाली है।</p>
          <button type="button" className="ai-button" onClick={onBack}>
            ← वापस जाएँ
          </button>
        </div>
      </main>
    );
  }

  // ========================================================
  // RESULT + EXPLANATION
  // Submit के बाद हर प्रश्न का सही उत्तर और व्याख्या दिखाई जाएगी।
  // ========================================================
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <main className="ai-container">
        <div className="ai-card">
          <div
            style={{
              textAlign: "center",
              padding: "10px 5px 25px",
            }}
          >
            <div style={{ fontSize: 55 }}>🏆</div>
            <h1 style={{ margin: "8px 0" }}>Test Result</h1>
            <h2 style={{ margin: "8px 0" }}>
              {test.examTitle} — {test.title}
            </h2>

            <div
              style={{
                display: "inline-block",
                marginTop: 15,
                padding: "18px 30px",
                borderRadius: 16,
                background: "#eafaf0",
                color: "#137333",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              {score} / {questions.length}
            </div>

            <p style={{ fontSize: 18, marginTop: 12 }}>
              आपका Score: <strong>{percentage}%</strong>
            </p>
          </div>

          <div
            style={{
              marginTop: 10,
              padding: 16,
              borderRadius: 14,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            📖 नीचे हर प्रश्न का आपका उत्तर, सही उत्तर और <strong>व्याख्या</strong> दी गई है।
          </div>

          {questions.map((q, i) => {
            const options = getOptions(q);
            const selected = normalizeAnswer(answers[i]);
            const correct = normalizeAnswer(getAnswer(q));
            const selectedOption = options.find((o) => normalizeAnswer(o.key) === selected);
            const correctOption = options.find((o) => normalizeAnswer(o.key) === correct);
            const explanation =
              q?.explanation ??
              q?.व्याख्या ??
              q?.explanationText ??
              q?.solution ??
              q?.details ??
              "इस प्रश्न की व्याख्या उपलब्ध नहीं है।";

            return (
              <div
                key={q?.id ?? i}
                style={{
                  marginTop: 18,
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid #dce3ed",
                  background: "#fff",
                }}
              >
                <h3 style={{ marginTop: 0, lineHeight: 1.6 }}>
                  प्रश्न {i + 1}. {q?.question}
                </h3>

                <div style={{ marginTop: 8 }}>
                  <strong>आपका उत्तर:</strong>{" "}
                  {selectedOption
                    ? `${selectedOption.key}) ${selectedOption.value}`
                    : "नहीं दिया"}
                </div>

                <div style={{ marginTop: 6, color: "#15803d" }}>
                  <strong>सही उत्तर:</strong>{" "}
                  {correctOption
                    ? `${correctOption.key}) ${correctOption.value}`
                    : getAnswer(q) || "उपलब्ध नहीं"}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    padding: 15,
                    borderRadius: 12,
                    background: "#fff8e5",
                    border: "1px solid #f1d58a",
                    lineHeight: 1.75,
                  }}
                >
                  💡 <strong>व्याख्या:</strong> {explanation}
                </div>
              </div>
            );
          })}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 25,
            }}
          >
            <button type="button" className="ai-button" onClick={restartTest}>
              🔄 Test दोबारा दें
            </button>
            <button type="button" className="ai-button" onClick={onBack}>
              ← Test List
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = questions[current];
  const options = getOptions(question);
  const selected = normalizeAnswer(answers[current]);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <main className="ai-container">
      <div className="ai-card">
        <button type="button" className="ai-button" onClick={onBack}>
          ← Test Series
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
            marginTop: 18,
          }}
        >
          <div>
            <h1 style={{ marginBottom: 6 }}>🎯 {test.examTitle}</h1>
            <h2 style={{ marginTop: 0 }}>{test.title}</h2>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>
            ⏱️ {mm}:{ss}
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1px solid #dce3ed",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <strong>प्रश्न {current + 1} / {questions.length}</strong>
            <strong>Answered: {Object.keys(answers).length}</strong>
          </div>

          <div
            style={{
              width: "100%",
              height: 8,
              background: "#e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
              marginTop: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: `${((current + 1) / questions.length) * 100}%`,
                height: "100%",
                background: "#2563eb",
              }}
            />
          </div>

          <h2 style={{ lineHeight: 1.6 }}>
            {current + 1}. {question?.question}
          </h2>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {options.map((option) => {
              const active = selected === normalizeAnswer(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => choose(option.key)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 16,
                    borderRadius: 12,
                    border: active
                      ? "2px solid #2563eb"
                      : "1px solid #cbd5e1",
                    background: active ? "#eff6ff" : "#fff",
                    color: "#111827",
                    cursor: "pointer",
                    fontSize: 17,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>{option.key})</strong> {option.value}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="ai-button"
            disabled={current === 0}
            onClick={() => setCurrent((v) => Math.max(0, v - 1))}
          >
            ← पिछला
          </button>

          {current < questions.length - 1 ? (
            <button
              type="button"
              className="ai-button"
              onClick={() => setCurrent((v) => v + 1)}
            >
              अगला →
            </button>
          ) : (
            <button
              type="button"
              className="ai-button"
              onClick={() => setFinished(true)}
            >
              ✅ Test Submit करें
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

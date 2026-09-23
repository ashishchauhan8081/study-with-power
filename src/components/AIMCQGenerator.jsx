import { useState } from "react";

function AIMCQGenerator() {
  const [topic, setTopic] = useState("");
  const [exam, setExam] = useState("UPPCS");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("Hindi");
  const [difficulty, setDifficulty] = useState("Medium");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateMCQs = async () => {
    if (!topic.trim()) {
      setError("कृपया Topic / विषय डालें।");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          exam,
          count: Number(count),
          language,
          difficulty,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        throw new Error("Server से सही response नहीं मिला।");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            `MCQ generate नहीं हो सके। Server status: ${response.status}`
        );
      }

      const generated = Array.isArray(data.questions)
        ? data.questions
        : Array.isArray(data.mcqs)
        ? data.mcqs
        : [];

      if (!generated.length) {
        throw new Error("AI ने कोई MCQ नहीं भेजा।");
      }

      setQuestions(generated);
    } catch (err) {
      console.error("AI MCQ Error:", err);
      setError(
        err?.message ||
          "Gemini API से connection नहीं हो पाया। कृपया API और /api/mcq check करें।"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ questions }, null, 2)
      );
      alert("Questions JSON copy हो गया।");
    } catch (err) {
      console.error(err);
      alert("Copy नहीं हो पाया।");
    }
  };

  const downloadJSON = () => {
    const data = JSON.stringify({ questions }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-test-ai-mcqs.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const clearQuestions = () => {
    setQuestions([]);
    setError("");
  };

  const pageStyle = {
    minHeight: "100vh",
    padding: "30px 16px 60px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #eef6ff 0%, #f8fbff 45%, #eef2ff 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #dbe7f5",
    borderRadius: "24px",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    marginTop: "8px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontSize: "16px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    color: "#172554",
    fontWeight: 800,
    fontSize: "15px",
    marginBottom: "4px",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Back */}
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            border: "none",
            background: "transparent",
            color: "#1d4ed8",
            fontWeight: 800,
            fontSize: "15px",
            cursor: "pointer",
            marginBottom: "14px",
          }}
        >
          ← Home
        </button>

        {/* Header */}
        <div
          style={{
            ...cardStyle,
            padding: "30px 22px",
            textAlign: "center",
            marginBottom: "22px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #eef6ff 55%, #e0e7ff 100%)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              boxShadow: "0 12px 30px rgba(37,99,235,0.25)",
              fontSize: "36px",
              marginBottom: "12px",
            }}
          >
            🤖
          </div>

          <h1
            style={{
              margin: "0",
              fontSize: "clamp(32px, 6vw, 52px)",
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "#0f172a",
            }}
          >
            AI <span style={{ color: "#2563eb" }}>MCQ Generator</span>
          </h1>

          <div
            style={{
              marginTop: "12px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            Exam Test • AI से स्मार्ट MCQ तैयारी
          </div>

          <p
            style={{
              margin: "10px auto 0",
              maxWidth: "720px",
              color: "#64748b",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            परीक्षा, विषय, भाषा और कठिनाई के अनुसार MCQ तैयार करें।
          </p>
        </div>

        {/* Generator Form */}
        <div style={{ ...cardStyle, padding: "24px", marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>📚 Topic / विषय</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) generateMCQs();
                }}
                placeholder="जैसे: भारतीय संविधान, 1857 का विद्रोह, भूगोल"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>🎯 Exam</label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                style={inputStyle}
              >
                <option>UPPCS</option>
                <option>UP Police</option>
                <option>UP Home Guard</option>
                <option>UP PET</option>
                <option>UPSSSC</option>
                <option>SSC CGL</option>
                <option>SSC CHSL</option>
                <option>RRB NTPC</option>
                <option>RRB Group D</option>
                <option>NDA</option>
                <option>CTET</option>
                <option>General Competitive Exam</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>🔢 Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                style={inputStyle}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="20">20 Questions</option>
                <option value="30">30 Questions</option>
                <option value="50">50 Questions</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>🌐 Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={inputStyle}
              >
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>📈 Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={inputStyle}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            type="button"
            onClick={generateMCQs}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "16px 20px",
              border: "none",
              borderRadius: "14px",
              background: loading
                ? "#94a3b8"
                : "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 12px 28px rgba(37,99,235,0.25)",
            }}
          >
            {loading
              ? "⏳ Gemini AI MCQ बना रहा है..."
              : "🤖 Generate MCQs"}
          </button>

          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#713f12",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            💡 Gemini API key frontend में नहीं रखी गई है। Request
            <strong> /api/mcq </strong>
            के माध्यम से backend को भेजी जाती है।
          </div>
        </div>

        {/* Results */}
        {questions.length > 0 && (
          <div>
            <div
              style={{
                ...cardStyle,
                padding: "18px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  📝 Generated MCQs
                </div>
                <div style={{ color: "#64748b", marginTop: "4px" }}>
                  {exam} • {topic} • {questions.length} Questions
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={copyJSON}
                  style={{
                    padding: "11px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#16a34a",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  📋 Copy JSON
                </button>

                <button
                  type="button"
                  onClick={downloadJSON}
                  style={{
                    padding: "11px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#7c3aed",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ⬇️ Download JSON
                </button>

                <button
                  type="button"
                  onClick={clearQuestions}
                  style={{
                    padding: "11px 15px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#334155",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            {questions.map((q, index) => {
              const options = Array.isArray(q.options) ? q.options : [];

              return (
                <div
                  key={q.id || index}
                  style={{
                    ...cardStyle,
                    padding: "20px",
                    marginBottom: "16px",
                    borderLeft: "5px solid #2563eb",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: 900,
                      marginBottom: "10px",
                    }}
                  >
                    QUESTION {index + 1}
                  </div>

                  <h3
                    style={{
                      margin: "4px 0 15px",
                      color: "#0f172a",
                      fontSize: "19px",
                      lineHeight: 1.5,
                    }}
                  >
                    {q.question || q.questionText || "Question उपलब्ध नहीं है"}
                  </h3>

                  <div style={{ display: "grid", gap: "9px" }}>
                    {options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        style={{
                          padding: "12px 14px",
                          border: "1px solid #dbe3ef",
                          borderRadius: "11px",
                          background: "#f8fafc",
                          color: "#1e293b",
                          fontWeight: 600,
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            marginRight: "9px",
                            borderRadius: "8px",
                            background: "#e0e7ff",
                            color: "#3730a3",
                            fontWeight: 900,
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>

                  {(q.answer || q.correctAnswer) && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "13px 15px",
                        borderRadius: "11px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>✅ सही उत्तर:</strong>{" "}
                      {q.answer || q.correctAnswer}
                    </div>
                  )}

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "13px 15px",
                        borderRadius: "11px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1e3a8a",
                        lineHeight: 1.6,
                      }}
                    >
                      <strong>📖 Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer branding */}
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            padding: "20px",
            color: "#475569",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            📚 <span style={{ color: "#2563eb" }}>Exam Test</span>
          </div>
          <div style={{ marginTop: "5px", fontSize: "14px" }}>
            AI Powered Exam Preparation
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIMCQGenerator;

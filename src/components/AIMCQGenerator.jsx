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
      setError("कृपया Topic डालें।");
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
          topic,
          exam,
          count,
          language,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "MCQ generate नहीं हो सके।"
        );
      }

      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Gemini API से connection नहीं हो पाया।"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            questions,
          },
          null,
          2
        )
      );

      alert("Questions JSON copy हो गया।");
    } catch (error) {
      console.error(error);
      alert("Copy नहीं हो पाया।");
    }
  };

  const downloadJSON = () => {
    const data = JSON.stringify(
      {
        questions,
      },
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.10)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "10px",
          }}
        >
          🤖 AI MCQ Generator
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Gemini AI की मदद से MCQ तैयार करें
        </p>

        {/* Topic */}
        <label>
          <strong>Topic</strong>
        </label>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="जैसे: भारतीय संविधान"
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        {/* Exam */}
        <label>
          <strong>Exam</strong>
        </label>

        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
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

        {/* Count */}
        <label>
          <strong>Questions</strong>
        </label>

        <select
          value={count}
          onChange={(e) =>
            setCount(Number(e.target.value))
          }
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        >
          <option value="5">5 Questions</option>
          <option value="10">10 Questions</option>
          <option value="20">20 Questions</option>
          <option value="30">30 Questions</option>
          <option value="50">50 Questions</option>
        </select>

        {/* Language */}
        <label>
          <strong>Language</strong>
        </label>

        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        >
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
        </select>

        {/* Difficulty */}
        <label>
          <strong>Difficulty</strong>
        </label>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "8px",
            marginBottom: "25px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateMCQs}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "10px",
            background: loading
              ? "#999"
              : "#2563eb",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "⏳ Gemini MCQ बना रहा है..."
            : "🤖 Generate MCQs"}
        </button>
      </div>

      {/* Result */}
      {questions.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={copyJSON}
              style={{
                padding: "12px 18px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              📋 Copy JSON
            </button>

            <button
              onClick={downloadJSON}
              style={{
                padding: "12px 18px",
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ⬇️ Download JSON
            </button>
          </div>

          {questions.map((q, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "12px",
                boxShadow:
                  "0 3px 15px rgba(0,0,0,0.08)",
              }}
            >
              <h3>
                Q{index + 1}. {q.question}
              </h3>

              {q.options?.map(
                (option, optionIndex) => (
                  <div
                    key={optionIndex}
                    style={{
                      padding: "10px",
                      marginTop: "7px",
                      border: "1px solid #ddd",
                      borderRadius: "7px",
                    }}
                  >
                    {String.fromCharCode(
                      65 + optionIndex
                    )}
                    . {option}
                  </div>
                )
              )}

              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  background: "#dcfce7",
                  borderRadius: "8px",
                }}
              >
                <strong>
                  ✅ सही उत्तर:
                </strong>{" "}
                {q.answer}
              </div>

              {q.explanation && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    background: "#eff6ff",
                    borderRadius: "8px",
                  }}
                >
                  <strong>
                    📖 Explanation:
                  </strong>{" "}
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIMCQGenerator;

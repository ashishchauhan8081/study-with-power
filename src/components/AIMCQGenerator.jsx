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
          topic: topic.trim(),
          exam,
          count,
          language,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            data?.message ||
            "MCQ generate नहीं हो सके।"
        );
      }

      if (!Array.isArray(data.questions)) {
        throw new Error(
          "API response में questions नहीं मिले।"
        );
      }

      setQuestions(data.questions);
    } catch (err) {
      console.error("AI MCQ Error:", err);

      setError(
        err?.message ||
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
          { questions },
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
      { questions },
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "questions.json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

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
          background: "#fff",
          padding: "25px",
          borderRadius: "16px",
          boxShadow:
            "0 5px 25px rgba(0,0,0,.10)",
        }}
      >
        <div
          style={{
            fontSize: "55px",
            textAlign: "center",
          }}
        >
          🤖
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#0f2b57",
            marginBottom: "10px",
          }}
        >
          AI MCQ Generator
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "20px",
            marginBottom: "30px",
          }}
        >
          विषय और परीक्षा के अनुसार MCQ तैयार करें
        </p>

        <label>
          <strong>विषय / Topic</strong>
        </label>

        <input
          type="text"
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          placeholder="जैसे: भारतीय संविधान"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "9px",
            border:
              "1px solid #cbd5e1",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <label>
          <strong>परीक्षा / Exam</strong>
        </label>

        <select
          value={exam}
          onChange={(e) =>
            setExam(e.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "9px",
            border:
              "1px solid #cbd5e1",
            fontSize: "16px",
          }}
        >
          <option value="UPPCS">
            UPPCS
          </option>

          <option value="UP Police">
            UP Police
          </option>

          <option value="UP Home Guard">
            UP Home Guard
          </option>

          <option value="UP PET">
            UP PET
          </option>

          <option value="UPSSSC">
            UPSSSC
          </option>

          <option value="SSC CGL">
            SSC CGL
          </option>

          <option value="SSC CHSL">
            SSC CHSL
          </option>

          <option value="RRB NTPC">
            RRB NTPC
          </option>

          <option value="RRB Group D">
            RRB Group D
          </option>

          <option value="NDA">
            NDA
          </option>

          <option value="CTET">
            CTET
          </option>
        </select>

        <label>
          <strong>प्रश्नों की संख्या</strong>
        </label>

        <select
          value={count}
          onChange={(e) =>
            setCount(
              Number(e.target.value)
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "9px",
            border:
              "1px solid #cbd5e1",
            fontSize: "16px",
          }}
        >
          <option value="5">
            5 Questions
          </option>

          <option value="10">
            10 Questions
          </option>

          <option value="20">
            20 Questions
          </option>

          <option value="30">
            30 Questions
          </option>

          <option value="50">
            50 Questions
          </option>
        </select>

        <label>
          <strong>भाषा / Language</strong>
        </label>

        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "8px",
            marginBottom: "18px",
            borderRadius: "9px",
            border:
              "1px solid #cbd5e1",
            fontSize: "16px",
          }}
        >
          <option value="Hindi">
            Hindi
          </option>

          <option value="English">
            English
          </option>
        </select>

        <label>
          <strong>
            कठिनाई / Difficulty
          </strong>
        </label>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "8px",
            marginBottom: "25px",
            borderRadius: "9px",
            border:
              "1px solid #cbd5e1",
            fontSize: "16px",
          }}
        >
          <option value="Easy">
            Easy
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Hard">
            Hard
          </option>
        </select>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "14px",
              borderRadius: "9px",
              marginBottom: "15px",
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
            padding: "16px",
            border: "none",
            borderRadius: "10px",
            background: loading
              ? "#94a3b8"
              : "#2563eb",
            color: "#fff",
            fontSize: "19px",
            fontWeight: "700",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "⏳ Gemini MCQ बना रहा है..."
            : "🤖 MCQ Generate करें"}
        </button>
      </div>

      {questions.length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={copyJSON}
              style={{
                padding:
                  "12px 18px",
                background:
                  "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📋 Copy JSON
            </button>

            <button
              type="button"
              onClick={downloadJSON}
              style={{
                padding:
                  "12px 18px",
                background:
                  "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ⬇️ Download JSON
            </button>
          </div>

          {questions.map(
            (q, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 3px 15px rgba(0,0,0,.08)",
                }}
              >
                <h3
                  style={{
                    lineHeight: "1.6",
                    color: "#111827",
                  }}
                >
                  Q{index + 1}.{" "}
                  {q.question}
                </h3>

                {q.options &&
                  ["A", "B", "C", "D"].map(
                    (letter) => (
                      <div
                        key={letter}
                        style={{
                          padding: "11px",
                          marginTop: "8px",
                          border:
                            "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      >
                        <strong>
                          {letter}.
                        </strong>{" "}
                        {q.options[letter]}
                      </div>
                    )
                  )}

                <div
                  style={{
                    marginTop: "15px",
                    padding: "13px",
                    background:
                      "#dcfce7",
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
                      padding: "13px",
                      background:
                        "#eff6ff",
                      borderRadius: "8px",
                      lineHeight: "1.6",
                    }}
                  >
                    <strong>
                      📖 Explanation:
                    </strong>{" "}
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default AIMCQGenerator;

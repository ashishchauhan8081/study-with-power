import { useEffect, useState } from "react";

function AIMCQGenerator({
  initialTopic = "",
  currentAffairs = false,
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [exam, setExam] = useState("UPPCS");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("Hindi");
  const [difficulty, setDifficulty] = useState("Medium");

  const [questions, setQuestions] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const generateMCQs = async () => {
    const finalTopic = topic.trim();

    if (!finalTopic) {
      setError("कृपया Topic डालें।");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setSources([]);

    try {
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: finalTopic,
          exam,
          count,
          language,
          difficulty,
          currentAffairs,
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

      if (Array.isArray(data.sources)) {
        setSources(data.sources);
      }
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
    a.download = "current-affairs-mcq.json";

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
          {currentAffairs
            ? "📰 Current Affairs MCQ"
            : "AI MCQ Generator"}
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "30px",
          }}
        >
          {currentAffairs
            ? "आज के ताजा Current Affairs से MCQ तैयार करें"
            : "विषय और परीक्षा के अनुसार MCQ तैयार करें"}
        </p>

        {currentAffairs && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "14px",
              borderRadius: "10px",
              marginBottom: "20px",
              color: "#1e40af",
              fontWeight: "600",
            }}
          >
            🔎 Google Search के माध्यम से ताजा जानकारी
            verify करके MCQ बनाए जाएंगे।
          </div>
        )}

        <label>
          <strong>विषय / Topic</strong>
        </label>

        <input
          type="text"
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          placeholder={
            currentAffairs
              ? "जैसे: आज के राष्ट्रीय Current Affairs"
              : "जैसे: भारतीय संविधान"
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

          <option value="SSC">
            SSC
          </option>

          <option value="RRB">
            RRB
          </option>

          <option value="NTPC">
            NTPC
          </option>

          <option value="All Competitive Exams">
            All Competitive Exams
          </option>
        </select>

        <label>
          <strong>
            प्रश्नों की संख्या / Questions
          </strong>
        </label>

        <select
          value={count}
          onChange={(e) =>
            setCount(Number(e.target.value))
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
          <option value={5}>
            5 Questions
          </option>

          <option value={10}>
            10 Questions
          </option>

          <option value={20}>
            20 Questions
          </option>

          <option value={30}>
            30 Questions
          </option>

          <option value={50}>
            50 Questions
          </option>
        </select>

        <label>
          <strong>
            भाषा / Language
          </strong>
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
            ? "⏳ ताजा MCQ तैयार हो रहे हैं..."
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
                padding: "12px 18px",
                background: "#16a34a",
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
                padding: "12px 18px",
                background: "#7c3aed",
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
            (item, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "18px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 3px 15px rgba(0,0,0,.08)",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    color: "#111827",
                  }}
                >
                  Q{index + 1}.{" "}
                  {item.question}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {["A", "B", "C", "D"].map(
                    (key) => (
                      <div
                        key={key}
                        style={{
                          padding: "12px",
                          border:
                            "1px solid #dbe3ef",
                          borderRadius: "8px",
                          background:
                            item.answer === key
                              ? "#dcfce7"
                              : "#fff",
                        }}
                      >
                        <strong>
                          {key}.
                        </strong>{" "}
                        {item.options?.[key]}
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "#dcfce7",
                    borderRadius: "8px",
                    color: "#166534",
                    fontWeight: "700",
                  }}
                >
                  ✅ सही उत्तर:{" "}
                  {item.answer}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    background: "#eff6ff",
                    borderRadius: "8px",
                    color: "#1e3a8a",
                  }}
                >
                  📖{" "}
                  <strong>
                    Explanation:
                  </strong>{" "}
                  {item.explanation}
                </div>
              </div>
            )
          )}

          {sources.length > 0 && (
            <div
              style={{
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "12px",
                marginTop: "20px",
              }}
            >
              <h3>
                🔎 Web Sources
              </h3>

              {sources.map(
                (source, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "8px",
                    }}
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.title ||
                        source.url}
                    </a>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIMCQGenerator;

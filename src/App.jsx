import React, { useState } from "react";
import "./App.css";

function App() {
  // ================= AI ASSISTANT =================

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ================= MCQ GENERATOR =================

  const [mcqTopic, setMcqTopic] = useState("");
  const [mcqCount, setMcqCount] = useState("5");
  const [mcqExam, setMcqExam] = useState("UPPCS");
  const [mcqs, setMcqs] = useState([]);
  const [mcqLoading, setMcqLoading] = useState(false);

  // ================= ASK AI =================

  const askAI = async () => {
    if (!aiQuestion.trim()) {
      alert("कृपया अपना प्रश्न लिखिए।");
      return;
    }

    setAiLoading(true);
    setAiAnswer("");

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: aiQuestion.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI से उत्तर नहीं मिला।");
      }

      setAiAnswer(data.answer || "AI से उत्तर नहीं मिला।");
    } catch (error) {
      console.error("❌ AI ERROR:", error);

      setAiAnswer(
        "❌ AI से उत्तर नहीं मिल सका।\n\n" +
        "कृपया कुछ समय बाद पुनः प्रयास करें।"
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ================= MCQ GENERATE =================

  const generateMCQ = async () => {
    if (!mcqTopic.trim()) {
      alert("कृपया MCQ का Topic लिखिए।");
      return;
    }

    setMcqLoading(true);
    setMcqs([]);

    try {
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: mcqTopic.trim(),
          count: Number(mcqCount),
          exam: mcqExam,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "MCQ नहीं बन सके।");
      }

      setMcqs(data.questions || []);
    } catch (error) {
      console.error("❌ MCQ ERROR:", error);

      alert(
        error.message ||
          "MCQ बनाने में समस्या हुई। कृपया कुछ समय बाद पुनः प्रयास करें।"
      );
    } finally {
      setMcqLoading(false);
    }
  };

  // ================= ENTER KEY =================

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      askAI();
    }
  };

  // ================= AI ANSWER FORMAT =================

  const renderAnswer = () => {
    return aiAnswer.split("\n").map((line, index) => {
      const text = line.trim();

      if (!text) {
        return <div key={index} className="answer-space" />;
      }

      if (text.startsWith("📚 उत्तर:")) {
        return (
          <div
            key={index}
            className="answer-section answer-green"
          >
            <h3>📚 उत्तर</h3>
            <p>
              {text.replace("📚 उत्तर:", "").trim()}
            </p>
          </div>
        );
      }

      if (text.startsWith("🔹 मुख्य बिंदु:")) {
        return (
          <div
            key={index}
            className="answer-section answer-blue"
          >
            <h3>🔹 मुख्य बिंदु</h3>
          </div>
        );
      }

      if (text.startsWith("🎯 परीक्षा के लिए महत्वपूर्ण:")) {
        return (
          <div
            key={index}
            className="answer-section answer-red"
          >
            <h3>🎯 परीक्षा के लिए महत्वपूर्ण</h3>
          </div>
        );
      }

      if (
        text.startsWith("💡 याद रखने योग्य") ||
        text.startsWith("📌 याद रखने योग्य")
      ) {
        return (
          <div
            key={index}
            className="answer-section answer-yellow"
          >
            <h3>💡 याद रखने योग्य बातें</h3>
          </div>
        );
      }

      if (text.startsWith("•")) {
        return (
          <div key={index} className="answer-bullet">
            <span>✓</span>
            <p>{text.replace(/^•\s*/, "")}</p>
          </div>
        );
      }

      if (/^\d+[.)]/.test(text)) {
        return (
          <div key={index} className="answer-number">
            <span>●</span>
            <p>{text}</p>
          </div>
        );
      }

      return (
        <p key={index} className="answer-paragraph">
          {text}
        </p>
      );
    });
  };

  // ================= PAGE =================

  return (
    <div>

      {/* ================= HEADER ================= */}

      <header className="site-header">

        <div className="site-brand">

          <div className="site-logo">
            📚
          </div>

          <div>
            <h1>Study With Power</h1>

            <div className="site-author">
              👨‍🏫 Ashish Chauhan
            </div>
          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="site-nav">

          <button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => {
              window.location.href = "/notes";
            }}
          >
            📄 Notes
          </button>

          <button
            onClick={() => {
              window.location.href = "/books";
            }}
          >
            📚 Books
          </button>

          <button
            onClick={() => {
              window.location.href = "/questions";
            }}
          >
            ❓ Questions
          </button>

        </nav>

      </header>

      {/* ================================================= */}
      {/*                AI STUDY ASSISTANT                 */}
      {/* ================================================= */}

      <main className="ai-container">

        <div className="ai-card">

          <div className="ai-title">
            🤖 AI Study Assistant
          </div>

          <div className="ai-subtitle">
            📚 अपने प्रश्न का आसान और परीक्षा उपयोगी उत्तर पाएँ
          </div>

          {/* ================= QUESTION BOX ================= */}

          <textarea
            className="ai-question"
            value={aiQuestion}
            onChange={(e) => {
              setAiQuestion(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="✍️ अपना प्रश्न यहाँ लिखें..."
            disabled={aiLoading}
          />

          {/* ================= ASK BUTTON ================= */}

          <button
            className="ai-button"
            onClick={askAI}
            disabled={aiLoading || !aiQuestion.trim()}
          >
            {aiLoading
              ? "⏳ उत्तर तैयार हो रहा है..."
              : "👨‍🏫 Ashish से पूछें"}
          </button>

          {/* ================= LOADING ================= */}

          {aiLoading && (
            <div className="ai-loading">

              <div className="loading-icon">
                ⏳
              </div>

              <div>
                <strong>
                  🤖 Ashish AI काम कर रहा है...
                </strong>

                <br />

                <span>
                  आपके प्रश्न का उत्तर तैयार किया जा रहा है।
                </span>
              </div>

            </div>
          )}

          {/* ================= AI ANSWER ================= */}

          {aiAnswer && !aiLoading && (
            <div className="ai-answer">

              <div className="answer-header">

                <div className="answer-icon">
                  🤖
                </div>

                <div>
                  <h2>AI का उत्तर</h2>

                  <span>
                    Study With Power • Gemini AI
                  </span>
                </div>

              </div>

              <div className="answer-content">
                {renderAnswer()}
              </div>

              <div className="ai-footer">
                💡 परीक्षा की तैयारी के लिए Gemini AI द्वारा तैयार उत्तर
              </div>

            </div>
          )}

        </div>


        {/* ================================================= */}
        {/*                 MCQ GENERATOR                     */}
        {/* ================================================= */}

        <div
          className="ai-card"
          style={{
            marginTop: "30px",
          }}
        >

          <div
            className="ai-title"
            style={{
              fontSize: "30px",
            }}
          >
            📝 AI MCQ Generator
          </div>

          <div className="ai-subtitle">
            🎯 किसी भी Topic से परीक्षा उपयोगी MCQ तैयार करें
          </div>


          {/* ================= TOPIC ================= */}

          <input
            type="text"
            value={mcqTopic}
            onChange={(e) => setMcqTopic(e.target.value)}
            placeholder="📚 Topic लिखें — जैसे भारत का संविधान"
            disabled={mcqLoading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "16px",
              borderRadius: "12px",
              border: "2px solid #d5dce8",
              fontSize: "18px",
              marginTop: "20px",
            }}
          />


          {/* ================= OPTIONS ================= */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "18px",
            }}
          >

            {/* COUNT */}

            <select
              value={mcqCount}
              onChange={(e) => setMcqCount(e.target.value)}
              disabled={mcqLoading}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            >
              <option value="5">5 प्रश्न</option>
              <option value="10">10 प्रश्न</option>
              <option value="20">20 प्रश्न</option>
            </select>


            {/* EXAM */}

            <select
              value={mcqExam}
              onChange={(e) => setMcqExam(e.target.value)}
              disabled={mcqLoading}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            >
              <option value="UPPCS">UPPCS</option>
              <option value="SSC">SSC</option>
              <option value="Railway">Railway</option>
              <option value="Banking">Banking</option>
              <option value="General">सामान्य परीक्षा</option>
            </select>

          </div>


          {/* ================= GENERATE BUTTON ================= */}

          <button
            className="ai-button"
            onClick={generateMCQ}
            disabled={mcqLoading || !mcqTopic.trim()}
            style={{
              marginTop: "20px",
            }}
          >
            {mcqLoading
              ? "⏳ MCQ तैयार हो रहे हैं..."
              : "📝 MCQ तैयार करें"}
          </button>


          {/* ================= MCQ LOADING ================= */}

          {mcqLoading && (
            <div
              style={{
                textAlign: "center",
                marginTop: "25px",
                fontSize: "18px",
              }}
            >
              🤖 Gemini AI MCQ तैयार कर रहा है...
            </div>
          )}


          {/* ================= MCQ LIST ================= */}

          {mcqs.length > 0 && !mcqLoading && (

            <div
              style={{
                marginTop: "30px",
              }}
            >

              <h2
                style={{
                  textAlign: "center",
                }}
              >
                📚 {mcqTopic} — {mcqExam}
              </h2>


              {mcqs.map((mcq, index) => (

                <div
                  key={index}
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    borderRadius: "15px",
                    border: "1px solid #dce3ed",
                    background: "#fff",
                    boxShadow:
                      "0 4px 15px rgba(0,0,0,0.06)",
                  }}
                >

                  <h3>
                    {index + 1}. {mcq.question}
                  </h3>


                  {/* OPTIONS */}

                  {mcq.options &&
                    Object.entries(mcq.options).map(
                      ([key, value]) => (

                        <div
                          key={key}
                          style={{
                            padding: "10px 14px",
                            marginTop: "8px",
                            borderRadius: "8px",
                            background:
                              "#f7f9fc",
                            fontSize: "17px",
                          }}
                        >
                          <strong>{key})</strong>{" "}
                          {value}
                        </div>

                      )
                    )}


                  {/* ANSWER */}

                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#eafaf0",
                      color: "#137333",
                    }}
                  >
                    ✅ <strong>सही उत्तर:</strong>{" "}
                    {mcq.answer}
                  </div>


                  {/* EXPLANATION */}

                  {mcq.explanation && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "#fff8e5",
                      }}
                    >
                      💡 <strong>व्याख्या:</strong>{" "}
                      {mcq.explanation}
                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default App;
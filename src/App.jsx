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

  // ================= INTERACTIVE QUIZ =================

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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

    // Quiz reset
    setCurrentQuestion(0);
    setSelectedOption("");
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);

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

      const questions = Array.isArray(data.questions)
        ? data.questions
        : [];

      setMcqs(questions);
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
            <p>{text.replace("📚 उत्तर:", "").trim()}</p>
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

  // ================= QUIZ HELPERS =================

  const normalizeAnswer = (answer) => {
    return String(answer || "")
      .trim()
      .toUpperCase()
      .replace(/[)\].:]/g, "")
      .trim();
  };

  const isCorrectAnswer = (mcq, optionKey) => {
    const answer = normalizeAnswer(mcq?.answer);
    const key = normalizeAnswer(optionKey);

    // सामान्यतः API answer "B" / "B)" / "B. ..." हो सकता है
    if (answer === key || answer.startsWith(key + " ")) {
      return true;
    }

    // यदि answer में "B)" जैसा text हो
    if (
      answer.startsWith(key + ")") ||
      answer.startsWith(key + ".") ||
      answer.startsWith(key + "-")
    ) {
      return true;
    }

    return false;
  };

  const submitAnswer = () => {
    if (!selectedOption || submitted) return;

    const mcq = mcqs[currentQuestion];

    if (isCorrectAnswer(mcq, selectedOption)) {
      setScore((prev) => prev + 1);
    }

    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (currentQuestion >= mcqs.length - 1) {
      setQuizFinished(true);
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
    setSelectedOption("");
    setSubmitted(false);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption("");
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const getOptionClass = (key, mcq) => {
    if (!submitted) {
      return selectedOption === key
        ? "quiz-option quiz-option-selected"
        : "quiz-option";
    }

    const correct = isCorrectAnswer(mcq, key);

    if (correct) {
      return "quiz-option quiz-option-correct";
    }

    if (selectedOption === key && !correct) {
      return "quiz-option quiz-option-wrong";
    }

    return "quiz-option";
  };

  // ================= PAGE =================

  return (
    <div>
      {/* ================= HEADER ================= */}

      <header className="site-header">
        <div className="site-brand">
          <div className="site-logo">📚</div>

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
          <div className="ai-title">🤖 AI Study Assistant</div>

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
              <div className="loading-icon">⏳</div>

              <div>
                <strong>🤖 Ashish AI काम कर रहा है...</strong>

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
                <div className="answer-icon">🤖</div>

                <div>
                  <h2>AI का उत्तर</h2>

                  <span>Study With Power • Gemini AI</span>
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

          {/* ================= INTERACTIVE QUIZ ================= */}

          {mcqs.length > 0 && !mcqLoading && !quizFinished && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                borderRadius: "18px",
                background: "#f8fafc",
                border: "1px solid #dce3ed",
              }}
            >
              {/* QUIZ HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                }}
              >
                <h2 style={{ margin: 0 }}>
                  📚 {mcqTopic} — {mcqExam}
                </h2>

                <strong>
                  प्रश्न {currentQuestion + 1} / {mcqs.length}
                </strong>
              </div>

              {/* PROGRESS */}

              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background: "#e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    width: `${
                      ((currentQuestion + 1) / mcqs.length) * 100
                    }%`,
                    height: "100%",
                    background: "#2563eb",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {(() => {
                const mcq = mcqs[currentQuestion];

                if (!mcq) return null;

                return (
                  <>
                    {/* QUESTION */}

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#fff",
                        border: "1px solid #dce3ed",
                      }}
                    >
                      <h3
                        style={{
                          marginTop: 0,
                          fontSize: "21px",
                          lineHeight: 1.6,
                        }}
                      >
                        {currentQuestion + 1}. {mcq.question}
                      </h3>

                      {/* OPTIONS */}

                      {mcq.options &&
                        Object.entries(mcq.options).map(
                          ([key, value]) => (
                            <button
                              key={key}
                              type="button"
                              className={getOptionClass(key, mcq)}
                              onClick={() => {
                                if (!submitted) {
                                  setSelectedOption(key);
                                }
                              }}
                              disabled={submitted}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "15px",
                                marginTop: "10px",
                                borderRadius: "10px",
                                border:
                                  selectedOption === key &&
                                  !submitted
                                    ? "2px solid #2563eb"
                                    : "1px solid #dce3ed",
                                background:
                                  submitted &&
                                  isCorrectAnswer(mcq, key)
                                    ? "#dcfce7"
                                    : submitted &&
                                      selectedOption === key
                                    ? "#fee2e2"
                                    : selectedOption === key
                                    ? "#eff6ff"
                                    : "#fff",
                                color:
                                  submitted &&
                                  isCorrectAnswer(mcq, key)
                                    ? "#15803d"
                                    : submitted &&
                                      selectedOption === key
                                    ? "#b91c1c"
                                    : "#111827",
                                fontSize: "17px",
                                cursor: submitted
                                  ? "default"
                                  : "pointer",
                              }}
                            >
                              <strong>{key})</strong>{" "}
                              {value}
                              {submitted &&
                                isCorrectAnswer(mcq, key) && (
                                  <span style={{ float: "right" }}>
                                    ✅
                                  </span>
                                )}
                              {submitted &&
                                selectedOption === key &&
                                !isCorrectAnswer(mcq, key) && (
                                  <span style={{ float: "right" }}>
                                    ❌
                                  </span>
                                )}
                            </button>
                          )
                        )}
                    </div>

                    {/* SUBMIT */}

                    {!submitted && (
                      <button
                        className="ai-button"
                        onClick={submitAnswer}
                        disabled={!selectedOption}
                        style={{
                          marginTop: "20px",
                        }}
                      >
                        ✅ उत्तर जमा करें
                      </button>
                    )}

                    {/* RESULT */}

                    {submitted && (
                      <div style={{ marginTop: "20px" }}>
                        <div
                          style={{
                            padding: "15px",
                            borderRadius: "12px",
                            background: isCorrectAnswer(
                              mcq,
                              selectedOption
                            )
                              ? "#dcfce7"
                              : "#fee2e2",
                            color: isCorrectAnswer(
                              mcq,
                              selectedOption
                            )
                              ? "#15803d"
                              : "#b91c1c",
                            fontSize: "18px",
                            fontWeight: "700",
                          }}
                        >
                          {isCorrectAnswer(mcq, selectedOption)
                            ? "🎉 सही उत्तर!"
                            : "❌ आपका उत्तर गलत है।"}
                        </div>

                        <div
                          style={{
                            marginTop: "10px",
                            padding: "14px",
                            borderRadius: "12px",
                            background: "#eafaf0",
                            color: "#137333",
                          }}
                        >
                          ✅ <strong>सही उत्तर:</strong>{" "}
                          {mcq.answer}
                        </div>

                        {mcq.explanation && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "14px",
                              borderRadius: "12px",
                              background: "#fff8e5",
                              lineHeight: 1.6,
                            }}
                          >
                            💡 <strong>व्याख्या:</strong>{" "}
                            {mcq.explanation}
                          </div>
                        )}

                        <button
                          className="ai-button"
                          onClick={nextQuestion}
                          style={{
                            marginTop: "18px",
                          }}
                        >
                          {currentQuestion === mcqs.length - 1
                            ? "🏆 परिणाम देखें"
                            : "➡️ अगला प्रश्न"}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* ================= FINAL SCORE ================= */}

          {mcqs.length > 0 && !mcqLoading && quizFinished && (
            <div
              style={{
                marginTop: "30px",
                padding: "35px 20px",
                textAlign: "center",
                borderRadius: "18px",
                background: "#f8fafc",
                border: "1px solid #dce3ed",
              }}
            >
              <div style={{ fontSize: "55px" }}>🏆</div>

              <h2 style={{ fontSize: "30px", margin: "10px 0" }}>
                Quiz पूरा हुआ!
              </h2>

              <p style={{ fontSize: "21px" }}>
                📚 {mcqTopic} — {mcqExam}
              </p>

              <div
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "20px 35px",
                  borderRadius: "15px",
                  background: "#eafaf0",
                  color: "#137333",
                  fontSize: "28px",
                  fontWeight: "800",
                }}
              >
                🎯 Score: {score} / {mcqs.length}
              </div>

              <p style={{ fontSize: "18px", marginTop: "20px" }}>
                {score === mcqs.length
                  ? "🌟 शानदार! सभी उत्तर सही हैं।"
                  : score >= mcqs.length * 0.7
                  ? "👏 बहुत अच्छा! आपकी तैयारी अच्छी है।"
                  : score >= mcqs.length * 0.5
                  ? "👍 अच्छा प्रयास! थोड़ी और तैयारी करें।"
                  : "📖 और अभ्यास की जरूरत है। फिर से प्रयास करें।"}
              </p>

              <button
                className="ai-button"
                onClick={restartQuiz}
                style={{ marginTop: "10px" }}
              >
                🔄 Quiz फिर से शुरू करें
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

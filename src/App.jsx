import React, { useState } from "react";
import "./App.css";

function App() {
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ================= AI ASK FUNCTION =================

  const askAI = async () => {
    if (!aiQuestion.trim()) {
      alert("कृपया अपना प्रश्न लिखिए।");
      return;
    }

    setAiLoading(true);
    setAiAnswer("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: aiQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI से उत्तर नहीं मिला।"
        );
      }

      setAiAnswer(
        data.answer || "AI से उत्तर नहीं मिला।"
      );

    } catch (error) {
      console.error("AI ERROR:", error);

      setAiAnswer(
        "❌ AI से उत्तर नहीं मिल सका।\n\nकृपया जाँचें कि Ollama और Study With Power Server चालू हैं।"
      );

    } finally {
      setAiLoading(false);
    }
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

            <h1>
              Study With Power
            </h1>

            <div className="site-author">
              👨‍🏫 Ashish Chauhan
            </div>

          </div>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="site-nav">

          <button
            onClick={() =>
              window.location.href = "/"
            }
          >
            🏠 Home
          </button>

          <button
            onClick={() =>
              window.location.href = "/notes"
            }
          >
            📄 Notes
          </button>

          <button
            onClick={() =>
              window.location.href = "/books"
            }
          >
            📚 Books
          </button>

          <button
            onClick={() =>
              window.location.href = "/questions"
            }
          >
            ❓ Questions
          </button>

        </nav>

      </header>


      {/* ================= AI STUDY ASSISTANT ================= */}

      <main className="ai-container">

        <div className="ai-card">

          {/* AI TITLE */}

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
            onChange={(e) =>
              setAiQuestion(e.target.value)
            }
            placeholder="✍️ अपना प्रश्न यहाँ लिखें..."
            disabled={aiLoading}
          />


          {/* ================= ASK BUTTON ================= */}

          <button
            className="ai-button"
            onClick={askAI}
            disabled={
              aiLoading ||
              !aiQuestion.trim()
            }
          >
            {aiLoading ? (
              <>
                ⏳ उत्तर तैयार हो रहा है...
              </>
            ) : (
              <>
                👨‍🏫 Ashish से पूछें
              </>
            )}
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


              {/* ================= ANSWER HEADER ================= */}

              <div className="answer-header">

                <div className="answer-icon">
                  🤖
                </div>

                <div>

                  <h2>
                    AI का उत्तर
                  </h2>

                  <span>
                    Study With Power • Gemma 3
                  </span>

                </div>

              </div>


              {/* ================= ANSWER CONTENT ================= */}

              <div className="answer-content">

                {aiAnswer
                  .split("\n")
                  .map((line, index) => {

                    const text =
                      line.trim();


                    {/* EMPTY LINE */}

                    if (!text) {

                      return (
                        <div
                          key={index}
                          className="answer-space"
                        />
                      );

                    }


                    {/* ================= उत्तर ================= */}

                    if (
                      text.startsWith(
                        "📚 उत्तर:"
                      )
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-section answer-green"
                        >

                          <h3>
                            📚 उत्तर
                          </h3>

                          <p>
                            {text
                              .replace(
                                "📚 उत्तर:",
                                ""
                              )
                              .trim()}
                          </p>

                        </div>
                      );

                    }


                    {/* ================= मुख्य बिंदु ================= */}

                    if (
                      text.startsWith(
                        "🔹 मुख्य बिंदु:"
                      )
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-section answer-blue"
                        >

                          <h3>
                            🔹 मुख्य बिंदु
                          </h3>

                        </div>
                      );

                    }


                    {/* ================= परीक्षा ================= */}

                    if (
                      text.startsWith(
                        "🎯 परीक्षा के लिए महत्वपूर्ण:"
                      )
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-section answer-red"
                        >

                          <h3>
                            🎯 परीक्षा के लिए महत्वपूर्ण
                          </h3>

                        </div>
                      );

                    }


                    {/* ================= याद रखने योग्य ================= */}

                    if (
                      text.startsWith(
                        "💡 याद रखने योग्य"
                      ) ||
                      text.startsWith(
                        "📌 याद रखने योग्य"
                      )
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-section answer-yellow"
                        >

                          <h3>
                            💡 याद रखने योग्य बातें
                          </h3>

                        </div>
                      );

                    }


                    {/* ================= BULLET ================= */}

                    if (
                      text.startsWith("•")
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-bullet"
                        >

                          <span>
                            ✓
                          </span>

                          <p>
                            {text.replace(
                              /^•\s*/,
                              ""
                            )}
                          </p>

                        </div>
                      );

                    }


                    {/* ================= NUMBER ================= */}

                    if (
                      /^\d+[.)]/.test(text)
                    ) {

                      return (
                        <div
                          key={index}
                          className="answer-number"
                        >

                          <span>
                            ●
                          </span>

                          <p>
                            {text}
                          </p>

                        </div>
                      );

                    }


                    {/* ================= NORMAL TEXT ================= */}

                    return (
                      <p
                        key={index}
                        className="answer-paragraph"
                      >
                        {text}
                      </p>
                    );

                  })}

              </div>


              {/* ================= FOOTER ================= */}

              <div className="ai-footer">

                💡 परीक्षा की तैयारी के लिए AI द्वारा तैयार उत्तर

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default App;
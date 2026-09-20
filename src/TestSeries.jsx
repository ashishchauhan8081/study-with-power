import React, { useState } from "react";

function TestSeries({ exam, onBack }) {
  const [selectedTest, setSelectedTest] = useState(null);

  const tests = [
    {
      id: 1,
      title: `${exam} Test 01`,
      questions: 50,
      time: 60,
      type: "Free",
    },
    {
      id: 2,
      title: `${exam} Test 02`,
      questions: 50,
      time: 60,
      type: "Free",
    },
    {
      id: 3,
      title: `${exam} Test 03`,
      questions: 100,
      time: 90,
      type: "Premium",
    },
    {
      id: 4,
      title: `${exam} Test 04`,
      questions: 100,
      time: 90,
      type: "Premium",
    },
  ];

  const startTest = (test) => {
    setSelectedTest(test);
  };

  // ==============================
  // SELECTED TEST PAGE
  // ==============================

  if (selectedTest) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "20px",
            padding: "25px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedTest(null)}
            style={{
              border: "none",
              background: "#eef4ff",
              color: "#0868f5",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            ⬅️ वापस
          </button>

          <h1
            style={{
              color: "#10235d",
              marginBottom: "10px",
            }}
          >
            {selectedTest.title}
          </h1>

          <p style={{ color: "#64748b" }}>
            {exam} परीक्षा के लिए Online Test
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "15px",
              marginTop: "25px",
            }}
          >
            <div
              style={{
                background: "#eff6ff",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <strong>📝 Questions</strong>
              <br />
              {selectedTest.questions}
            </div>

            <div
              style={{
                background: "#f0fdf4",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <strong>⏱️ Time</strong>
              <br />
              {selectedTest.time} मिनट
            </div>

            <div
              style={{
                background: "#fff7ed",
                padding: "18px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <strong>💰 Type</strong>
              <br />
              {selectedTest.type}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              alert(
                `${selectedTest.title} जल्द ही शुरू होगा।`
              );
            }}
            style={{
              width: "100%",
              marginTop: "30px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: "#0868f5",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            ▶️ Start Test
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // TEST SERIES LIST
  // ==============================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.07)",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              border: "none",
              background: "#eef4ff",
              color: "#0868f5",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "15px",
            }}
          >
            ⬅️ Home
          </button>

          <h1
            style={{
              margin: "5px 0",
              color: "#10235d",
            }}
          >
            🎯 {exam} Test Series
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            अपनी परीक्षा की Test Series चुनें
          </p>
        </div>

        {/* TEST GRID */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {tests.map((test) => (
            <div
              key={test.id}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "22px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "10px",
                }}
              >
                📝
              </div>

              <h2
                style={{
                  margin: "5px 0 10px",
                  color: "#10235d",
                }}
              >
                {test.title}
              </h2>

              <p style={{ color: "#64748b" }}>
                प्रश्न: {test.questions}
                <br />
                समय: {test.time} मिनट
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background:
                    test.type === "Free"
                      ? "#dcfce7"
                      : "#fef3c7",
                  color:
                    test.type === "Free"
                      ? "#166534"
                      : "#92400e",
                  fontWeight: "700",
                  marginBottom: "15px",
                }}
              >
                {test.type === "Free"
                  ? "🆓 Free"
                  : "💎 Premium"}
              </div>

              <button
                type="button"
                onClick={() => startTest(test)}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#0868f5",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                View Test →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestSeries;

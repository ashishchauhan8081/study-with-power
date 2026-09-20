import React, { useMemo, useState } from "react";
import TestPage from "./TestPage";

const sampleTests = [
  {
    id: "up-pet-01",
    title: "UP PET 2026 – Full Length Test 01",
    exam: "UP PET",
    durationMinutes: 120,
    marksPerQuestion: 1,
    negativeMarking: true,
    negativeMarks: 0.25,
    questions: [
      {
        id: 1,
        question: "सिंधु घाटी सभ्यता का प्रमुख बंदरगाह कौन-सा था?",
        options: [
          "हड़प्पा",
          "लोथल",
          "कालीबंगा",
          "मोहनजोदड़ो",
        ],
        answer: 1,
        explanation:
          "लोथल गुजरात में स्थित सिंधु घाटी सभ्यता का प्रमुख बंदरगाह था।",
      },
      {
        id: 2,
        question: "भारत का संविधान कब लागू हुआ?",
        options: [
          "15 अगस्त 1947",
          "26 जनवरी 1950",
          "26 नवंबर 1949",
          "2 अक्टूबर 1950",
        ],
        answer: 1,
        explanation:
          "भारत का संविधान 26 जनवरी 1950 को लागू हुआ।",
      },
      {
        id: 3,
        question: "भारत की राजधानी कौन-सी है?",
        options: [
          "मुंबई",
          "लखनऊ",
          "नई दिल्ली",
          "कोलकाता",
        ],
        answer: 2,
        explanation:
          "भारत की राजधानी नई दिल्ली है।",
      },
      {
        id: 4,
        question: "उत्तर प्रदेश की राजधानी कौन-सी है?",
        options: [
          "कानपुर",
          "लखनऊ",
          "प्रयागराज",
          "वाराणसी",
        ],
        answer: 1,
        explanation:
          "उत्तर प्रदेश की राजधानी लखनऊ है।",
      },
      {
        id: 5,
        question: "भारत में हरित क्रांति के जनक के रूप में किसे जाना जाता है?",
        options: [
          "एम. एस. स्वामीनाथन",
          "विक्रम साराभाई",
          "होमी भाभा",
          "सी. वी. रमन",
        ],
        answer: 0,
        explanation:
          "डॉ. एम. एस. स्वामीनाथन को भारत में हरित क्रांति का जनक माना जाता है।",
      },
    ],
  },

  {
    id: "up-pet-02",
    title: "UP PET 2026 – Practice Test 02",
    exam: "UP PET",
    durationMinutes: 60,
    marksPerQuestion: 1,
    negativeMarking: true,
    negativeMarks: 0.25,
    questions: [
      {
        id: 1,
        question: "गंगा नदी का उद्गम किस स्थान से माना जाता है?",
        options: [
          "यमुनोत्री",
          "गंगोत्री ग्लेशियर",
          "मानसरोवर",
          "सियाचिन",
        ],
        answer: 1,
        explanation:
          "भागीरथी नदी का उद्गम गंगोत्री ग्लेशियर के गौमुख से होता है।",
      },
      {
        id: 2,
        question: "भारत का राष्ट्रीय पशु कौन है?",
        options: [
          "सिंह",
          "हाथी",
          "बाघ",
          "हिरण",
        ],
        answer: 2,
        explanation:
          "बाघ भारत का राष्ट्रीय पशु है।",
      },
      {
        id: 3,
        question: "भारतीय संविधान में मौलिक अधिकार किस भाग में हैं?",
        options: [
          "भाग I",
          "भाग II",
          "भाग III",
          "भाग IV",
        ],
        answer: 2,
        explanation:
          "भारतीय संविधान के भाग III में मौलिक अधिकारों का वर्णन है।",
      },
    ],
  },
];

export default function TestSeries({ exam = "UP PET", onBack }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [search, setSearch] = useState("");

  const tests = useMemo(() => {
    return sampleTests.filter((test) => {
      const matchesExam =
        !exam ||
        test.exam.toLowerCase() === exam.toLowerCase();

      const matchesSearch =
        test.title
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesExam && matchesSearch;
    });
  }, [exam, search]);

  // ================= TEST OPEN =================

  if (selectedTest) {
    return (
      <TestPage
        test={selectedTest}
        onBack={() => setSelectedTest(null)}
      />
    );
  }

  // ================= TEST LIST =================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f8ff",
        padding: "25px 15px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            boxShadow:
              "0 8px 25px rgba(15,23,42,.08)",
          }}
        >
          <button
            onClick={onBack}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              padding: "10px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ⬅️ वापस
          </button>

          <h1
            style={{
              textAlign: "center",
              color: "#10235d",
              margin: "20px 0 5px",
            }}
          >
            🎯 {exam} Test Series
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              margin: 0,
            }}
          >
            अपनी Test Series चुनें और परीक्षा शुरू करें
          </p>
        </div>

        {/* SEARCH */}

        <div
          style={{
            background: "#ffffff",
            padding: 15,
            borderRadius: 15,
            marginBottom: 20,
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Test खोजें..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 15px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              outline: "none",
            }}
          />
        </div>

        {/* TEST COUNT */}

        <div
          style={{
            marginBottom: 15,
            color: "#475569",
            fontWeight: 700,
          }}
        >
          कुल Test: {tests.length}
        </div>

        {/* TEST GRID */}

        {tests.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: 35,
              borderRadius: 18,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 50 }}>📭</div>

            <h2>कोई Test नहीं मिला</h2>

            <p>
              अभी इस परीक्षा के लिए Test उपलब्ध नहीं है।
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {tests.map((test, index) => (
              <div
                key={test.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: 20,
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 7px 20px rgba(15,23,42,.07)",
                }}
              >
                {/* TEST ICON */}

                <div
                  style={{
                    fontSize: 45,
                    textAlign: "center",
                  }}
                >
                  📝
                </div>

                <h2
                  style={{
                    fontSize: 20,
                    color: "#10235d",
                    margin: "10px 0",
                  }}
                >
                  {test.title}
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 8,
                    margin: "15px 0",
                  }}
                >
                  <div
                    style={{
                      background: "#eff6ff",
                      padding: 10,
                      borderRadius: 10,
                      textAlign: "center",
                    }}
                  >
                    <b>📚 Questions</b>
                    <br />
                    {test.questions.length}
                  </div>

                  <div
                    style={{
                      background: "#f0fdf4",
                      padding: 10,
                      borderRadius: 10,
                      textAlign: "center",
                    }}
                  >
                    <b>⏱️ Time</b>
                    <br />
                    {test.durationMinutes} मिनट
                  </div>
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    marginBottom: 15,
                  }}
                >
                  <div>
                    🎯 Marks: {test.marksPerQuestion} प्रति प्रश्न
                  </div>

                  <div>
                    ❌ Negative Marking:{" "}
                    {test.negativeMarking
                      ? `हाँ (-${test.negativeMarks})`
                      : "नहीं"}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedTest(test)
                  }
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 10,
                    padding: "13px",
                    background: "#0868f5",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ▶️ Test शुरू करें
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

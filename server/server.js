const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

// ==================================================
// PORT
// ==================================================

const PORT = process.env.PORT || 5000;

// ==================================================
// GEMINI API
// ==================================================

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY नहीं मिली!");
} else {
  console.log("✅ Gemini API Key मिल गई");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ==================================================
// REACT FRONTEND
// ==================================================

const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ==================================================
// WAIT FUNCTION
// ==================================================

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ==================================================
// GEMINI REQUEST WITH RETRY + FALLBACK
// ==================================================

async function askGemini(prompt, config = {}) {

  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash"
  ];

  let lastError = null;

  for (const model of models) {

    for (let attempt = 1; attempt <= 2; attempt++) {

      try {

        console.log(
          `🤖 Gemini Model: ${model} | Attempt: ${attempt}`
        );

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: config
        });

        console.log(
          `✅ Gemini उत्तर मिला: ${model}`
        );

        return response;

      } catch (error) {

        lastError = error;

        const errorText =
          error?.message ||
          JSON.stringify(error);

        console.error(
          `❌ ${model} ERROR:`,
          errorText
        );

        const temporaryError =
          errorText.includes("503") ||
          errorText.includes("UNAVAILABLE") ||
          errorText.includes("high demand") ||
          errorText.includes("overloaded") ||
          errorText.includes("temporarily");

        if (temporaryError) {

          if (attempt === 1) {

            console.log(
              `⏳ ${model} busy है। 3 सेकंड बाद retry...`
            );

            await wait(3000);

          } else {

            console.log(
              `➡️ ${model} उपलब्ध नहीं है। अगले model पर जा रहे हैं...`
            );

          }

        } else {

          throw error;

        }
      }
    }
  }

  throw lastError;
}

// ==================================================
// AI STUDY ASSISTANT
// ==================================================

app.post("/api/ask", async (req, res) => {

  try {

    const { question } = req.body;

    // ------------------------------
    // Question Check
    // ------------------------------

    if (!question || !question.trim()) {

      return res.status(400).json({
        error: "कृपया अपना प्रश्न लिखिए।"
      });

    }

    // ------------------------------
    // API Key Check
    // ------------------------------

    if (!process.env.GEMINI_API_KEY) {

      return res.status(500).json({
        error: "Gemini API Key सेट नहीं है।"
      });

    }

    console.log(
      "📩 AI प्रश्न:",
      question
    );

    // ==================================================
    // AI PROMPT
    // ==================================================

    const prompt = `
आप "Study With Power" के AI Study Assistant हैं।

विद्यार्थी के प्रश्न का उत्तर सरल, स्पष्ट और आकर्षक हिंदी में दें।

उत्तर हमेशा इस format में दें:

📚 उत्तर:
प्रश्न का सीधा और स्पष्ट उत्तर 2-4 वाक्यों में दें।

🔹 मुख्य बिंदु:
• महत्वपूर्ण बिंदु
• महत्वपूर्ण बिंदु
• महत्वपूर्ण बिंदु

🎯 परीक्षा के लिए महत्वपूर्ण:
• परीक्षा में पूछे जाने योग्य तथ्य
• महत्वपूर्ण तारीख / व्यक्ति / स्थान
• महत्वपूर्ण तथ्य

💡 याद रखने योग्य बातें:
• बहुत महत्वपूर्ण तथ्य
• एक लाइन में याद रखने योग्य जानकारी

नियम:

1. हिंदी में उत्तर दें।
2. छोटे और स्पष्ट वाक्यों का प्रयोग करें।
3. headings बिल्कुल इसी तरह रखें।
4. bullet points के लिए केवल • का प्रयोग करें।
5. अनावश्यक लंबा उत्तर न दें।
6. इतिहास, भूगोल, राजनीति, विज्ञान और अर्थव्यवस्था के प्रश्नों में परीक्षा उपयोगी तथ्य जरूर दें।
7. यदि प्रश्न में टाइपिंग की छोटी गलती हो तो उसका सही अर्थ समझकर उत्तर दें।
8. उत्तर विद्यार्थियों और प्रतियोगी परीक्षा की तैयारी के लिए उपयोगी रखें।
9. यदि किसी तथ्य को लेकर निश्चित जानकारी उपलब्ध न हो तो गलत जानकारी न दें।
10. उत्तर तथ्यात्मक, स्पष्ट और परीक्षा उपयोगी रखें।

विद्यार्थी का प्रश्न:

${question}
`;

    // ==================================================
    // GEMINI
    // ==================================================

    const response = await askGemini(prompt);

    const answer = response?.text;

    console.log(
      "✅ AI Study Assistant उत्तर प्राप्त हुआ"
    );

    res.json({
      answer:
        answer ||
        "AI से उत्तर नहीं मिला।"
    });

  } catch (error) {

    console.error(
      "❌ GEMINI AI FINAL ERROR:"
    );

    console.error(error);

    const errorText =
      error?.message ||
      JSON.stringify(error);

    // ------------------------------
    // 503 Error
    // ------------------------------

    if (
      errorText.includes("503") ||
      errorText.includes("UNAVAILABLE") ||
      errorText.includes("high demand")
    ) {

      return res.status(503).json({
        error:
          "Gemini AI पर इस समय बहुत अधिक लोड है। कृपया कुछ सेकंड बाद फिर प्रयास करें।"
      });

    }

    // ------------------------------
    // API Key Error
    // ------------------------------

    if (
      errorText.includes("API key") ||
      errorText.includes("API_KEY") ||
      errorText.includes("authentication")
    ) {

      return res.status(500).json({
        error:
          "Gemini API Key में समस्या है। Render Environment में GEMINI_API_KEY जाँचें।"
      });

    }

    // ------------------------------
    // Other Error
    // ------------------------------

    res.status(500).json({
      error:
        "AI से उत्तर नहीं मिल सका। कृपया कुछ समय बाद पुनः प्रयास करें।"
    });

  }
});

// ==================================================
// MCQ GENERATOR
// ==================================================

app.post("/api/mcq", async (req, res) => {

  try {

    const {
      topic,
      count,
      exam
    } = req.body;

    // ------------------------------
    // Topic Check
    // ------------------------------

    if (!topic || !topic.trim()) {

      return res.status(400).json({
        error:
          "कृपया MCQ का Topic लिखिए।"
      });

    }

    // ------------------------------
    // API Key Check
    // ------------------------------

    if (!process.env.GEMINI_API_KEY) {

      return res.status(500).json({
        error:
          "Gemini API Key सेट नहीं है।"
      });

    }

    // ------------------------------
    // Question Count
    // ------------------------------

    const questionCount = Math.min(
      Math.max(
        Number(count) || 5,
        1
      ),
      20
    );

    const examName =
      exam || "सामान्य परीक्षा";

    console.log(
      `📝 MCQ Request: ${topic} | ${questionCount} | ${examName}`
    );

    // ==================================================
    // MCQ PROMPT
    // ==================================================

    const prompt = `
आप "Study With Power" के AI MCQ Generator हैं।

Topic:
${topic}

परीक्षा:
${examName}

प्रश्नों की संख्या:
${questionCount}

${examName} परीक्षा के स्तर के ${questionCount} बहुविकल्पीय प्रश्न बनाइए।

हर प्रश्न में:

1. प्रश्न
2. चार विकल्प A, B, C, D
3. सही उत्तर
4. छोटी और स्पष्ट व्याख्या

महत्वपूर्ण नियम:

- सभी प्रश्न हिंदी में हों।
- प्रश्न तथ्यात्मक और परीक्षा उपयोगी हों।
- एक ही प्रश्न को दोबारा न दोहराएं।
- सही उत्तर केवल A, B, C या D हो।
- गलत विकल्प भी विश्वसनीय लगने चाहिए।
- प्रश्न ${examName} परीक्षा के स्तर के अनुसार हों।
- प्रश्न आसान, मध्यम और कठिन स्तर के मिश्रण में हों।
- केवल JSON format में उत्तर दें।

JSON FORMAT:

{
  "questions": [
    {
      "question": "प्रश्न",
      "options": {
        "A": "विकल्प A",
        "B": "विकल्प B",
        "C": "विकल्प C",
        "D": "विकल्प D"
      },
      "answer": "A",
      "explanation": "सही उत्तर की छोटी व्याख्या"
    }
  ]
}

Topic:

${topic}
`;

    // ==================================================
    // GEMINI MCQ
    // ==================================================

    const response = await askGemini(
      prompt,
      {
        responseMimeType: "application/json",

        responseSchema: {

          type: "object",

          properties: {

            questions: {

              type: "array",

              items: {

                type: "object",

                properties: {

                  question: {
                    type: "string"
                  },

                  options: {

                    type: "object",

                    properties: {

                      A: {
                        type: "string"
                      },

                      B: {
                        type: "string"
                      },

                      C: {
                        type: "string"
                      },

                      D: {
                        type: "string"
                      }

                    },

                    required: [
                      "A",
                      "B",
                      "C",
                      "D"
                    ]
                  },

                  answer: {

                    type: "string",

                    enum: [
                      "A",
                      "B",
                      "C",
                      "D"
                    ]

                  },

                  explanation: {
                    type: "string"
                  }

                },

                required: [
                  "question",
                  "options",
                  "answer",
                  "explanation"
                ]

              }

            }

          },

          required: [
            "questions"
          ]

        }
      }
    );

    // ==================================================
    // RESPONSE TEXT
    // ==================================================

    const text =
      response?.text;

    if (!text) {

      return res.status(500).json({
        error:
          "Gemini ने MCQ उत्तर नहीं दिया।"
      });

    }

    // ==================================================
    // JSON PARSE
    // ==================================================

    let result;

    try {

      result = JSON.parse(text);

    } catch (jsonError) {

      console.error(
        "❌ MCQ JSON Parse Error:",
        jsonError
      );

      return res.status(500).json({
        error:
          "Gemini ने सही MCQ format नहीं भेजा। कृपया फिर प्रयास करें।"
      });

    }

    // ==================================================
    // FINAL MCQ RESPONSE
    // ==================================================

    console.log(
      `✅ ${result.questions?.length || 0} MCQ तैयार`
    );

    res.json({
      questions:
        result.questions || []
    });

  } catch (error) {

    console.error(
      "❌ MCQ FINAL ERROR:"
    );

    console.error(error);

    const errorText =
      error?.message ||
      JSON.stringify(error);

    // ------------------------------
    // 503
    // ------------------------------

    if (
      errorText.includes("503") ||
      errorText.includes("UNAVAILABLE") ||
      errorText.includes("high demand")
    ) {

      return res.status(503).json({
        error:
          "Gemini AI पर अभी बहुत अधिक लोड है। कृपया कुछ सेकंड बाद फिर प्रयास करें।"
      });

    }

    // ------------------------------
    // API Key
    // ------------------------------

    if (
      errorText.includes("API key") ||
      errorText.includes("API_KEY") ||
      errorText.includes("authentication")
    ) {

      return res.status(500).json({
        error:
          "Gemini API Key में समस्या है। Render Environment में GEMINI_API_KEY जाँचें।"
      });

    }

    // ------------------------------
    // General
    // ------------------------------

    res.status(500).json({
      error:
        "MCQ बनाने में समस्या हुई। कृपया कुछ समय बाद पुनः प्रयास करें।"
    });

  }
});

// ==================================================
// SPA FALLBACK
// ==================================================

app.get(/.*/, (req, res) => {

  res.sendFile(
    path.join(
      distPath,
      "index.html"
    )
  );

});

// ==================================================
// SERVER
// ==================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "=============================="
    );

    console.log(
      "✅ Study With Power AI Server"
    );

    console.log(
      `🌐 Server running on port ${PORT}`
    );

    console.log(
      "=============================="
    );

  }
);
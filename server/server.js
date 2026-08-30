const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

// ================= PORT =================

const PORT = process.env.PORT || 5000;

// ================= GEMINI API =================

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY नहीं मिली!");
} else {
  console.log("✅ Gemini API Key मिल गई");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ================= REACT FRONTEND =================

const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

// ================= HOME =================

app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ================= WAIT FUNCTION =================

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= GEMINI REQUEST =================

async function askGemini(prompt) {

  // पहले मुख्य model
  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash"
  ];

  let lastError = null;

  for (const model of models) {

    // हर model पर अधिकतम 2 प्रयास
    for (let attempt = 1; attempt <= 2; attempt++) {

      try {

        console.log(
          `🤖 Gemini Model: ${model} | Attempt: ${attempt}`
        );

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt
        });

        console.log(
          `✅ Gemini उत्तर मिला: ${model}`
        );

        return response.text;

      } catch (error) {

        lastError = error;

        const errorText =
          error?.message ||
          JSON.stringify(error);

        console.error(
          `❌ ${model} ERROR:`,
          errorText
        );

        // 503 / UNAVAILABLE / high demand
        const isTemporaryError =
          errorText.includes("503") ||
          errorText.includes("UNAVAILABLE") ||
          errorText.includes("high demand") ||
          errorText.includes("overloaded") ||
          errorText.includes("temporarily");

        if (isTemporaryError) {

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

          // API key / permission / bad request आदि
          // पर बार-बार retry नहीं करेंगे
          throw error;
        }
      }
    }
  }

  throw lastError;
}

// ================= AI ASSISTANT =================

app.post("/api/ask", async (req, res) => {

  try {

    const { question } = req.body;

    // ================= QUESTION CHECK =================

    if (!question || !question.trim()) {

      return res.status(400).json({
        error: "कृपया प्रश्न लिखिए।"
      });

    }

    // ================= API KEY CHECK =================

    if (!process.env.GEMINI_API_KEY) {

      return res.status(500).json({
        error: "Gemini API Key सेट नहीं है।"
      });

    }

    console.log("📩 प्रश्न:", question);

    // ================= PROMPT =================

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

    // ================= ASK GEMINI =================

    const answer = await askGemini(prompt);

    // ================= RESPONSE =================

    res.json({
      answer: answer || "AI से उत्तर नहीं मिला।"
    });

  } catch (error) {

    console.error("❌ GEMINI AI FINAL ERROR:");
    console.error(error);

    const errorText =
      error?.message ||
      JSON.stringify(error);

    // ================= USER FRIENDLY ERROR =================

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

    res.status(500).json({
      error:
        "AI से उत्तर नहीं मिल सका। कृपया कुछ समय बाद पुनः प्रयास करें।"
    });

  }
});

// ================= SPA FALLBACK =================

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ================= SERVER =================

app.listen(PORT, "0.0.0.0", () => {

  console.log("==============================");
  console.log("✅ Study With Power AI Server");
  console.log(`🌐 Server running on port ${PORT}`);
  console.log("==============================");

});
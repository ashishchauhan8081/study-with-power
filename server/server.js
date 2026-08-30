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

// API key check
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

// ================= AI ASSISTANT =================

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // प्रश्न check
    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "कृपया प्रश्न लिखिए।"
      });
    }

    // API key check
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

विद्यार्थी का प्रश्न:
${question}
`;

    // ================= GEMINI =================

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt
    });

    const answer = response.text;

    console.log("✅ Gemini AI उत्तर प्राप्त हुआ");

    res.json({
      answer: answer || "AI से उत्तर नहीं मिला।"
    });

  } catch (error) {

    console.error("❌ GEMINI AI ERROR:");
    console.error(error);

    res.status(500).json({
      error:
        "AI से उत्तर नहीं मिल सका। कृपया कुछ समय बाद पुनः प्रयास करें।"
    });
  }
});

// ================= SPA FALLBACK =================

// React के दूसरे pages के लिए
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
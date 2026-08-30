const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("Study With Power Free AI Server चालू है ✅");
});

// ================= AI ASSISTANT =================

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "कृपया प्रश्न लिखिए।"
      });
    }

    console.log("📩 प्रश्न:", question);

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

विद्यार्थी का प्रश्न:
${question}
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "gemma3",
          prompt: prompt,
          stream: false
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Ollama Server Error: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("✅ AI उत्तर प्राप्त हुआ");

    res.json({
      answer: data.response || "AI से उत्तर नहीं मिला।"
    });

  } catch (error) {
    console.error("❌ AI ERROR:", error.message);

    res.status(500).json({
      error:
        "Free AI Server से उत्तर नहीं मिल सका। कृपया Ollama चालू है या नहीं जाँचें।"
    });
  }
});

// ================= SERVER =================

app.listen(PORT, () => {
  console.log("==============================");
  console.log("✅ Study With Power Free AI Server");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("==============================");
});
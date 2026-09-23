import { GoogleGenAI } from "@google/genai";

// =====================================================
// GEMINI AI MCQ API
// =====================================================

export default async function handler(req, res) {
  // =====================================================
  // CORS
  // =====================================================

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,POST"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // =====================================================
  // OPTIONS
  // =====================================================

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =====================================================
  // ONLY POST
  // =====================================================

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Only POST method is allowed",
    });
  }

  try {
    // ===================================================
    // REQUEST DATA
    // ===================================================

    const body = req.body || {};

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim()
        : "";

    const exam =
      typeof body.exam === "string"
        ? body.exam.trim()
        : "सामान्य प्रतियोगी परीक्षा";

    let count = Number(body.count);

    if (!Number.isFinite(count)) {
      count = 5;
    }

    // Minimum 1 / Maximum 50
    count = Math.min(
      Math.max(Math.floor(count), 1),
      50
    );

    const language =
      typeof body.language === "string"
        ? body.language.trim()
        : "Hindi";

    const difficulty =
      typeof body.difficulty === "string"
        ? body.difficulty.trim()
        : "Medium";

    // ===================================================
    // TOPIC VALIDATION
    // ===================================================

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "कृपया MCQ का विषय लिखें।",
      });
    }

    // ===================================================
    // GEMINI API KEY
    // ===================================================

    const apiKey =
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY नहीं मिली"
      );

      return res.status(500).json({
        success: false,
        error:
          "GEMINI_API_KEY Vercel Environment Variables में नहीं मिली।",
      });
    }

    // ===================================================
    // GEMINI CLIENT
    // ===================================================

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    // ===================================================
    // PROMPT
    // ===================================================

    const languageInstruction =
      language.toLowerCase() === "english"
        ? "सभी प्रश्न, विकल्प और explanation English भाषा में होने चाहिए।"
        : "सभी प्रश्न, विकल्प और explanation हिंदी भाषा में होने चाहिए।";

    const prompt = `
आप "Exam Test" के AI MCQ Generator हैं।

परीक्षा का नाम:
${exam}

विषय:
${topic}

प्रश्नों की संख्या:
${count}

भाषा:
${language}

कठिनाई स्तर:
${difficulty}

आपको प्रतियोगी परीक्षाओं के लिए उच्च गुणवत्ता वाले MCQ तैयार करने हैं।

नियम:

1. ${languageInstruction}
2. प्रश्न प्रतियोगी परीक्षा स्तर के होने चाहिए।
3. प्रत्येक प्रश्न के ठीक 4 विकल्प होने चाहिए।
4. विकल्प A, B, C और D में हों।
5. केवल एक सही उत्तर होना चाहिए।
6. सही उत्तर केवल A, B, C या D में से एक होना चाहिए।
7. प्रत्येक प्रश्न का explanation देना है।
8. प्रश्न repeat नहीं होने चाहिए।
9. गलत या अस्पष्ट जानकारी न दें।
10. प्रश्न ${exam} परीक्षा के स्तर के अनुसार बनाएँ।
11. Difficulty level ${difficulty} के अनुसार रखें।
12. आउटपुट केवल valid JSON में दें।
13. JSON के बाहर कोई text न दें।
14. Markdown code block का उपयोग न करें।

JSON का exact format:

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
      "explanation": "सही उत्तर का विस्तृत explanation"
    }
  ]
}
`;

    // ===================================================
    // GEMINI REQUEST
    // ===================================================

    const result =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      });

    // ===================================================
    // GET RESPONSE TEXT
    // ===================================================

    let text = "";

    if (typeof result.text === "string") {
      text = result.text;
    } else if (
      result.response &&
      typeof result.response.text === "function"
    ) {
      text = result.response.text();
    }

    text = String(text || "").trim();

    // ===================================================
    // EMPTY RESPONSE
    // ===================================================

    if (!text) {
      return res.status(500).json({
        success: false,
        error:
          "Gemini ने कोई response नहीं दिया।",
      });
    }

    // ===================================================
    // REMOVE MARKDOWN IF ANY
    // =====================================================

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // ===================================================
    // PARSE JSON
    // ===================================================

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (jsonError) {
      console.error(
        "Gemini JSON Parse Error:",
        jsonError
      );

      console.error(
        "Gemini Raw Response:",
        text
      );

      return res.status(500).json({
        success: false,
        error:
          "Gemini ने सही JSON format में MCQ नहीं भेजा।",
      });
    }

    // ===================================================
    // CHECK QUESTIONS
    // ===================================================

    if (
      !parsed ||
      !Array.isArray(parsed.questions)
    ) {
      return res.status(500).json({
        success: false,
        error:
          "Gemini response में questions नहीं मिले।",
      });
    }

    // ===================================================
    // NORMALIZE QUESTIONS
    // =====================================================

    const questions = parsed.questions
      .slice(0, count)
      .map((item) => {
        const answer =
          String(item?.answer || "")
            .trim()
            .toUpperCase();

        return {
          question:
            String(
              item?.question || ""
            ).trim(),

          options: {
            A: String(
              item?.options?.A || ""
            ).trim(),

            B: String(
              item?.options?.B || ""
            ).trim(),

            C: String(
              item?.options?.C || ""
            ).trim(),

            D: String(
              item?.options?.D || ""
            ).trim(),
          },

          answer:
            ["A", "B", "C", "D"].includes(
              answer
            )
              ? answer
              : "A",

          explanation:
            String(
              item?.explanation || ""
            ).trim(),
        };
      })
      .filter(
        (item) =>
          item.question &&
          item.options.A &&
          item.options.B &&
          item.options.C &&
          item.options.D
      );

    // ===================================================
    // NO VALID QUESTIONS
    // =====================================================

    if (!questions.length) {
      return res.status(500).json({
        success: false,
        error:
          "Gemini ने valid MCQ नहीं बनाया।",
      });
    }

    // ===================================================
    // SUCCESS
    // =====================================================

    console.log(
      `Gemini ने ${questions.length} MCQ बनाए।`
    );

    return res.status(200).json({
      success: true,
      exam: exam,
      topic: topic,
      count: questions.length,
      questions: questions,
    });

  } catch (error) {
    // ===================================================
    // ERROR
    // ===================================================

    console.error(
      "Gemini API Error:",
      error
    );

    const message =
      error?.message ||
      String(error) ||
      "Unknown error";

    // ===================================================
    // API KEY ERROR
    // ===================================================

    if (
      message.includes("API key") ||
      message.includes("API_KEY") ||
      message.includes("401") ||
      message.includes("authentication")
    ) {
      return res.status(500).json({
        success: false,
        error:
          "Gemini API Key में समस्या है। Vercel में GEMINI_API_KEY जांचें।",
      });
    }

    // ===================================================
    // RATE LIMIT
    // ===================================================

    if (
      message.includes("429") ||
      message.includes(
        "RESOURCE_EXHAUSTED"
      )
    ) {
      return res.status(429).json({
        success: false,
        error:
          "Gemini API की request limit पूरी हो गई है। थोड़ी देर बाद दोबारा प्रयास करें।",
      });
    }

    // ===================================================
    // GENERAL ERROR
    // ===================================================

    return res.status(500).json({
      success: false,
      error:
        "Gemini AI से MCQ बनाने में समस्या हुई।",
      details: message,
    });
  }
}

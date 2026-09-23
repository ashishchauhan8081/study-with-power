export default async function handler(req, res) {
  // ============================================
  // CORS
  // ============================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ============================================
  // ONLY POST
  // ============================================

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Only POST method is allowed",
    });
  }

  try {
    // ============================================
    // API KEY
    // ============================================

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "GEMINI_API_KEY Vercel Environment Variables में नहीं मिली।",
      });
    }

    // ============================================
    // REQUEST DATA
    // ============================================

    const {
      topic,
      exam = "UPPCS",
      count = 5,
      language = "Hindi",
      difficulty = "Medium",
    } = req.body || {};

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({
        success: false,
        error: "कृपया Topic डालें।",
      });
    }

    const questionCount = Math.min(
      Math.max(Number(count) || 5, 1),
      50
    );

    // ============================================
    // PROMPT
    // ============================================

    const prompt = `
आप एक उच्च गुणवत्ता वाले प्रतियोगी परीक्षा MCQ Generator हैं।

परीक्षा: ${exam}

विषय: ${topic}

प्रश्नों की संख्या: ${questionCount}

भाषा: ${language}

कठिनाई स्तर: ${difficulty}

${language === "Hindi"
  ? "सभी प्रश्न, विकल्प और explanations हिंदी भाषा में दें।"
  : "All questions, options and explanations must be in English."
}

नियम:

1. कुल ${questionCount} MCQ बनाएं।
2. प्रत्येक प्रश्न के ठीक 4 विकल्प हों।
3. विकल्प A, B, C और D हों।
4. केवल एक सही उत्तर हो।
5. सही उत्तर A/B/C/D में से एक हो।
6. प्रश्न repeat नहीं होने चाहिए।
7. प्रश्न ${exam} परीक्षा के स्तर के अनुसार हों।
8. कठिनाई ${difficulty} के अनुसार रखें।
9. प्रत्येक प्रश्न के साथ explanation दें।
10. तथ्यात्मक और स्पष्ट प्रश्न बनाएं।
11. केवल JSON return करें।
12. JSON के बाहर कोई text न दें।
13. Markdown code block का उपयोग न करें।

Exact JSON format:

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
      "explanation": "सही उत्तर का explanation"
    }
  ]
}
`;

    // ============================================
    // GEMINI REST API
    // ============================================

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const geminiResponse = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0.4,
          responseMimeType:
            "application/json",
        },
      }),
    });

    // ============================================
    // GEMINI RESPONSE
    // ============================================

    const geminiData =
      await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error(
        "Gemini API Error:",
        geminiData
      );

      const apiError =
        geminiData?.error?.message ||
        "Gemini API request failed.";

      return res.status(
        geminiResponse.status || 500
      ).json({
        success: false,
        error: apiError,
      });
    }

    // ============================================
    // GET TEXT
    // ============================================

    const text =
      geminiData?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (!text) {
      console.error(
        "Gemini Empty Response:",
        geminiData
      );

      return res.status(500).json({
        success: false,
        error:
          "Gemini ने कोई MCQ response नहीं दिया।",
      });
    }

    // ============================================
    // CLEAN JSON
    // ============================================

    let cleanText = String(text).trim();

    cleanText = cleanText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    // ============================================
    // PARSE JSON
    // ============================================

    let parsed;

    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error(
        "JSON Parse Error:",
        parseError
      );

      console.error(
        "Gemini Text:",
        cleanText
      );

      return res.status(500).json({
        success: false,
        error:
          "Gemini ने valid JSON नहीं भेजा।",
      });
    }

    // ============================================
    // QUESTIONS CHECK
    // ============================================

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

    // ============================================
    // NORMALIZE QUESTIONS
    // ============================================

    const questions =
      parsed.questions
        .slice(0, questionCount)
        .map((item) => {
          const answer =
            String(
              item?.answer || ""
            )
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

    // ============================================
    // VALIDATION
    // ============================================

    if (!questions.length) {
      return res.status(500).json({
        success: false,
        error:
          "Gemini से valid MCQ प्राप्त नहीं हुए।",
      });
    }

    // ============================================
    // SUCCESS
    // ============================================

    return res.status(200).json({
      success: true,
      exam,
      topic,
      count: questions.length,
      questions,
    });

  } catch (error) {
    console.error(
      "MCQ API ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Server में MCQ generate करने में समस्या हुई।",
    });
  }
}

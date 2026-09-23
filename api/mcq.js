export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,POST"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Only POST method is allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is not configured in Vercel.",
      });
    }

    const {
      topic = "General Knowledge",
      exam = "Competitive Exam",
      count = 10,
      language = "Hindi",
      difficulty = "Medium",
    } = req.body || {};

    const questionCount = Math.min(
      Math.max(Number(count) || 10, 1),
      50
    );

    const prompt = `
आप एक Competitive Exam MCQ Generator हैं।

Exam: ${exam}
Topic: ${topic}
Language: ${language}
Difficulty: ${difficulty}
Questions: ${questionCount}

${language === "Hindi"
  ? "सभी प्रश्न और explanations हिंदी में दें।"
  : "Generate all questions and explanations in English."}

हर प्रश्न में 4 options होने चाहिए।

केवल valid JSON में उत्तर दें।

JSON format:

{
  "questions": [
    {
      "question": "प्रश्न",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A",
      "explanation": "उत्तर का संक्षिप्त स्पष्टीकरण",
      "subject": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

महत्वपूर्ण:
- Exactly ${questionCount} questions दें।
- हर question के exactly 4 options हों।
- answer में सही option का पूरा text दें।
- कोई Markdown या code fence न दें।
- केवल JSON दें।
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          "Gemini API request failed.",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "Gemini ने कोई response नहीं दिया।",
      });
    }

    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Gemini Text:", text);

      return res.status(500).json({
        success: false,
        message: "Gemini response valid JSON नहीं है।",
      });
    }

    if (
      !result.questions ||
      !Array.isArray(result.questions)
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid MCQ format received.",
      });
    }

    return res.status(200).json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Internal server error.",
    });
  }
}

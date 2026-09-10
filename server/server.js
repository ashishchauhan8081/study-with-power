const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");

// ==================================================
// ENVIRONMENT
// ==================================================

dotenv.config({
  path: path.join(__dirname, ".env"),
});

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const { GoogleGenAI } = require("@google/genai");

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json());

// ==================================================
// PORT
// ==================================================

const PORT = process.env.PORT || 5000;

// ==================================================
// GEMINI API KEY
// ==================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY?.trim();

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY नहीं मिली!");
} else {
  console.log("✅ Gemini API Key मिल गई");
}

// ==================================================
// GEMINI AI
// ==================================================

let ai = null;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  });
}

// ==================================================
// RAZORPAY
// ==================================================

const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID?.trim();

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET?.trim();

let razorpay = null;

if (
  RAZORPAY_KEY_ID &&
  RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay API Keys मिल गईं");
} else {
  console.error("❌ Razorpay API Keys नहीं मिलीं!");
  console.error(
    "RAZORPAY_KEY_ID और RAZORPAY_KEY_SECRET .env में डालें।"
  );
}

// ==================================================
// REACT DIST
// ==================================================

const distPath = path.join(
  __dirname,
  "..",
  "dist"
);

app.use(
  express.static(distPath)
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Study With Power Server चल रहा है",
  });
});

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      distPath,
      "index.html"
    )
  );
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
// GEMINI REQUEST
// ==================================================

async function askGemini(
  prompt,
  config = {}
) {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY सेट नहीं है।"
    );
  }

  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
  ];

  let lastError = null;

  for (const model of models) {
    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {
      try {
        console.log(
          `🤖 Gemini Model: ${model} | Attempt: ${attempt}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
            config,
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

app.post(
  "/api/ask",
  async (req, res) => {
    try {
      const question =
        req.body?.question;

      if (
        !question ||
        !question.trim()
      ) {
        return res.status(400).json({
          error:
            "कृपया अपना प्रश्न लिखिए।",
        });
      }

      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API Key सेट नहीं है।",
        });
      }

      console.log(
        "📩 AI प्रश्न:",
        question
      );

      const prompt = `
आप "Study With Power" के AI Study Assistant हैं।

विद्यार्थी के प्रश्न का उत्तर सरल,
स्पष्ट और परीक्षा उपयोगी हिंदी में दें।

उत्तर इस format में दें:

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
3. Headings इसी तरह रखें।
4. Bullet points के लिए केवल • का प्रयोग करें।
5. अनावश्यक लंबा उत्तर न दें।
6. इतिहास, भूगोल, राजनीति, विज्ञान और अर्थव्यवस्था में परीक्षा उपयोगी तथ्य दें।
7. Typing mistake हो तो सही अर्थ समझें।
8. प्रतियोगी परीक्षाओं के लिए उपयोगी उत्तर दें।
9. गलत जानकारी न दें।
10. तथ्यात्मक और स्पष्ट उत्तर दें।

विद्यार्थी का प्रश्न:

${question}
`;

      const response =
        await askGemini(prompt);

      const answer =
        response?.text;

      return res.json({
        answer:
          answer ||
          "AI से उत्तर नहीं मिला।",
      });
    } catch (error) {
      console.error(
        "❌ GEMINI AI ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "AI से उत्तर नहीं मिल सका। कृपया कुछ समय बाद फिर प्रयास करें।",
      });
    }
  }
);

// ==================================================
// MCQ GENERATOR
// ==================================================

app.post(
  "/api/mcq",
  async (req, res) => {
    try {
      const {
        topic,
        count,
        exam,
      } = req.body;

      if (
        !topic ||
        !topic.trim()
      ) {
        return res.status(400).json({
          error:
            "कृपया MCQ का Topic लिखिए।",
        });
      }

      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API Key सेट नहीं है।",
        });
      }

      const questionCount =
        Math.min(
          Math.max(
            Number(count) || 5,
            1
          ),
          20
        );

      const examName =
        exam ||
        "सामान्य परीक्षा";

      console.log(
        `📝 MCQ Request: ${topic} | ${questionCount} | ${examName}`
      );

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

नियम:

- सभी प्रश्न हिंदी में हों।
- प्रश्न तथ्यात्मक और परीक्षा उपयोगी हों।
- एक ही प्रश्न दोबारा न दें।
- सही उत्तर केवल A, B, C या D हो।
- गलत विकल्प भी विश्वसनीय लगें।
- परीक्षा के स्तर के अनुसार प्रश्न बनाएं।
- आसान, मध्यम और कठिन प्रश्नों का मिश्रण रखें।
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
`;

      const response =
        await askGemini(
          prompt,
          {
            responseMimeType:
              "application/json",
          }
        );

      const text =
        response?.text;

      if (!text) {
        return res.status(500).json({
          error:
            "Gemini ने MCQ उत्तर नहीं दिया।",
        });
      }

      let result;

      try {
        result =
          JSON.parse(text);
      } catch (error) {
        console.error(
          "❌ MCQ JSON Parse Error:",
          error
        );

        return res.status(500).json({
          error:
            "Gemini ने सही MCQ format नहीं भेजा।",
        });
      }

      return res.json({
        questions:
          result.questions || [],
      });
    } catch (error) {
      console.error(
        "❌ MCQ ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "MCQ बनाने में समस्या हुई। कृपया फिर प्रयास करें।",
      });
    }
  }
);

// ==================================================
// DAILY CURRENT AFFAIRS
// ==================================================

app.post(
  "/api/current-affairs",
  async (req, res) => {
    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            "Gemini API Key सेट नहीं है।",
        });
      }

      const requestedCount =
        Number(
          req.body?.count
        ) || 10;

      const questionCount =
        Math.min(
          Math.max(
            requestedCount,
            5
          ),
          20
        );

      const today =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        ).format(
          new Date()
        );

      console.log(
        `📰 Current Affairs: ${today}`
      );

      const prompt = `
आप "Study With Power" के Daily Current Affairs Quiz Generator हैं।

आज की तारीख (IST):
${today}

${questionCount} Current Affairs MCQ तैयार करें।

मुख्य लक्ष्य:

• UPPCS
• UPPSC
• SSC
• Banking
• अन्य प्रतियोगी परीक्षाएँ

भारत और उत्तर प्रदेश को प्राथमिकता दें।

विषय:

• राष्ट्रीय घटनाएँ
• अंतरराष्ट्रीय घटनाएँ
• अर्थव्यवस्था
• विज्ञान एवं तकनीक
• सरकारी योजनाएँ
• नियुक्तियाँ
• पुरस्कार
• खेल
• रक्षा
• महत्वपूर्ण घटनाएँ

केवल वास्तविक और विश्वसनीय जानकारी दें।

प्रश्न हिंदी में हों।

हर प्रश्न में:

1. प्रश्न
2. चार विकल्प A, B, C, D
3. सही उत्तर
4. छोटी तथ्यात्मक व्याख्या

केवल JSON format में उत्तर दें।

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
      "explanation": "व्याख्या"
    }
  ]
}
`;

      const response =
        await askGemini(
          prompt,
          {
            responseMimeType:
              "application/json",
          }
        );

      const text =
        response?.text;

      if (!text) {
        return res.status(500).json({
          error:
            "Current Affairs Quiz नहीं मिला।",
        });
      }

      let result;

      try {
        result =
          JSON.parse(text);
      } catch (error) {
        console.error(
          "❌ Current Affairs JSON Error:",
          error
        );

        return res.status(500).json({
          error:
            "Current Affairs का सही format नहीं मिला।",
        });
      }

      return res.json({
        date: today,
        questions:
          result.questions || [],
      });
    } catch (error) {
      console.error(
        "❌ CURRENT AFFAIRS ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Daily Current Affairs Quiz बनाने में समस्या हुई।",
      });
    }
  }
);

// ==================================================
// RAZORPAY - PUBLIC KEY
// ==================================================

app.get(
  "/api/payment/key",
  (req, res) => {
    if (!RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        error:
          "Razorpay Key ID सेट नहीं है।",
      });
    }

    return res.json({
      success: true,
      key_id:
        RAZORPAY_KEY_ID,
    });
  }
);

// ==================================================
// RAZORPAY - CREATE ORDER
// ==================================================

app.post(
  "/api/payment/order",
  async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          success: false,
          error:
            "Razorpay सेट नहीं है। RAZORPAY_KEY_ID और RAZORPAY_KEY_SECRET जाँचें।",
        });
      }

      const amount =
        Number(
          req.body?.amount
        );

      const product =
        String(
          req.body?.product ||
            "Study With Power Combo"
        ).slice(0, 200);

      const receipt =
        String(
          req.body?.receipt ||
            `swp_${Date.now()}`
        ).slice(0, 40);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            "सही payment amount भेजिए।",
        });
      }

      const amountInPaise =
        Math.round(
          amount * 100
        );

      console.log(
        `💳 Razorpay Order Request: ₹${amount}`
      );

      const order =
        await razorpay.orders.create({
          amount:
            amountInPaise,
          currency:
            "INR",
          receipt,
          notes: {
            product,
          },
        });

      console.log(
        `✅ Razorpay Order Created: ${order.id}`
      );

      return res.json({
        success: true,
        order_id:
          order.id,
        amount:
          order.amount,
        currency:
          order.currency,
        key_id:
          RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(
        "❌ RAZORPAY ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.error?.description ||
          error?.message ||
          "Razorpay order बनाने में समस्या हुई।",
      });
    }
  }
);

// ==================================================
// RAZORPAY - VERIFY PAYMENT
// ==================================================

app.post(
  "/api/payment/verify",
  async (req, res) => {
    try {
      if (!RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          error:
            "Razorpay Key Secret सेट नहीं है।",
        });
      }

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body || {};

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Payment verification के लिए जरूरी details नहीं मिलीं।",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      const received =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );

      const generated =
        Buffer.from(
          generatedSignature,
          "utf8"
        );

      const valid =
        received.length ===
          generated.length &&
        crypto.timingSafeEqual(
          received,
          generated
        );

      if (!valid) {
        console.error(
          "❌ Razorpay Signature Invalid"
        );

        return res.status(400).json({
          success: false,
          error:
            "Payment verification failed.",
        });
      }

      console.log(
        `✅ Razorpay Payment Verified: ${razorpay_payment_id}`
      );

      return res.json({
        success: true,
        payment_id:
          razorpay_payment_id,
        order_id:
          razorpay_order_id,
        message:
          "Payment सफलतापूर्वक verify हो गया।",
      });
    } catch (error) {
      console.error(
        "❌ RAZORPAY VERIFY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Payment verification में समस्या हुई।",
      });
    }
  }
);

// ==================================================
// SPA FALLBACK
// ==================================================

app.get(
  /.*/,
  (req, res) => {
    res.sendFile(
      path.join(
        distPath,
        "index.html"
      )
    );
  }
);

// ==================================================
// SERVER START
// ==================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "=================================="
    );

    console.log(
      "🚀 Study With Power Server"
    );

    console.log(
      `🌐 Server running on port ${PORT}`
    );

    console.log(
      `💳 Razorpay: ${
        razorpay
          ? "READY"
          : "NOT CONFIGURED"
      }`
    );

    console.log(
      `🤖 Gemini: ${
        ai
          ? "READY"
          : "NOT CONFIGURED"
      }`
    );

    console.log(
      "=================================="
    );
  }
);
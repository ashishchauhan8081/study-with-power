const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://study-with-power.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        origin.endsWith(".vercel.app") &&
        origin.includes("study-with-power")
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

/* =========================
   FIREBASE ADMIN
========================= */

let firebaseInitialized = false;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    );
  }

  if (!serviceAccount) {
    const serviceAccountPath = path.join(
      __dirname,
      "firebase-service-account.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    }
  }

  if (!serviceAccount) {
    throw new Error(
      "Firebase service account not found"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),

    databaseURL:
      process.env.FIREBASE_DATABASE_URL ||
      "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
  });

  firebaseInitialized = true;

  console.log("✅ Firebase Admin connected");
} catch (error) {
  console.error("❌ Firebase initialization failed");
  console.error(error.message);
}

/* =========================
   RAZORPAY
========================= */

let razorpay = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay connected");
} else {
  console.log("⚠️ Razorpay keys missing");
}

/* =========================
   WHATSAPP CLOUD API
========================= */

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN?.trim();

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

const WHATSAPP_API_VERSION =
  process.env.WHATSAPP_API_VERSION?.trim() || "v23.0";

const WHATSAPP_OTP_TEMPLATE_NAME =
  process.env.WHATSAPP_OTP_TEMPLATE_NAME?.trim() ||
  "login_otp";

const WHATSAPP_TEMPLATE_LANGUAGE =
  process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() ||
  "en_US";

const ADMIN_EMAIL =
  (
    process.env.ADMIN_EMAIL?.trim() ||
    "cciashish@gmail.com"
  ).toLowerCase();

const whatsappConfigured =
  !!(
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_PHONE_NUMBER_ID &&
    WHATSAPP_OTP_TEMPLATE_NAME
  );

if (whatsappConfigured) {
  console.log("✅ WhatsApp Cloud API credentials found");
} else {
  console.log("⚠️ WhatsApp Cloud API is not configured");
}

/* =========================
   SEND WHATSAPP OTP
========================= */

async function sendWhatsAppOtp(phone, otp) {
  if (!whatsappConfigured) {
    throw new Error(
      "WhatsApp Cloud API configured नहीं है। .env में WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID और WHATSAPP_OTP_TEMPLATE_NAME डालें।"
    );
  }

  const to = String(phone || "").replace(/\D/g, "");

  if (!/^91[6-9]\d{9}$/.test(to)) {
    throw new Error("Invalid Indian WhatsApp number");
  }

  const url =
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/` +
    `${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",

    template: {
      name: WHATSAPP_OTP_TEMPLATE_NAME,

      language: {
        code: WHATSAPP_TEMPLATE_LANGUAGE,
      },

      components: [
        {
          type: "body",

          parameters: [
            {
              type: "text",
              text: String(otp),
            },
          ],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",

    headers: {
      Authorization:
        `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      JSON.stringify(data);

    throw new Error(
      `WhatsApp API error (${response.status}): ${detail}`
    );
  }

  return data;
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,

    message:
      "Study With Power Server is Online 🚀",

    firebase:
      firebaseInitialized,

    razorpay:
      !!razorpay,

    whatsappCloudApi:
      whatsappConfigured,
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,

    server: "online",

    firebase:
      firebaseInitialized,

    razorpay:
      !!razorpay,

    whatsappCloudApi:
      whatsappConfigured,
  });
});

/* =========================
   ADMIN GENERATE + SEND OTP
========================= */

app.post(
  "/api/auth/admin-generate-whatsapp-otp",
  async (req, res) => {
    try {
      if (!firebaseInitialized) {
        return res.status(500).json({
          success: false,
          message:
            "Firebase Admin is not configured",
        });
      }

      if (!whatsappConfigured) {
        return res.status(500).json({
          success: false,

          message:
            "WhatsApp Cloud API configured नहीं है। पहले .env में WhatsApp credentials डालें।",
        });
      }

      /* =========================
         ADMIN TOKEN
      ========================= */

      const authHeader =
        String(
          req.headers.authorization || ""
        );

      if (
        !authHeader.startsWith("Bearer ")
      ) {
        return res.status(401).json({
          success: false,

          message:
            "Admin authentication required",
        });
      }

      const idToken =
        authHeader
          .slice(7)
          .trim();

      let decoded;

      try {
        decoded =
          await admin
            .auth()
            .verifyIdToken(idToken);
      } catch (authError) {
        console.error(
          "Admin token verification failed:",
          authError.message
        );

        return res.status(401).json({
          success: false,

          message:
            "Invalid or expired admin session",
        });
      }

      const email =
        String(
          decoded.email || ""
        ).toLowerCase();

      if (
        !decoded.email_verified ||
        email !== ADMIN_EMAIL
      ) {
        return res.status(403).json({
          success: false,

          message:
            "Admin access denied",
        });
      }

      /* =========================
         REQUEST ID
      ========================= */

      const { requestId } =
        req.body || {};

      if (!requestId) {
        return res.status(400).json({
          success: false,

          message:
            "Request ID required",
        });
      }

      const db =
        admin.database();

      const requestRef =
        db.ref(
          `loginRequests/${requestId}`
        );

      const snapshot =
        await requestRef.get();

      if (!snapshot.exists()) {
        return res.status(404).json({
          success: false,

          message:
            "Login request not found",
        });
      }

      const request =
        snapshot.val() || {};

      /* =========================
         CHECK VERIFIED
      ========================= */

      if (
        request.status ===
        "verified"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "यह Login पहले ही verify हो चुका है।",
        });
      }

      /* =========================
         CHECK EXPIRY
      ========================= */

      if (
        Number(
          request.expiresAt || 0
        ) < Date.now()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "यह Login Request expire हो चुकी है। User से नया Login Request भेजें।",
        });
      }

      /* =========================
         GENERATE SECURE OTP
      ========================= */

      const otpCode =
        String(
          crypto.randomInt(
            100000,
            1000000
          )
        );

      const now =
        Date.now();

      const expiresAt =
        now +
        5 * 60 * 1000;

      /* =========================
         SEND WHATSAPP FIRST
      ========================= */

      await sendWhatsAppOtp(
        request.phone,
        otpCode
      );

      /* =========================
         SAVE OTP
      ========================= */

      await requestRef.update({
        otp:
          otpCode,

        status:
          "otp_generated",

        generatedAt:
          now,

        expiresAt:
          expiresAt,

        generatedBy:
          email,

        whatsappSent:
          true,

        whatsappSentAt:
          now,
      });

      console.log(
        `✅ WhatsApp OTP sent to ${request.phone} for request ${requestId}`
      );

      return res.json({
        success: true,

        requestId,

        expiresAt,

        phone:
          request.phone,

        message:
          "OTP WhatsApp पर successfully भेज दिया गया।",
      });
    } catch (error) {
      console.error(
        "❌ Admin WhatsApp OTP error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "WhatsApp OTP भेजने में समस्या हुई।",
      });
    }
  }
);

/* =========================
   CREATE LOGIN REQUEST
========================= */

app.post(
  "/api/auth/send-whatsapp-otp",
  async (req, res) => {
    try {
      if (!firebaseInitialized) {
        return res.status(500).json({
          success: false,

          message:
            "Firebase Admin is not configured",
        });
      }

      const { phone } =
        req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,

          message:
            "Phone number required",
        });
      }

      const normalized =
        String(phone).replace(
          /\D/g,
          ""
        );

      if (
        !/^91[6-9]\d{9}$/.test(
          normalized
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid Indian mobile number",
        });
      }

      const requestId =
        `${Date.now()}_` +
        Math.random()
          .toString(36)
          .substring(2, 10);

      const db =
        admin.database();

      await db
        .ref(
          `loginRequests/${requestId}`
        )
        .set({
          id:
            requestId,

          phone:
            normalized,

          status:
            "pending",

          otp:
            "",

          createdAt:
            Date.now(),

          expiresAt:
            Date.now() +
            5 * 60 * 1000,
        });

      return res.json({
        success: true,

        requestId:
          requestId,

        message:
          "Login request created. Admin will generate OTP.",
      });
    } catch (error) {
      console.error(
        "OTP request error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Login request failed",
      });
    }
  }
);

/* =========================
   VERIFY WHATSAPP OTP
========================= */

app.post(
  "/api/auth/verify-whatsapp-otp",
  async (req, res) => {
    try {
      if (!firebaseInitialized) {
        return res.status(500).json({
          success: false,

          message:
            "Firebase Admin is not configured",
        });
      }

      const {
        requestId,
        otp,
      } = req.body;

      if (
        !requestId ||
        !otp
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Request ID and OTP required",
        });
      }

      const db =
        admin.database();

      const snapshot =
        await db
          .ref(
            `loginRequests/${requestId}`
          )
          .get();

      if (!snapshot.exists()) {
        return res.status(404).json({
          success: false,

          message:
            "Login request not found",
        });
      }

      const data =
        snapshot.val();

      /* =========================
         EXPIRY CHECK
      ========================= */

      if (
        Date.now() >
        Number(
          data.expiresAt || 0
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "OTP expired",
        });
      }

      /* =========================
         OTP CHECK
      ========================= */

      if (
        String(data.otp) !==
        String(otp)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid OTP",
        });
      }

      /* =========================
         VERIFIED
      ========================= */

      await db
        .ref(
          `loginRequests/${requestId}`
        )
        .update({
          status:
            "verified",

          verifiedAt:
            Date.now(),

          otp:
            "",
        });

      return res.json({
        success: true,

        phone:
          data.phone,

        message:
          "OTP verified successfully",
      });
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "OTP verification failed",
      });
    }
  }
);

/* =========================
   RAZORPAY CREATE ORDER
========================= */

app.post(
  "/api/payment/create-order",
  async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          success: false,

          message:
            "Razorpay is not configured",
        });
      }

      const {
        amount,
        currency = "INR",
        receipt,
      } = req.body;

      const numericAmount =
        Number(amount);

      if (
        !numericAmount ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Valid amount required",
        });
      }

      const options = {
        amount:
          Math.round(
            numericAmount *
              100
          ),

        currency:
          currency,

        receipt:
          receipt ||
          `swp_${Date.now()}`,
      };

      const order =
        await razorpay.orders.create(
          options
        );

      return res.json({
        success: true,

        order:
          order,
      });
    } catch (error) {
      console.error(
        "Razorpay order error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to create payment order",
      });
    }
  }
);

/* =========================
   RAZORPAY VERIFY
========================= */

app.post(
  "/api/payment/verify",
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment verification data missing",
        });
      }

      if (
        !process.env
          .RAZORPAY_KEY_SECRET
      ) {
        return res.status(500).json({
          success: false,

          message:
            "Razorpay secret not configured",
        });
      }

      const body =
        razorpay_order_id +
        "|" +
        razorpay_payment_id;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(body)
          .digest("hex");

      const verified =
        expectedSignature ===
        razorpay_signature;

      if (!verified) {
        return res.status(400).json({
          success: false,

          verified: false,

          message:
            "Invalid payment signature",
        });
      }

      return res.json({
        success: true,

        verified: true,

        message:
          "Payment verified successfully",
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      return res.status(500).json({
        success: false,

        verified: false,

        message:
          "Payment verification failed",
      });
    }
  }
);

/* =========================
   WHATSAPP WEBHOOK
========================= */

app.get(
  "/webhook/whatsapp",
  (req, res) => {
    const mode =
      req.query["hub.mode"];

    const token =
      req.query[
        "hub.verify_token"
      ];

    const challenge =
      req.query[
        "hub.challenge"
      ];

    if (
      mode === "subscribe" &&
      token &&
      token ===
        process.env
          .WHATSAPP_VERIFY_TOKEN
    ) {
      return res
        .status(200)
        .send(challenge);
    }

    return res.sendStatus(403);
  }
);

app.post(
  "/webhook/whatsapp",
  (req, res) => {
    console.log(
      "WhatsApp webhook received"
    );

    console.log(
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    return res.sendStatus(200);
  }
);

/* =========================
   ERROR HANDLER
========================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "Server error:",
      err
    );

    if (
      err.message &&
      err.message.startsWith(
        "CORS"
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "CORS blocked this request",
      });
    }

    res.status(500).json({
      success: false,

      message:
        "Internal server error",
    });
  }
);

/* =========================
   START SERVER
========================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");

    console.log(
      "🚀 Study With Power Server Started"
    );

    console.log(
      `🌐 Port: ${PORT}`
    );

    console.log(
      "📱 OTP Login: Enabled"
    );

    console.log(
      "💳 Razorpay: " +
        (razorpay
          ? "Enabled"
          : "Disabled")
    );

    console.log(
      "📱 WhatsApp Cloud API: " +
        (whatsappConfigured
          ? "Enabled"
          : "NOT CONFIGURED")
    );

    console.log(
      "📡 Webhook: /webhook/whatsapp"
    );

    console.log("");
  }
);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const {
  initializeApp,
  cert,
  getApps,
} = require("firebase-admin/app");

const {
  getDatabase,
} = require("firebase-admin/database");

// ======================================================
// APP
// ======================================================

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json()
);

// ======================================================
// FIREBASE ADMIN
// ======================================================

if (!getApps().length) {
  if (
    !process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_JSON missing"
    );
  } else {
    const serviceAccount =
      JSON.parse(
        process.env
          .FIREBASE_SERVICE_ACCOUNT_JSON
      );

    initializeApp({
      credential:
        cert(serviceAccount),

      databaseURL:
        process.env
          .FIREBASE_DATABASE_URL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
  }
}

const firebaseDb =
  getDatabase();

// ======================================================
// RAZORPAY
// ======================================================

const razorpay =
  new Razorpay({
    key_id:
      process.env
        .RAZORPAY_KEY_ID,

    key_secret:
      process.env
        .RAZORPAY_KEY_SECRET,
  });

// ======================================================
// PLANS
// ======================================================

const PLANS = {
  single: {
    amount: 19,
    validityDays: 365,
  },

  combo: {
    amount: 199,
    validityDays: 365,
  },
};

// ======================================================
// HOME
// ======================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Study With Power Payment Server Running",
    });
  }
);

// ======================================================
// CREATE ORDER
// ======================================================

app.post(
  "/api/payment/create-order",
  async (req, res) => {
    try {
      const {
        planId,
        userId,
        userEmail,
        seriesId,
        seriesName,
      } = req.body;

      if (!planId) {
        return res
          .status(400)
          .json({
            message:
              "planId required",
          });
      }

      if (!userId) {
        return res
          .status(400)
          .json({
            message:
              "userId required",
          });
      }

      const plan =
        PLANS[planId];

      if (!plan) {
        return res
          .status(400)
          .json({
            message:
              "Invalid plan",
          });
      }

      if (
        planId ===
          "single" &&
        !seriesId
      ) {
        return res
          .status(400)
          .json({
            message:
              "seriesId required for single plan",
          });
      }

      const order =
        await razorpay.orders.create(
          {
            amount:
              plan.amount *
              100,

            currency: "INR",

            receipt:
              `swp_${Date.now()}`,

            notes: {
              userId,
              userEmail:
                userEmail ||
                "",
              planId,
              seriesId:
                seriesId ||
                "",
              seriesName:
                seriesName ||
                "",
            },
          }
        );

      await firebaseDb
        .ref(
          `paymentOrders/${order.id}`
        )
        .set({
          orderId:
            order.id,

          userId,

          userEmail:
            userEmail ||
            "",

          planId,

          seriesId:
            seriesId ||
            null,

          seriesName:
            seriesName ||
            "",

          amount:
            plan.amount,

          status:
            "created",

          createdAt:
            Date.now(),
        });

      res.json({
        success: true,

        keyId:
          process.env
            .RAZORPAY_KEY_ID,

        orderId:
          order.id,

        amount:
          order.amount,

        currency:
          order.currency,
      });
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Order create failed",
        });
    }
  }
);

// ======================================================
// VERIFY PAYMENT
// ======================================================

app.post(
  "/api/payment/verify",
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        userId,
        userEmail,

        planId,
        seriesId,
        seriesName,

        validityDays,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res
          .status(400)
          .json({
            message:
              "Payment details missing",
          });
      }

      if (!userId) {
        return res
          .status(400)
          .json({
            message:
              "userId missing",
          });
      }

      // --------------------------------------------
      // SIGNATURE VERIFY
      // --------------------------------------------

      const body =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(body)
          .digest("hex");

      if (
        expectedSignature !==
        razorpay_signature
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid payment signature",
          });
      }

      const plan =
        PLANS[planId];

      if (!plan) {
        return res
          .status(400)
          .json({
            message:
              "Invalid plan",
          });
      }

      // --------------------------------------------
      // EXPIRY
      // --------------------------------------------

      const days =
        Number(
          validityDays
        ) ||
        plan.validityDays;

      const startDate =
        Date.now();

      const expiryDate =
        startDate +
        days *
          24 *
          60 *
          60 *
          1000;

      const subscription = {
        plan:
          planId,

        seriesId:
          planId ===
          "single"
            ? seriesId
            : null,

        seriesName:
          planId ===
          "single"
            ? seriesName ||
              ""
            : "All Test Series",

        amount:
          plan.amount,

        currency:
          "INR",

        validityDays:
          days,

        startDate,

        expiryDate,

        paymentId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,

        status:
          "active",

        userId,

        userEmail:
          userEmail ||
          "",

        createdAt:
          Date.now(),
      };

      // --------------------------------------------
      // SAVE SUBSCRIPTION
      // --------------------------------------------

      await firebaseDb
        .ref(
          `subscriptions/${userId}`
        )
        .set(
          subscription
        );

      // --------------------------------------------
      // PAYMENT RECORD
      // --------------------------------------------

      await firebaseDb
        .ref(
          `payments/${razorpay_payment_id}`
        )
        .set({
          paymentId:
            razorpay_payment_id,

          orderId:
            razorpay_order_id,

          userId,

          userEmail:
            userEmail ||
            "",

          planId,

          seriesId:
            seriesId ||
            null,

          amount:
            plan.amount,

          status:
            "success",

          createdAt:
            Date.now(),
        });

      // --------------------------------------------
      // UPDATE ORDER
      // --------------------------------------------

      await firebaseDb
        .ref(
          `paymentOrders/${razorpay_order_id}`
        )
        .update({
          status:
            "paid",

          paymentId:
            razorpay_payment_id,

          paidAt:
            Date.now(),
        });

      res.json({
        success: true,

        message:
          "Payment verified successfully",

        subscription,
      });
    } catch (error) {
      console.error(
        "Verify payment error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message ||
            "Payment verification failed",
        });
    }
  }
);

// ======================================================
// PORT
// ======================================================

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Study With Power Payment Server running on port ${PORT}`
    );
  }
);

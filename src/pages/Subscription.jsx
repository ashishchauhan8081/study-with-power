import React, { useEffect, useState } from "react";

// ======================================================
// SUBSCRIPTION PLANS
// ======================================================

export const SUBSCRIPTION_PLANS = {
  SINGLE: {
    id: "single",
    name: "Single Exam Test Series",
    price: 19,
    validityDays: 365,
  },

  COMBO: {
    id: "combo",
    name: "Complete Test Series Combo",
    price: 199,
    validityDays: 365,
  },
};

// ======================================================
// EXAMS
// ======================================================

export const EXAMS = [
  { id: "upsc", name: "UPSC", icon: "🇮🇳" },
  { id: "uppcs", name: "UPPCS", icon: "🏛️" },
  { id: "uppet", name: "UP PET", icon: "🎯" },
  { id: "bpsc", name: "BPSC", icon: "🏛️" },
  { id: "mppsc", name: "MPPSC", icon: "📚" },
  { id: "ssc", name: "SSC", icon: "📝" },
  { id: "railway", name: "Railway", icon: "🚆" },
  { id: "banking", name: "Banking", icon: "🏦" },
  { id: "upsssc", name: "UPSSSC", icon: "📖" },
  { id: "roaro", name: "RO/ARO", icon: "📜" },
  { id: "police", name: "Police", icon: "👮" },
  { id: "teaching", name: "Teaching", icon: "👨‍🏫" },
];

// ======================================================
// DATE
// ======================================================

export function getExpiryDate(startDate, validityDays = 365) {
  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const expiry = new Date(start);

  expiry.setDate(expiry.getDate() + validityDays);

  return expiry;
}

// ======================================================
// ACTIVE
// ======================================================

export function isSubscriptionActive(expiryDate) {
  if (!expiryDate) {
    return false;
  }

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return new Date() < expiry;
}

// ======================================================
// REMAINING DAYS
// ======================================================

export function getRemainingDays(expiryDate) {
  if (!expiryDate) {
    return 0;
  }

  const expiry = new Date(expiryDate);
  const now = new Date();

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const difference = expiry.getTime() - now.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

// ======================================================
// FORMAT DATE
// ======================================================

export function formatDate(date) {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ======================================================
// ACCESS CHECK
// ======================================================

export function hasSeriesAccess(subscription, seriesId) {
  if (!subscription) {
    return false;
  }

  if (
    subscription.plan === "combo" &&
    isSubscriptionActive(subscription.expiryDate)
  ) {
    return true;
  }

  if (
    subscription.plan === "single" &&
    subscription.seriesId === seriesId &&
    isSubscriptionActive(subscription.expiryDate)
  ) {
    return true;
  }

  return false;
}

// ======================================================
// EXAM NAME
// ======================================================

export function getExamName(examId) {
  const exam = EXAMS.find(
    (item) => item.id === examId
  );

  return exam ? exam.name : examId || "Test Series";
}

// ======================================================
// RAZORPAY SCRIPT
// ======================================================

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Subscription({
  user = null,
  examId = "",
  examName = "",
  subscription = null,
  onPurchase = null,
}) {
  const [currentSubscription, setCurrentSubscription] =
    useState(subscription);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  useEffect(() => {
    setCurrentSubscription(subscription);
  }, [subscription]);

  const active =
    currentSubscription &&
    isSubscriptionActive(
      currentSubscription.expiryDate
    );

  const remainingDays = active
    ? getRemainingDays(
        currentSubscription.expiryDate
      )
    : 0;

  const currentExamName =
    examName ||
    getExamName(examId) ||
    "Test Series";

  // ====================================================
  // BUY
  // ====================================================

  const handlePurchase = async (plan) => {
    if (!user) {
      alert("कृपया पहले Login करें।");
      return;
    }

    if (plan.id === "single" && !examId) {
      alert("कृपया पहले Exam/Test Series चुनें।");
      return;
    }

    try {
      setPaymentLoading(true);

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        alert(
          "Razorpay Checkout load नहीं हुआ। Internet connection check करें।"
        );
        return;
      }

      // ------------------------------------------
      // CREATE ORDER
      // ------------------------------------------

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            planId: plan.id,
            amount: plan.price,
            userId: user.uid,
            userEmail: user.email || "",
            seriesId:
              plan.id === "single"
                ? examId
                : null,
            seriesName:
              plan.id === "single"
                ? currentExamName
                : "All Test Series",
          }),
        }
      );

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(
          orderData.message ||
            "Order create नहीं हुआ।"
        );
      }

      // ------------------------------------------
      // RAZORPAY
      // ------------------------------------------

      const options = {
        key: orderData.keyId,

        amount: orderData.amount,

        currency: "INR",

        name: "Study With Power",

        description: plan.name,

        order_id: orderData.orderId,

        prefill: {
          name:
            user.displayName ||
            "Study With Power User",

          email: user.email || "",
        },

        theme: {
          color: "#2563eb",
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  ...paymentResponse,

                  userId: user.uid,

                  userEmail:
                    user.email || "",

                  planId: plan.id,

                  seriesId:
                    plan.id === "single"
                      ? examId
                      : null,

                  seriesName:
                    plan.id === "single"
                      ? currentExamName
                      : "All Test Series",

                  validityDays:
                    plan.validityDays,
                }),
              }
            );

            const result =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                result.message ||
                  "Payment verification failed."
              );
            }

            alert(
              "🎉 Payment सफल हुआ!\n\n" +
                `${plan.name} अब Active है।`
            );

            if (
              typeof onPurchase ===
              "function"
            ) {
              onPurchase(result.subscription);
            }

            window.location.reload();
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              "Payment हो गया लेकिन verification में समस्या आई।\n\n" +
                error.message
            );
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            "❌ Payment Failed\n\n" +
              (response.error?.description ||
                "Payment failed")
          );

          setPaymentLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        "❌ Payment शुरू नहीं हुआ:\n" +
          error.message
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "20px auto",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            fontSize: "42px",
          }}
        >
          💎
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#111827",
          }}
        >
          Test Series Subscription
        </h2>

        <p
          style={{
            color: "#6b7280",
          }}
        >
          अपनी पसंद की Test Series चुनें
        </p>

        <div
          style={{
            display: "inline-block",
            padding: "7px 14px",
            borderRadius: "20px",
            background: "#eff6ff",
            color: "#2563eb",
            fontWeight: "700",
          }}
        >
          📅 365 दिन की Validity
        </div>
      </div>

      {active && (
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            borderRadius: "16px",
            background: "#ecfdf5",
            border: "1px solid #86efac",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#166534",
            }}
          >
            ✅ आपका Subscription Active है
          </h3>

          <p>
            <strong>Plan:</strong>{" "}
            {currentSubscription.plan ===
            "combo"
              ? "🏆 Complete Combo"
              : "📖 Single Test Series"}
          </p>

          {currentSubscription.plan ===
            "single" && (
            <p>
              <strong>Exam:</strong>{" "}
              {currentSubscription.seriesName ||
                currentExamName}
            </p>
          )}

          {currentSubscription.plan ===
            "combo" && (
            <p>
              <strong>Access:</strong>{" "}
              सभी Test Series
            </p>
          )}

          <p>
            <strong>Expiry:</strong>{" "}
            {formatDate(
              currentSubscription.expiryDate
            )}
          </p>

          <p>
            <strong>Remaining:</strong>{" "}
            <b>{remainingDays} दिन</b>
          </p>
        </div>
      )}

      {examId && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "#f3f4f6",
            textAlign: "center",
          }}
        >
          <span>
            Selected Exam
          </span>

          <div
            style={{
              marginTop: "5px",
              fontSize: "21px",
              fontWeight: "800",
            }}
          >
            🎯 {currentExamName}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* SINGLE */}

        <div
          style={{
            border: "1px solid #dbeafe",
            borderRadius: "20px",
            padding: "25px",
            background: "#ffffff",
            boxShadow:
              "0 6px 22px rgba(0,0,0,0.08)",
          }}
        >
          <h3>
            📖 Single Exam
          </h3>

          <p>
            केवल चुने हुए Exam की Test Series
          </p>

          <div
            style={{
              fontSize: "38px",
              fontWeight: "900",
              color: "#2563eb",
            }}
          >
            ₹19
          </div>

          <div
            style={{
              lineHeight: "1.8",
            }}
          >
            ✓ चुने हुए Exam का Access
            <br />
            ✓ सभी उपलब्ध Tests
            <br />
            ✓ 365 दिन Validity
            <br />
            ✓ 365 दिन बाद ₹19 Renewal
          </div>

          <button
            disabled={paymentLoading}
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.SINGLE
              )
            }
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: "800",
            }}
          >
            {paymentLoading
              ? "⏳ Processing..."
              : "🔓 Buy ₹19"}
          </button>
        </div>

        {/* COMBO */}

        <div
          style={{
            border: "2px solid #f59e0b",
            borderRadius: "20px",
            padding: "25px",
            background:
              "linear-gradient(180deg,#fffdf5,#ffffff)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "#fef3c7",
              color: "#92400e",
              fontWeight: "800",
            }}
          >
            ⭐ COMPLETE COMBO
          </div>

          <h3>
            🏆 Complete Test Series
          </h3>

          <p>
            सभी Exams की Test Series
          </p>

          <div
            style={{
              fontSize: "38px",
              fontWeight: "900",
              color: "#d97706",
            }}
          >
            ₹199
          </div>

          <div
            style={{
              lineHeight: "1.8",
            }}
          >
            ✓ सभी Exams का Access
            <br />
            ✓ सभी उपलब्ध Tests
            <br />
            ✓ UPSC, UPPCS, UP PET आदि
            <br />
            ✓ 365 दिन Validity
            <br />
            ✓ 365 दिन बाद ₹199 Renewal
          </div>

          <button
            disabled={paymentLoading}
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.COMBO
              )
            }
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: "#f59e0b",
              color: "#111827",
              fontSize: "17px",
              fontWeight: "900",
            }}
          >
            {paymentLoading
              ? "⏳ Processing..."
              : "🏆 Buy Complete Combo ₹199"}
          </button>
        </div>
      </div>

      {/* PRICE LIST */}

      <div
        style={{
          marginTop: "28px",
          padding: "20px",
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            textAlign: "center",
          }}
        >
          📚 Exam-wise Pricing
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px",
          }}
        >
          {EXAMS.map((exam) => (
            <div
              key={exam.id}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "#f8fafc",
                textAlign: "center",
                border:
                  "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                }}
              >
                {exam.icon}
              </div>

              <div
                style={{
                  fontWeight: "700",
                }}
              >
                {exam.name}
              </div>

              <div
                style={{
                  color: "#2563eb",
                  fontWeight: "800",
                }}
              >
                ₹19
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "10px",
            background: "#fffbeb",
            textAlign: "center",
            fontWeight: "800",
            color: "#92400e",
          }}
        >
          🏆 सभी Exams का Combo = ₹199
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          padding: "18px",
          borderRadius: "14px",
          background: "#f3f4f6",
          color: "#374151",
          fontSize: "14px",
          lineHeight: "1.8",
        }}
      >
        <strong>
          📅 Subscription नियम
        </strong>

        <br />

        • Single Exam = ₹19 / 365 दिन
        <br />
        • Complete Combo = ₹199 / 365 दिन
        <br />
        • Payment Razorpay से होगा
        <br />
        • Payment verification server पर होगा
        <br />
        • Verification के बाद ही subscription activate होगा
      </div>
    </div>
  );
}

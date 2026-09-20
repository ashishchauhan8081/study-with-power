import React, { useEffect, useState } from "react";

// ======================================================
// EXAM TEST
// SUBSCRIPTION SYSTEM
// ======================================================
//
// Single Exam = ₹19 / 365 Days
// Complete Combo = ₹199 / 365 Days
//
// Payment gateway बाद में Razorpay/backend से connect
// किया जा सकता है.
// ======================================================

// ======================================================
// SUBSCRIPTION PLANS
// ======================================================

export const SUBSCRIPTION_PLANS = {
  SINGLE: {
    id: "single",
    name: "Single Exam Test",
    price: 19,
    validityDays: 365,
  },

  COMBO: {
    id: "combo",
    name: "Complete Exam Test Combo",
    price: 199,
    validityDays: 365,
  },
};

// ======================================================
// EXAMS
// ======================================================

export const EXAMS = [
  {
    id: "upsc",
    name: "UPSC",
    icon: "🇮🇳",
  },
  {
    id: "uppcs",
    name: "UPPCS",
    icon: "🏛️",
  },
  {
    id: "uppet",
    name: "UP PET",
    icon: "🎯",
  },
  {
    id: "bpsc",
    name: "BPSC",
    icon: "🏛️",
  },
  {
    id: "mppsc",
    name: "MPPSC",
    icon: "📚",
  },
  {
    id: "ssc",
    name: "SSC",
    icon: "📝",
  },
  {
    id: "railway",
    name: "Railway",
    icon: "🚆",
  },
  {
    id: "banking",
    name: "Banking",
    icon: "🏦",
  },
  {
    id: "upsssc",
    name: "UPSSSC",
    icon: "📖",
  },
  {
    id: "roaro",
    name: "RO/ARO",
    icon: "📜",
  },
  {
    id: "police",
    name: "Police",
    icon: "👮",
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: "👨‍🏫",
  },
];

// ======================================================
// EXPIRY DATE
// ======================================================

export function getExpiryDate(
  startDate,
  validityDays = 365
) {
  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const expiry = new Date(start);

  expiry.setDate(
    expiry.getDate() + validityDays
  );

  return expiry;
}

// ======================================================
// ACTIVE SUBSCRIPTION
// ======================================================

export function isSubscriptionActive(
  expiryDate
) {
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

export function getRemainingDays(
  expiryDate
) {
  if (!expiryDate) {
    return 0;
  }

  const expiry = new Date(expiryDate);
  const now = new Date();

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const difference =
    expiry.getTime() -
    now.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
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

  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

// ======================================================
// CHECK EXAM ACCESS
// ======================================================

export function hasSeriesAccess(
  subscription,
  seriesId
) {
  if (!subscription) {
    return false;
  }

  // COMBO ACCESS
  if (
    subscription.plan === "combo" &&
    isSubscriptionActive(
      subscription.expiryDate
    )
  ) {
    return true;
  }

  // SINGLE EXAM ACCESS
  if (
    subscription.plan === "single" &&
    subscription.seriesId === seriesId &&
    isSubscriptionActive(
      subscription.expiryDate
    )
  ) {
    return true;
  }

  return false;
}

// ======================================================
// GET EXAM NAME
// ======================================================

export function getExamName(
  examId
) {
  const exam = EXAMS.find(
    (item) =>
      item.id === examId
  );

  return exam
    ? exam.name
    : examId || "Exam Test";
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
  const [
    currentSubscription,
    setCurrentSubscription,
  ] = useState(subscription);

  // ====================================================
  // UPDATE SUBSCRIPTION
  // ====================================================

  useEffect(() => {
    setCurrentSubscription(
      subscription
    );
  }, [subscription]);

  // ====================================================
  // ACTIVE
  // ====================================================

  const active =
    currentSubscription &&
    isSubscriptionActive(
      currentSubscription.expiryDate
    );

  // ====================================================
  // REMAINING DAYS
  // ====================================================

  const remainingDays = active
    ? getRemainingDays(
        currentSubscription.expiryDate
      )
    : 0;

  // ====================================================
  // CURRENT EXAM
  // ====================================================

  const currentExamName =
    examName ||
    getExamName(examId) ||
    "Exam Test";

  // ====================================================
  // PURCHASE
  // ====================================================

  const handlePurchase = (
    plan
  ) => {
    // LOGIN CHECK
    if (!user) {
      alert(
        "कृपया पहले Login करें।"
      );

      return;
    }

    // SINGLE EXAM CHECK
    if (
      plan.id === "single" &&
      !examId
    ) {
      alert(
        "कृपया पहले Exam चुनें।"
      );

      return;
    }

    // PAYMENT CALLBACK
    if (
      typeof onPurchase ===
      "function"
    ) {
      onPurchase({
        planId: plan.id,

        amount: plan.price,

        validityDays:
          plan.validityDays,

        seriesId:
          plan.id === "single"
            ? examId
            : null,

        seriesName:
          plan.id === "single"
            ? currentExamName
            : "All Exam Test",

        userId:
          user?.uid || null,

        userEmail:
          user?.email || null,

        createdAt:
          Date.now(),
      });

      return;
    }

    // PAYMENT NOT CONNECTED
    alert(
      `₹${plan.price} का Payment System अभी Connect नहीं है।\n\n` +
      `Plan: ${plan.name}`
    );
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

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >

        <div
          style={{
            fontSize: "42px",
            marginBottom: "5px",
          }}
        >
          📝
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#111827",
          }}
        >
          Exam Test Subscription
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginTop: "8px",
            fontSize: "15px",
          }}
        >
          अपनी पसंद की Exam Test Series चुनें
        </p>

        <div
          style={{
            display: "inline-block",
            marginTop: "5px",
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

      {/* ACTIVE SUBSCRIPTION */}

      {active && (
        <div
          style={{
            marginBottom: "25px",
            padding: "20px",
            borderRadius: "16px",
            background: "#ecfdf5",
            border:
              "1px solid #86efac",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.05)",
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
            <strong>
              Plan:
            </strong>{" "}
            {currentSubscription.plan ===
            "combo"
              ? "🏆 Complete Combo"
              : "📖 Single Exam Test"}
          </p>

          {currentSubscription.plan ===
            "single" && (
            <p>
              <strong>
                Exam:
              </strong>{" "}
              {currentSubscription.seriesName ||
                currentExamName}
            </p>
          )}

          {currentSubscription.plan ===
            "combo" && (
            <p>
              <strong>
                Access:
              </strong>{" "}
              सभी Exam Test
            </p>
          )}

          <p>
            <strong>
              Expiry:
            </strong>{" "}
            {formatDate(
              currentSubscription.expiryDate
            )}
          </p>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            <strong>
              Remaining:
            </strong>{" "}

            <span
              style={{
                color: "#15803d",
                fontWeight: "800",
              }}
            >
              {remainingDays} दिन
            </span>
          </p>

        </div>
      )}

      {/* CURRENT EXAM */}

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

          <span
            style={{
              color: "#6b7280",
            }}
          >
            Selected Exam
          </span>

          <div
            style={{
              marginTop: "5px",
              fontSize: "21px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            🎯 {currentExamName}
          </div>

        </div>
      )}

      {/* PLANS */}

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
            border:
              "1px solid #dbeafe",
            borderRadius: "20px",
            padding: "25px",
            background: "#ffffff",
            boxShadow:
              "0 6px 22px rgba(0,0,0,0.08)",
          }}
        >

          <div
            style={{
              fontSize: "19px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            📖 Single Exam Test
          </div>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            केवल चुने हुए Exam की Test Series
          </p>

          <div
            style={{
              fontSize: "38px",
              fontWeight: "900",
              color: "#2563eb",
              margin:
                "18px 0",
            }}
          >
            ₹19
          </div>

          <div
            style={{
              color: "#374151",
              lineHeight: "1.8",
              fontSize: "15px",
            }}
          >

            <div>
              ✓ केवल चुने हुए Exam का Access
            </div>

            <div>
              ✓ सभी उपलब्ध Tests
            </div>

            <div>
              ✓ 365 दिन Validity
            </div>

            <div>
              ✓ 365 दिन बाद ₹19 Renewal
            </div>

          </div>

          <button
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
              background:
                "#2563eb",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            🔓 Buy ₹19
          </button>

        </div>

        {/* COMBO */}

        <div
          style={{
            border:
              "2px solid #f59e0b",
            borderRadius: "20px",
            padding: "25px",
            background:
              "linear-gradient(180deg,#fffdf5,#ffffff)",
            boxShadow:
              "0 8px 28px rgba(245,158,11,0.18)",
            position: "relative",
          }}
        >

          <div
            style={{
              display:
                "inline-block",
              padding:
                "6px 12px",
              borderRadius:
                "20px",
              background:
                "#fef3c7",
              color:
                "#92400e",
              fontSize: "13px",
              fontWeight: "800",
              marginBottom:
                "12px",
            }}
          >
            ⭐ COMPLETE COMBO
          </div>

          <div
            style={{
              fontSize: "19px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            🏆 Complete Exam Test
          </div>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            सभी Exams की Test Series
          </p>

          <div
            style={{
              fontSize: "38px",
              fontWeight: "900",
              color: "#d97706",
              margin:
                "18px 0",
            }}
          >
            ₹199
          </div>

          <div
            style={{
              color: "#374151",
              lineHeight: "1.8",
              fontSize: "15px",
            }}
          >

            <div>
              ✓ सभी Exams का Access
            </div>

            <div>
              ✓ सभी उपलब्ध Tests
            </div>

            <div>
              ✓ UPSC, UPPCS, UP PET आदि
            </div>

            <div>
              ✓ 365 दिन Validity
            </div>

            <div>
              ✓ 365 दिन बाद ₹199 Renewal
            </div>

          </div>

          <button
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
              background:
                "#f59e0b",
              color: "#111827",
              fontSize: "17px",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            🏆 Buy Complete Combo ₹199
          </button>

        </div>

      </div>

      {/* EXAM PRICE */}

      <div
        style={{
          marginTop: "28px",
          padding: "20px",
          borderRadius: "16px",
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >

        <h3
          style={{
            marginTop: 0,
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
                borderRadius:
                  "10px",
                background:
                  "#f8fafc",
                textAlign:
                  "center",
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
                  fontWeight:
                    "700",
                  marginTop:
                    "4px",
                }}
              >
                {exam.name}
              </div>

              <div
                style={{
                  color:
                    "#2563eb",
                  fontWeight:
                    "800",
                  marginTop:
                    "4px",
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
            borderRadius:
              "10px",
            background:
              "#fffbeb",
            textAlign:
              "center",
            fontWeight:
              "800",
            color:
              "#92400e",
          }}
        >
          🏆 सभी Exams का Combo = ₹199
        </div>

      </div>

      {/* RULES */}

      <div
        style={{
          marginTop: "25px",
          padding: "18px",
          borderRadius: "14px",
          background:
            "#f3f4f6",
          color: "#374151",
          fontSize: "14px",
          lineHeight: "1.8",
        }}
      >

        <strong>
          📅 Subscription नियम
        </strong>

        <br />

        • Single Exam Test की कीमत ₹19 है।
        <br />

        • Complete Exam Test Combo ₹199 है।
        <br />

        • दोनों Plans की Validity 365 दिन है।
        <br />

        • Validity समाप्त होने के बाद Renewal करना होगा।
        <br />

        • Payment verification secure backend से करना चाहिए।
        <br />

        • Payment अभी इस component में connect नहीं है।

      </div>

    </div>
  );
               }

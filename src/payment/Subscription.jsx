import React, { useEffect, useState } from "react";

/*
  ============================================================
  STUDY WITH POWER
  SUBSCRIPTION SYSTEM
  ============================================================

  PRICING:

  Single Exam / Test Series
  ₹19 / 365 Days

  Complete Test Series Combo
  ₹199 / 365 Days

  IMPORTANT:
  अभी Payment verification frontend में नहीं है।
  Razorpay / secure backend बाद में जोड़ा जा सकता है.
  ============================================================
*/


// ============================================================
// SUBSCRIPTION PLANS
// ============================================================

export const SUBSCRIPTION_PLANS = {
  SINGLE: {
    id: "single",
    name: "Single Test Series",
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


// ============================================================
// DATE UTILITIES
// ============================================================

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


// ============================================================
// CHECK SUBSCRIPTION ACTIVE
// ============================================================

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


// ============================================================
// REMAINING DAYS
// ============================================================

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


// ============================================================
// FORMAT DATE
// ============================================================

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


// ============================================================
// CHECK SERIES ACCESS
// ============================================================

export function hasSeriesAccess(
  subscription,
  seriesId
) {
  if (!subscription) {
    return false;
  }

  // --------------------------------------------------------
  // COMPLETE COMBO
  // --------------------------------------------------------

  if (
    subscription.plan === "combo" &&
    isSubscriptionActive(
      subscription.expiryDate
    )
  ) {
    return true;
  }

  // --------------------------------------------------------
  // SINGLE TEST SERIES
  // --------------------------------------------------------

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


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Subscription({
  user = null,

  seriesId = "",

  seriesName = "Test Series",

  subscription = null,

  onPurchase = null,
}) {
  const [
    currentSubscription,
    setCurrentSubscription,
  ] = useState(subscription);


  // ==========================================================
  // UPDATE SUBSCRIPTION
  // ==========================================================

  useEffect(() => {
    setCurrentSubscription(
      subscription
    );
  }, [subscription]);


  // ==========================================================
  // ACTIVE SUBSCRIPTION
  // ==========================================================

  const active =
    currentSubscription &&
    isSubscriptionActive(
      currentSubscription.expiryDate
    );


  // ==========================================================
  // REMAINING DAYS
  // ==========================================================

  const remainingDays = active
    ? getRemainingDays(
        currentSubscription.expiryDate
      )
    : 0;


  // ==========================================================
  // PURCHASE
  // ==========================================================

  const handlePurchase = (plan) => {

    // --------------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------------

    if (!user) {
      alert(
        "कृपया पहले Login करें।"
      );

      return;
    }


    // --------------------------------------------------------
    // SEND PURCHASE REQUEST
    // --------------------------------------------------------

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
            ? seriesId
            : null,

        seriesName:
          plan.id === "single"
            ? seriesName
            : "All Test Series",

      });

      return;
    }


    // --------------------------------------------------------
    // PAYMENT NOT CONNECTED YET
    // --------------------------------------------------------

    alert(
      `Payment system अभी connect नहीं है।\n\n` +
      `${plan.name}\n` +
      `Amount: ₹${plan.price}\n` +
      `Validity: ${plan.validityDays} Days`
    );
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",

        margin:
          "20px auto",

        padding:
          "20px",

        boxSizing:
          "border-box",

        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >

      {/* ====================================================
          HEADING
      ==================================================== */}

      <div
        style={{
          textAlign:
            "center",

          marginBottom:
            "25px",
        }}
      >

        <h2
          style={{
            margin: 0,

            fontSize:
              "28px",

            fontWeight:
              "800",
          }}
        >
          📚 Test Series Plans
        </h2>


        <p
          style={{
            color:
              "#666",

            marginTop:
              "8px",

            fontSize:
              "16px",
          }}
        >
          365 दिन की Validity
        </p>

      </div>


      {/* ====================================================
          ACTIVE SUBSCRIPTION
      ==================================================== */}

      {active && (

        <div
          style={{
            marginBottom:
              "25px",

            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              "#ecfdf5",

            border:
              "1px solid #86efac",
          }}
        >

          <h3
            style={{
              marginTop:
                0,

              marginBottom:
                "15px",
            }}
          >
            ✅ आपका Subscription Active है
          </h3>


          <p>
            Plan:{" "}
            <strong>
              {
                currentSubscription.plan ===
                "combo"
                  ? "Complete Combo"
                  : "Single Test Series"
              }
            </strong>
          </p>


          {currentSubscription.plan ===
            "single" && (

            <p>
              Test Series:{" "}
              <strong>
                {
                  currentSubscription.seriesName ||
                  seriesName
                }
              </strong>
            </p>

          )}


          <p>
            Expiry Date:{" "}
            <strong>
              {formatDate(
                currentSubscription.expiryDate
              )}
            </strong>
          </p>


          <p>
            Remaining:{" "}
            <strong>
              {remainingDays} दिन
            </strong>
          </p>

        </div>

      )}


      {/* ====================================================
          PLANS
      ==================================================== */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",

          gap:
            "20px",
        }}
      >


        {/* ==================================================
            SINGLE ₹19
        ================================================== */}

        <div
          style={{
            border:
              "1px solid #ddd",

            borderRadius:
              "18px",

            padding:
              "25px",

            background:
              "#fff",

            boxShadow:
              "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >

          <div
            style={{
              fontSize:
                "18px",

              fontWeight:
                "700",

              marginBottom:
                "10px",
            }}
          >
            📖 Single Test Series
          </div>


          <div
            style={{
              fontSize:
                "38px",

              fontWeight:
                "800",

              margin:
                "15px 0",

              color:
                "#2563eb",
            }}
          >
            ₹19
          </div>


          <p>
            ✓ केवल चुनी हुई Test Series
          </p>

          <p>
            ✓ सभी उपलब्ध Tests
          </p>

          <p>
            ✓ Validity: 365 दिन
          </p>

          <p>
            ✓ 365 दिन बाद ₹19 Renewal
          </p>


          <button
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.SINGLE
              )
            }
            style={{
              width:
                "100%",

              marginTop:
                "15px",

              padding:
                "14px",

              border:
                "none",

              borderRadius:
                "10px",

              background:
                "#2563eb",

              color:
                "#fff",

              fontSize:
                "16px",

              fontWeight:
                "700",

              cursor:
                "pointer",
            }}
          >
            🔓 Buy ₹19
          </button>

        </div>


        {/* ==================================================
            COMBO ₹199
        ================================================== */}

        <div
          style={{
            border:
              "2px solid #f59e0b",

            borderRadius:
              "18px",

            padding:
              "25px",

            background:
              "#fff",

            boxShadow:
              "0 7px 25px rgba(0,0,0,0.10)",

            position:
              "relative",
          }}
        >

          {/* BEST VALUE */}

          <div
            style={{
              display:
                "inline-block",

              padding:
                "5px 10px",

              borderRadius:
                "20px",

              background:
                "#fef3c7",

              color:
                "#92400e",

              fontSize:
                "13px",

              fontWeight:
                "700",

              marginBottom:
                "10px",
            }}
          >
            ⭐ BEST VALUE
          </div>


          <div
            style={{
              fontSize:
                "18px",

              fontWeight:
                "700",
            }}
          >
            🏆 Complete Test Series Combo
          </div>


          <div
            style={{
              fontSize:
                "38px",

              fontWeight:
                "800",

              margin:
                "15px 0",

              color:
                "#d97706",
            }}
          >
            ₹199
          </div>


          <p>
            ✓ सभी Exams की Test Series
          </p>

          <p>
            ✓ सभी उपलब्ध Tests
          </p>

          <p>
            ✓ Validity: 365 दिन
          </p>

          <p>
            ✓ 365 दिन बाद ₹199 Renewal
          </p>


          <button
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.COMBO
              )
            }
            style={{
              width:
                "100%",

              marginTop:
                "15px",

              padding:
                "14px",

              border:
                "none",

              borderRadius:
                "10px",

              background:
                "#f59e0b",

              color:
                "#111",

              fontSize:
                "16px",

              fontWeight:
                "800",

              cursor:
                "pointer",
            }}
          >
            🏆 Buy Complete Combo ₹199
          </button>

        </div>

      </div>


      {/* ====================================================
          COMPARISON
      ==================================================== */}

      <div
        style={{
          marginTop:
            "25px",

          padding:
            "18px",

          borderRadius:
            "14px",

          background:
            "#eff6ff",

          border:
            "1px solid #bfdbfe",
        }}
      >

        <h3
          style={{
            marginTop:
              0,

            marginBottom:
              "15px",

            color:
              "#1e40af",
          }}
        >
          📋 Subscription Details
        </h3>


        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "1fr 1fr 1fr",

            gap:
              "8px",

            textAlign:
              "center",

            fontSize:
              "14px",
          }}
        >

          <strong>
            सुविधा
          </strong>

          <strong>
            Single ₹19
          </strong>

          <strong>
            Combo ₹199
          </strong>


          <span>
            Test Series
          </span>

          <span>
            चुनी हुई
          </span>

          <span>
            सभी
          </span>


          <span>
            Validity
          </span>

          <span>
            365 दिन
          </span>

          <span>
            365 दिन
          </span>


          <span>
            Renewal
          </span>

          <span>
            ₹19
          </span>

          <span>
            ₹199
          </span>

        </div>

      </div>


      {/* ====================================================
          RENEWAL INFORMATION
      ==================================================== */}

      <div
        style={{
          marginTop:
            "25px",

          padding:
            "16px",

          borderRadius:
            "12px",

          background:
            "#f3f4f6",

          color:
            "#444",

          fontSize:
            "14px",

          lineHeight:
            "1.7",
        }}
      >

        <strong>
          📅 Renewal नियम:
        </strong>

        <br />

        ₹19 Single Test Series का
        access 365 दिनों तक रहेगा।

        <br />

        ₹199 Complete Combo का
        access 365 दिनों तक रहेगा।

        <br />

        365 दिन पूरे होने के बाद
        access automatically expire
        होगा और renewal करना पड़ेगा।

      </div>


      {/* ====================================================
          PAYMENT NOTE
      ==================================================== */}

      <div
        style={{
          marginTop:
            "15px",

          padding:
            "14px",

          borderRadius:
            "10px",

          background:
            "#fff7ed",

          border:
            "1px solid #fed7aa",

          color:
            "#9a3412",

          fontSize:
            "13px",

          lineHeight:
            "1.6",

          textAlign:
            "center",
        }}
      >
        🔒 Payment verification secure
        backend/payment gateway से किया जाएगा।
      </div>

    </div>
  );
}

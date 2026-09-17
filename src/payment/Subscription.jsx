import React, { useEffect, useState } from "react";

/*
  Study With Power
  Subscription System

  Plans:
  - Single Test Series = ₹49 / 365 Days
  - Complete Combo      = ₹599 / 365 Days

  IMPORTANT:
  Payment verification बाद में secure backend/payment gateway से होगा.
*/

export const SUBSCRIPTION_PLANS = {
  SINGLE: {
    id: "single",
    name: "Single Test Series",
    price: 49,
    validityDays: 365,
  },

  COMBO: {
    id: "combo",
    name: "Complete Test Series Combo",
    price: 599,
    validityDays: 365,
  },
};

// -------------------------------------------------------
// Date Utilities
// -------------------------------------------------------

export function getExpiryDate(startDate, validityDays = 365) {
  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + validityDays);

  return expiry;
}

export function isSubscriptionActive(expiryDate) {
  if (!expiryDate) return false;

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  return new Date() < expiry;
}

export function getRemainingDays(expiryDate) {
  if (!expiryDate) return 0;

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

export function formatDate(date) {
  if (!date) return "-";

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

// -------------------------------------------------------
// Check Single Test Series Access
// -------------------------------------------------------

export function hasSeriesAccess(subscription, seriesId) {
  if (!subscription) {
    return false;
  }

  // Complete Combo gives access to every series
  if (
    subscription.plan === "combo" &&
    isSubscriptionActive(subscription.expiryDate)
  ) {
    return true;
  }

  // Single series subscription
  if (
    subscription.plan === "single" &&
    subscription.seriesId === seriesId &&
    isSubscriptionActive(subscription.expiryDate)
  ) {
    return true;
  }

  return false;
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------

export default function Subscription({
  user = null,
  seriesId = "",
  seriesName = "Test Series",
  subscription = null,
  onPurchase = null,
}) {
  const [currentSubscription, setCurrentSubscription] =
    useState(subscription);

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

  // -----------------------------------------------------
  // Purchase button
  // -----------------------------------------------------

  const handlePurchase = (plan) => {
    if (!user) {
      alert("कृपया पहले Login करें।");
      return;
    }

    if (typeof onPurchase === "function") {
      onPurchase({
        planId: plan.id,
        amount: plan.price,
        validityDays: plan.validityDays,
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

    alert(
      "Payment system अगले चरण में जोड़ा जाएगा।"
    );
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

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
      {/* Heading */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          📚 Test Series Plans
        </h2>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          365 दिन की Validity
        </p>
      </div>

      {/* Active Subscription */}

      {active && (
        <div
          style={{
            marginBottom: "25px",
            padding: "18px",
            borderRadius: "14px",
            background: "#ecfdf5",
            border: "1px solid #86efac",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            ✅ आपका Subscription Active है
          </h3>

          <p>
            Plan:{" "}
            <strong>
              {currentSubscription.plan ===
              "combo"
                ? "Complete Combo"
                : "Single Test Series"}
            </strong>
          </p>

          {currentSubscription.plan ===
            "single" && (
            <p>
              Test Series:{" "}
              <strong>
                {currentSubscription.seriesName ||
                  seriesName}
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

      {/* Plans */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* SINGLE ₹49 */}

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "18px",
            padding: "25px",
            background: "#fff",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            📖 Single Test Series
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: "800",
              margin: "15px 0",
            }}
          >
            ₹49
          </div>

          <p>✓ केवल चुनी हुई Test Series</p>
          <p>✓ सभी उपलब्ध Tests</p>
          <p>✓ Validity: 365 दिन</p>
          <p>✓ 365 दिन बाद ₹49 Renewal</p>

          <button
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.SINGLE
              )
            }
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🔓 Buy ₹49
          </button>
        </div>

        {/* COMBO ₹599 */}

        <div
          style={{
            border: "2px solid #f59e0b",
            borderRadius: "18px",
            padding: "25px",
            background: "#fff",
            boxShadow:
              "0 7px 25px rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "5px 10px",
              borderRadius: "20px",
              background: "#fef3c7",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            ⭐ BEST VALUE
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            🏆 Complete Test Series Combo
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: "800",
              margin: "15px 0",
            }}
          >
            ₹599
          </div>

          <p>✓ सभी Exams की Test Series</p>
          <p>✓ सभी उपलब्ध Tests</p>
          <p>✓ Validity: 365 दिन</p>
          <p>✓ 365 दिन बाद ₹599 Renewal</p>

          <button
            onClick={() =>
              handlePurchase(
                SUBSCRIPTION_PLANS.COMBO
              )
            }
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#f59e0b",
              color: "#111",
              fontSize: "16px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            🏆 Buy Complete Combo ₹599
          </button>
        </div>
      </div>

      {/* Renewal Information */}

      <div
        style={{
          marginTop: "25px",
          padding: "16px",
          borderRadius: "12px",
          background: "#f3f4f6",
          color: "#444",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <strong>📅 Renewal नियम:</strong>

        <br />

        ₹49 Single Test Series का access
        365 दिनों तक रहेगा।

        <br />

        ₹599 Complete Combo का access
        365 दिनों तक रहेगा।

        <br />

        365 दिन पूरे होने के बाद access
        automatically expire होगा और
        renewal करना पड़ेगा।
      </div>
    </div>
  );
}
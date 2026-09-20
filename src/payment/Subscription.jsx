import React from "react";

/*
  Study With Power
  ₹19 Exam-wise Test Series Unlock

  Rule:
  - हर Exam का Test 1 FREE
  - बाकी Tests के लिए ₹19 One Time Payment
  - Payment के बाद उस Exam के सभी Tests Unlock
*/

export const SUBSCRIPTION_PLANS = {
  SINGLE: {
    id: "single",
    name: "Complete Exam Test Series",
    price: 19,
  },
};

// -------------------------------------------------------
// Check Exam Access
// -------------------------------------------------------

export function hasSeriesAccess(subscription, seriesId) {
  if (!subscription || !seriesId) {
    return false;
  }

  return (
    subscription.seriesId === seriesId &&
    subscription.active === true
  );
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
  const active = hasSeriesAccess(
    subscription,
    seriesId
  );

  // -----------------------------------------------------
  // Purchase
  // -----------------------------------------------------

  const handlePurchase = () => {
    if (!user) {
      alert("कृपया पहले Login करें।");
      return;
    }

    if (!seriesId) {
      alert("Exam की जानकारी नहीं मिली।");
      return;
    }

    if (active) {
      alert(
        `✅ ${seriesName} पहले से Unlock है।`
      );
      return;
    }

    if (typeof onPurchase === "function") {
      onPurchase({
        planId: "single",
        amount: 19,
        seriesId: seriesId,
        seriesName: seriesName,
      });

      return;
    }

    alert(
      "Payment system अभी connect नहीं है।"
    );
  };

  // -----------------------------------------------------
  // Already Unlocked
  // -----------------------------------------------------

  if (active) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "20px auto",
          padding: "25px",
          boxSizing: "border-box",
          borderRadius: "18px",
          background: "#ecfdf5",
          border: "2px solid #86efac",
          textAlign: "center",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "50px",
            marginBottom: "10px",
          }}
        >
          🔓
        </div>

        <h2
          style={{
            margin: "5px 0",
            color: "#15803d",
          }}
        >
          Test Series Unlocked
        </h2>

        <p
          style={{
            fontSize: "17px",
            margin: "10px 0",
          }}
        >
          <strong>{seriesName}</strong>
        </p>

        <p
          style={{
            color: "#166534",
            margin: 0,
          }}
        >
          ✅ इस Exam के सभी Tests अब आपके लिए
          Unlock हैं।
        </p>
      </div>
    );
  }

  // -----------------------------------------------------
  // Purchase UI
  // -----------------------------------------------------

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
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
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "45px",
          }}
        >
          🔒
        </div>

        <h2
          style={{
            margin: "5px 0",
          }}
        >
          {seriesName}
        </h2>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          Test 1 FREE है। बाकी सभी Tests
          Unlock करने के लिए एक बार ₹19 भुगतान करें।
        </p>
      </div>

      {/* Plan */}

      <div
        style={{
          border: "2px solid #2563eb",
          borderRadius: "20px",
          padding: "25px",
          background: "#fff",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "20px",
            background: "#dbeafe",
            color: "#1d4ed8",
            fontSize: "13px",
            fontWeight: "800",
          }}
        >
          ⭐ ONE TIME PAYMENT
        </div>

        <h3
          style={{
            marginTop: "15px",
            fontSize: "21px",
          }}
        >
          📚 Complete {seriesName}
        </h3>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "900",
            margin: "15px 0",
            color: "#2563eb",
          }}
        >
          ₹19
        </div>

        <div
          style={{
            lineHeight: "1.9",
            color: "#374151",
          }}
        >
          <p>✓ Test 1 पहले से FREE</p>
          <p>✓ Test 2, 3, 4... सभी Unlock</p>
          <p>✓ इसी Exam के सभी उपलब्ध Tests</p>
          <p>✓ एक बार ₹19 Payment</p>
          <p>✓ कोई Monthly Subscription नहीं</p>
          <p>✓ कोई 365 दिन Expiry नहीं</p>
        </div>

        <button
          type="button"
          onClick={handlePurchase}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "15px",
            border: "none",
            borderRadius: "12px",
            background: "#2563eb",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          🔓 ₹19 में सभी Tests Unlock करें
        </button>
      </div>

      {/* Information */}

      <div
        style={{
          marginTop: "18px",
          padding: "15px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          lineHeight: "1.7",
          color: "#475569",
        }}
      >
        <strong>ℹ️ ध्यान दें:</strong>
        <br />
        ₹19 का Payment केवल इस Exam की Test
        Series को Unlock करेगा।
        <br />
        दूसरे Exam को Unlock करने के लिए उस
        Exam के लिए अलग से ₹19 देना होगा।
      </div>
    </div>
  );
}

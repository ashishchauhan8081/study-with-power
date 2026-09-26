import React, { useEffect, useState } from "react";

import {
  getApps,
  getApp,
  initializeApp,
} from "firebase/app";

import {
  getDatabase,
  ref,
  onValue,
  update,
  remove,
} from "firebase/database";

import firebaseConfig from "../../firebase-config.json";

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      databaseURL:
        firebaseConfig.databaseURL ||
        "https://study-with-power-f6914-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

const db = getDatabase(firebaseApp);

function generateOTP() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

export default function WhatsAppOtpManager() {
  const [requests, setRequests] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const requestRef = ref(
      db,
      "passwordResetRequests"
    );

    const unsubscribe = onValue(
      requestRef,
      (snapshot) => {
        setRequests(
          snapshot.val() || {}
        );
      },
      (error) => {
        console.error(
          "OTP request error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const pendingRequests = Object.entries(
    requests || {}
  )
    .map(([id, data]) => ({
      id,
      ...data,
    }))
    .filter(
      (item) =>
        item.status === "pending"
    )
    .sort(
      (a, b) =>
        Number(b.createdAt || 0) -
        Number(a.createdAt || 0)
    );

  const generateAndSaveOTP = async (
    request
  ) => {
    try {
      setLoadingId(request.id);

      const otp = generateOTP();

      await update(
        ref(
          db,
          `passwordResetRequests/${request.id}`
        ),
        {
          otp,
          status: "otp_generated",
          generatedAt: Date.now(),
          used: false,
        }
      );

      alert(
        `OTP Generate हो गया: ${otp}`
      );
    } catch (error) {
      console.error(error);

      alert(
        "OTP generate नहीं हुआ:\n" +
          error.message
      );
    } finally {
      setLoadingId(null);
    }
  };

  const copyOTP = async (otp) => {
    try {
      await navigator.clipboard.writeText(
        otp
      );

      alert(
        "✅ OTP Copy हो गया। अब WhatsApp पर भेज दें।"
      );
    } catch (error) {
      alert(
        "OTP: " + otp
      );
    }
  };

  const markSent = async (request) => {
    try {
      await update(
        ref(
          db,
          `passwordResetRequests/${request.id}`
        ),
        {
          status: "sent",
          sentAt: Date.now(),
        }
      );
    } catch (error) {
      alert(
        "Status update error:\n" +
          error.message
      );
    }
  };

  const deleteRequest = async (id) => {
    const ok = window.confirm(
      "यह OTP request delete करें?"
    );

    if (!ok) return;

    try {
      await remove(
        ref(
          db,
          `passwordResetRequests/${id}`
        )
      );
    } catch (error) {
      alert(
        "Delete error:\n" +
          error.message
      );
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 20,
        marginTop: 20,
        boxShadow:
          "0 8px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>
          🔐 WhatsApp OTP Requests
        </h2>

        {pendingRequests.length > 0 && (
          <span
            style={{
              background: "#ef4444",
              color: "#fff",
              borderRadius: 20,
              padding: "6px 12px",
              fontWeight: 700,
            }}
          >
            🔔 {pendingRequests.length}
          </span>
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <div
          style={{
            padding: 25,
            textAlign: "center",
            background: "#f8fafc",
            borderRadius: 12,
            color: "#64748b",
          }}
        >
          अभी कोई नई OTP Request नहीं है।
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 15,
          }}
        >
          {pendingRequests.map(
            (request) => (
              <div
                key={request.id}
                style={{
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 15,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                  }}
                >
                  📱{" "}
                  {request.mobile ||
                    "Mobile नहीं मिला"}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    marginTop: 5,
                    fontSize: 13,
                  }}
                >
                  Request ID:{" "}
                  {request.id}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    marginTop: 5,
                    fontSize: 13,
                  }}
                >
                  समय:{" "}
                  {request.createdAt
                    ? new Date(
                        request.createdAt
                      ).toLocaleString(
                        "hi-IN"
                      )
                    : "-"}
                </div>

                {request.otp && (
                  <div
                    style={{
                      marginTop: 15,
                      padding: 12,
                      background:
                        "#ecfdf5",
                      borderRadius: 10,
                    }}
                  >
                    <strong>
                      OTP:
                    </strong>{" "}
                    <span
                      style={{
                        fontSize: 24,
                        letterSpacing: 5,
                        fontWeight: 800,
                      }}
                    >
                      {request.otp}
                    </span>

                    <button
                      onClick={() =>
                        copyOTP(
                          request.otp
                        )
                      }
                      style={{
                        marginLeft: 10,
                        padding:
                          "8px 12px",
                        border: 0,
                        borderRadius: 8,
                        cursor:
                          "pointer",
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 15,
                  }}
                >
                  {!request.otp && (
                    <button
                      onClick={() =>
                        generateAndSaveOTP(
                          request
                        )
                      }
                      disabled={
                        loadingId ===
                        request.id
                      }
                      style={{
                        background:
                          "#2563eb",
                        color: "#fff",
                        border: 0,
                        borderRadius: 10,
                        padding:
                          "11px 16px",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                      }}
                    >
                      {loadingId ===
                      request.id
                        ? "Generating..."
                        : "🔑 Generate OTP"}
                    </button>
                  )}

                  {request.otp && (
                    <button
                      onClick={() =>
                        markSent(
                          request
                        )
                      }
                      style={{
                        background:
                          "#16a34a",
                        color: "#fff",
                        border: 0,
                        borderRadius: 10,
                        padding:
                          "11px 16px",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                      }}
                    >
                      ✅ WhatsApp पर भेज दिया
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteRequest(
                        request.id
                      )
                    }
                    style={{
                      background:
                        "#fee2e2",
                      color: "#b91c1c",
                      border: 0,
                      borderRadius: 10,
                      padding:
                        "11px 16px",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

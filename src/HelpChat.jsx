import React, { useState } from "react";

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const whatsappNumber = "918081174507";

  const sendMessage = () => {
    const text = message.trim();

    if (!text) {
      alert("कृपया अपनी समस्या लिखें।");
      return;
    }

    const whatsappText =
      `Exam Test Help & Support\n\n` +
      `समस्या: ${text}`;

    const url =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(whatsappText);

    window.open(url, "_blank");

    setMessage("");
  };

  const selectProblem = (problem) => {
    setMessage(problem);
  };

  return (
    <>
      {/* ================= CHAT BOX ================= */}

      {open && (
        <div style={styles.chatBox}>

          {/* HEADER */}

          <div style={styles.header}>

            <div>
              <div style={styles.headerTitle}>
                💬 Help & Support
              </div>

              <div style={styles.status}>
                ● Online Support
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={styles.closeButton}
            >
              ×
            </button>

          </div>

          {/* BODY */}

          <div style={styles.body}>

            <div style={styles.welcome}>
              <strong>नमस्ते! 👋</strong>

              <br />

              Exam Test में आपकी क्या मदद करूँ?
            </div>

            {/* QUICK PROBLEMS */}

            <div style={styles.quickTitle}>
              अपनी समस्या चुनें:
            </div>

            <div style={styles.quickButtons}>

              <button
                type="button"
                style={styles.quickButton}
                onClick={() =>
                  selectProblem(
                    "Login में समस्या"
                  )
                }
              >
                🔐 Login समस्या
              </button>

              <button
                type="button"
                style={styles.quickButton}
                onClick={() =>
                  selectProblem(
                    "Payment में समस्या"
                  )
                }
              >
                💳 Payment समस्या
              </button>

              <button
                type="button"
                style={styles.quickButton}
                onClick={() =>
                  selectProblem(
                    "Test Series में समस्या"
                  )
                }
              >
                📚 Test Series
              </button>

              <button
                type="button"
                style={styles.quickButton}
                onClick={() =>
                  selectProblem(
                    "Test या Questions में समस्या"
                  )
                }
              >
                📝 Test समस्या
              </button>

            </div>

            {/* MESSAGE */}

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="अपनी समस्या यहाँ लिखें..."
              rows={4}
              style={styles.textarea}
            />

            {/* SEND */}

            <button
              type="button"
              onClick={sendMessage}
              style={styles.sendButton}
            >
              💬 WhatsApp पर भेजें
            </button>

            <div style={styles.note}>
              WhatsApp खुलने के बाद संदेश Send करें।
            </div>

          </div>

        </div>
      )}

      {/* ================= FLOATING BUTTON ================= */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={styles.floatingButton}
        title="Help & Support"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  floatingButton: {
    position: "fixed",
    right: "20px",
    bottom: "20px",

    width: "60px",
    height: "60px",

    borderRadius: "50%",
    border: "none",

    background: "#0868f5",
    color: "#ffffff",

    fontSize: "28px",
    fontWeight: "bold",

    cursor: "pointer",

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.25)",

    zIndex: 99999,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  chatBox: {
    position: "fixed",

    right: "20px",
    bottom: "92px",

    width: "350px",
    maxWidth: "calc(100vw - 30px)",

    background: "#ffffff",

    borderRadius: "18px",

    overflow: "hidden",

    border: "1px solid #e2e8f0",

    boxShadow:
      "0 15px 50px rgba(0,0,0,0.25)",

    zIndex: 99998,
  },

  header: {
    background: "#0868f5",
    color: "#ffffff",

    padding: "15px 16px",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: "17px",
    fontWeight: "800",
  },

  status: {
    marginTop: "3px",
    fontSize: "11px",
    opacity: 0.95,
  },

  closeButton: {
    width: "35px",
    height: "35px",

    border: "none",
    borderRadius: "50%",

    background: "rgba(255,255,255,0.15)",

    color: "#ffffff",

    fontSize: "27px",
    lineHeight: 1,

    cursor: "pointer",
  },

  body: {
    padding: "15px",
  },

  welcome: {
    background: "#f1f5f9",

    borderRadius: "12px",

    padding: "12px",

    color: "#334155",

    fontSize: "14px",

    lineHeight: 1.6,

    marginBottom: "14px",
  },

  quickTitle: {
    fontSize: "13px",

    fontWeight: "800",

    color: "#334155",

    marginBottom: "8px",
  },

  quickButtons: {
    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: "8px",

    marginBottom: "12px",
  },

  quickButton: {
    border: "1px solid #bfdbfe",

    background: "#eff6ff",

    color: "#1d4ed8",

    borderRadius: "9px",

    padding: "9px 6px",

    fontSize: "11px",

    fontWeight: "700",

    cursor: "pointer",

    minHeight: "42px",
  },

  textarea: {
    width: "100%",

    boxSizing: "border-box",

    resize: "vertical",

    border:
      "1px solid #cbd5e1",

    borderRadius: "10px",

    padding: "10px",

    fontSize: "13px",

    fontFamily: "inherit",

    outline: "none",

    color: "#0f172a",

    marginBottom: "9px",
  },

  sendButton: {
    width: "100%",

    border: "none",

    borderRadius: "10px",

    padding: "12px",

    background: "#16a34a",

    color: "#ffffff",

    fontSize: "14px",

    fontWeight: "800",

    cursor: "pointer",
  },

  note: {
    textAlign: "center",

    marginTop: "8px",

    fontSize: "10px",

    color: "#64748b",
  },
};

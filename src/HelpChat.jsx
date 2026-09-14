import React, { useState } from "react";

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const text = message.trim();

    if (!text) {
      alert("कृपया अपनी समस्या लिखें।");
      return;
    }

    const whatsappNumber = "918081174507";

    const url =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent("Study With Power Help: " + text);

    window.open(url, "_blank");
    setMessage("");
  };

  return (
    <>
      {open && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <div>
              <strong>💬 Help & Support</strong>
              <div style={styles.status}>● Online Support</div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={styles.close}
            >
              ×
            </button>
          </div>

          <div style={styles.body}>
            <div style={styles.welcome}>
              नमस्ते! 👋
              <br />
              Study With Power में आपकी क्या मदद करूँ?
            </div>

            <div style={styles.quickButtons}>
              {[
                "Login में समस्या",
                "Payment में समस्या",
                "Test Series में मदद",
                "Test/Questions समस्या",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setMessage(item)}
                  style={styles.quickButton}
                >
                  {item}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="अपनी समस्या लिखें..."
              rows="3"
              style={styles.textarea}
            />

            <button
              onClick={sendMessage}
              style={styles.sendButton}
            >
              WhatsApp पर भेजें →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={styles.floatingButton}
        title="Help & Support"
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}

const styles = {
  floatingButton: {
    position: "fixed",
    right: "22px",
    bottom: "22px",
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "27px",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(0,0,0,.25)",
    zIndex: 99999,
  },

  chatBox: {
    position: "fixed",
    right: "22px",
    bottom: "92px",
    width: "330px",
    maxWidth: "calc(100vw - 30px)",
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 15px 45px rgba(0,0,0,.25)",
    border: "1px solid #e5e7eb",
    zIndex: 99998,
  },

  header: {
    background: "#2563eb",
    color: "#fff",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  status: {
    fontSize: "11px",
    marginTop: "3px",
  },

  close: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "28px",
    cursor: "pointer",
  },

  body: {
    padding: "14px",
  },

  welcome: {
    background: "#f3f4f6",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "10px",
  },

  quickButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "7px",
    marginBottom: "10px",
  },

  quickButton: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "8px",
    padding: "8px 6px",
    fontSize: "11px",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    padding: "10px",
    fontSize: "13px",
    fontFamily: "inherit",
    marginBottom: "9px",
  },

  sendButton: {
    width: "100%",
    border: "none",
    borderRadius: "9px",
    padding: "11px",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
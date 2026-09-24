import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  const [adminEmail, setAdminEmail] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const email =
      localStorage.getItem("adminEmail") ||
      auth.currentUser?.email ||
      "Admin";

    setAdminEmail(email);

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==============================
  // HASH NAVIGATION
  // ==============================
  const goTo = (hash) => {
    window.location.hash = hash;
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    const confirmLogout = window.confirm(
      "क्या आप Admin Panel से Logout करना चाहते हैं?"
    );

    if (!confirmLogout) return;

    try {
      await signOut(auth);

      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminEmail");

      if (onLogout) {
        onLogout();
      } else {
        window.location.hash = "#admin-login";
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("❌ Logout नहीं हो पाया।");
    }
  };

  // ==============================
  // DASHBOARD CARDS
  // ==============================
  const dashboardCards = [
    {
      icon: "🏫",
      title: "Manage Exams",
      description: "नए Exam जोड़ें, Edit करें और Delete करें",
      color: "blue",
      action: () => goTo("#manage-exams"),
    },
    {
      icon: "📚",
      title: "Test Series",
      description: "Exam के Test Series को Manage करें",
      color: "purple",
      action: () => goTo("#manage-test-series"),
    },
    {
      icon: "📝",
      title: "Test Manager",
      description: "Test, Test Number और Questions Manage करें",
      color: "green",
      action: () => goTo("#test-manager"),
    },
    {
      icon: "❓",
      title: "Question Manager",
      description: "Questions Add, Edit, Delete और Import करें",
      color: "orange",
      action: () => goTo("#question-manager"),
    },
    {
      icon: "📰",
      title: "Current Affairs",
      description: "Current Affairs Questions और Content Manage करें",
      color: "red",
      action: () => goTo("#current-affairs"),
    },
    {
      icon: "📦",
      title: "Resources",
      description: "Study Material और अन्य Resources Manage करें",
      color: "cyan",
      action: () => goTo("#resources"),
    },
  ];

  // ==============================
  // QUICK ACTIONS
  // ==============================
  const quickActions = [
    {
      icon: "➕",
      title: "New Exam",
      text: "नया Exam बनाएं",
      action: () => goTo("#manage-exams"),
    },
    {
      icon: "📝",
      title: "New Test",
      text: "नया Test बनाएं",
      action: () => goTo("#test-manager"),
    },
    {
      icon: "❓",
      title: "Add Question",
      text: "Question जोड़ें",
      action: () => goTo("#question-manager"),
    },
    {
      icon: "📰",
      title: "Current Affairs",
      text: "Current Affairs खोलें",
      action: () => goTo("#current-affairs"),
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* =====================================
          TOP NAVBAR
      ====================================== */}
      <header className="admin-navbar">
        <div className="admin-brand">
          <div className="admin-brand-icon">👑</div>

          <div>
            <h1>Study With Power</h1>
            <span>Admin Control Panel</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <div className="admin-clock">
            <strong>
              {time.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </strong>

            <small>
              {time.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </small>
          </div>

          <div className="admin-user">
            <div className="admin-user-icon">👤</div>

            <div className="admin-user-info">
              <strong>Admin</strong>
              <span>{adminEmail}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <main className="admin-main">
        {/* WELCOME */}
        <section className="welcome-section">
          <div>
            <div className="welcome-badge">🔐 ADMIN PANEL</div>

            <h2>Welcome, Admin 👋</h2>

            <p>
              यहाँ से आप Exam, Test Series, Tests, Questions और Current
              Affairs को आसानी से Manage कर सकते हैं।
            </p>
          </div>

          <div className="welcome-date">
            <span>आज की तारीख</span>
            <strong>
              {time.toLocaleDateString("hi-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
        </section>

        {/* =====================================
            QUICK ACTIONS
        ====================================== */}
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>⚡ Quick Actions</h2>
              <p>सबसे ज्यादा इस्तेमाल होने वाले विकल्प</p>
            </div>
          </div>

          <div className="quick-grid">
            {quickActions.map((item, index) => (
              <button
                key={index}
                className="quick-card"
                onClick={item.action}
              >
                <div className="quick-icon">{item.icon}</div>

                <div className="quick-content">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>

                <div className="quick-arrow">→</div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================
            MANAGEMENT
        ====================================== */}
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>🛠️ Management</h2>
              <p>Website के सभी मुख्य sections को manage करें</p>
            </div>
          </div>

          <div className="dashboard-grid">
            {dashboardCards.map((card, index) => (
              <button
                key={index}
                className={`dashboard-card ${card.color}`}
                onClick={card.action}
              >
                <div className="dashboard-card-top">
                  <div className="dashboard-card-icon">{card.icon}</div>

                  <span className="open-arrow">↗</span>
                </div>

                <h3>{card.title}</h3>

                <p>{card.description}</p>

                <div className="card-open">
                  Open <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================
            TEST FLOW
        ====================================== */}
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>📚 Test System</h2>
              <p>Exam से Question तक पूरा flow</p>
            </div>
          </div>

          <div className="flow-container">
            <div className="flow-item">
              <div className="flow-number">1</div>
              <div className="flow-icon">🏫</div>
              <h3>Exam</h3>
              <p>UPPCS, UPPET, SSC आदि</p>
            </div>

            <div className="flow-line">→</div>

            <div className="flow-item">
              <div className="flow-number">2</div>
              <div className="flow-icon">📚</div>
              <h3>Test Series</h3>
              <p>Series बनाएं</p>
            </div>

            <div className="flow-line">→</div>

            <div className="flow-item">
              <div className="flow-number">3</div>
              <div className="flow-icon">📝</div>
              <h3>Test</h3>
              <p>Test Number, Price, Status</p>
            </div>

            <div className="flow-line">→</div>

            <div className="flow-item">
              <div className="flow-number">4</div>
              <div className="flow-icon">❓</div>
              <h3>Questions</h3>
              <p>MCQ Questions</p>
            </div>
          </div>
        </section>

        {/* =====================================
            TEST STATUS INFO
        ====================================== */}
        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>📌 Test Settings</h2>
              <p>Test बनाते समय इन विकल्पों का उपयोग करें</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="info-box">
              <div className="info-icon">🔢</div>
              <div>
                <strong>Test Number</strong>
                <span>Test 01, Test 02, Test 03...</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">🌐</div>
              <div>
                <strong>Public / Unlisted</strong>
                <span>Test को Public या Unlisted रखें</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">💰</div>
              <div>
                <strong>Free / Paid</strong>
                <span>₹0 Free या अपनी Price सेट करें</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">⏱️</div>
              <div>
                <strong>Duration</strong>
                <span>Test का समय मिनट में सेट करें</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">📥</div>
              <div>
                <strong>JSON Import</strong>
                <span>Questions JSON से Import करें</span>
              </div>
            </div>

            <div className="info-box">
              <div className="info-icon">📤</div>
              <div>
                <strong>JSON Export</strong>
                <span>Questions को JSON में Export करें</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            FOOTER
        ====================================== */}
        <footer className="admin-footer">
          <div>
            <strong>Study With Power</strong>
            <span>Admin Control Panel</span>
          </div>

          <div>
            <span>🔒 Secure Admin Area</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;

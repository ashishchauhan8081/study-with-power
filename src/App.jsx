import React, { useEffect, useState } from "react";
import "./App.css";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

// Admin components
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";

// ======================================================
// ADMIN EMAIL
// ======================================================

const ADMIN_EMAIL = "cciashish@gmail.com";

// ======================================================
// APP
// ======================================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAdminLogin, setShowAdminLogin] =
    useState(false);

  const [showAdminPanel, setShowAdminPanel] =
    useState(false);

  // ====================================================
  // FIREBASE AUTH STATE
  // ====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        // अगर admin पहले से login है
        if (
          currentUser &&
          currentUser.email === ADMIN_EMAIL
        ) {
          setShowAdminPanel(true);
          setShowAdminLogin(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // ====================================================
  // ADMIN LOGIN SUCCESS
  // ====================================================

  const handleAdminLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  // ====================================================
  // ADMIN PANEL CLOSE
  // ====================================================

  const handleAdminClose = () => {
    setShowAdminPanel(false);
  };

  // ====================================================
  // ADMIN LOGOUT
  // ====================================================

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setShowAdminPanel(false);
      setShowAdminLogin(false);
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      alert(
        "Logout नहीं हुआ:\n" +
          error.message
      );
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: "600",
        }}
      >
        ⏳ Loading Exam Test...
      </div>
    );
  }

  // ====================================================
  // ADMIN PANEL
  // ====================================================

  if (
    showAdminPanel &&
    user &&
    user.email === ADMIN_EMAIL
  ) {
    return (
      <AdminPanel
        user={user}
        onClose={handleAdminClose}
      />
    );
  }

  // ====================================================
  // ADMIN LOGIN
  // ====================================================

  if (showAdminLogin) {
    return (
      <AdminLogin
        onLoginSuccess={
          handleAdminLoginSuccess
        }
        onClose={() =>
          setShowAdminLogin(false)
        }
      />
    );
  }

  // ====================================================
  // MAIN WEBSITE
  // ====================================================

  return (
    <div className="app">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="main-header">

        <div className="header-left">
          <div className="logo-box">
            📝
          </div>

          <div>
            <h1>Exam Test</h1>

            <p>
              Prepare Today | Succeed Tomorrow
            </p>
          </div>
        </div>

        <button
          className="menu-button"
          onClick={() =>
            alert(
              "Menu जल्द जोड़ा जाएगा।"
            )
          }
        >
          ☰
        </button>

      </header>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav className="main-nav">

        <button
          className="nav-item active"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          🏠 Home
        </button>

        <button
          className="nav-item"
          onClick={() => {
            alert(
              "Exam Test section जल्द उपलब्ध होगा।"
            );
          }}
        >
          📄 Exam
          <br />
          Test
        </button>

        <button
          className="nav-item"
          onClick={() => {
            window.location.href =
              "/login";
          }}
        >
          👤 Login
        </button>

        <button
          className="nav-item"
          onClick={() =>
            setShowAdminLogin(true)
          }
        >
          🔐 Admin
          <br />
          Panel
        </button>

      </nav>

      {/* ==================================================
          HERO
      ================================================== */}

      <main className="home-page">

        <section className="hero-card">

          <div className="hero-badge">
            🎯 Competitive Exam Preparation
          </div>

          <h2>
            Welcome to
            <br />
            <span>Exam Test</span>
          </h2>

          <p className="hero-description">
            UPSC, UPPCS, UP PET, SSC, Railway,
            <br />
            Banking और अन्य प्रतियोगी परीक्षाओं
            के लिए
            <br />
            Online Exam Test Series।
          </p>

          <button
            className="start-test-button"
            onClick={() => {
              alert(
                "Exam Test Series जल्द शुरू होगी।"
              );
            }}
          >
            ▶️ Start Exam Test
          </button>

          <div className="education-image">
            🎓
          </div>

          <div className="hero-bottom-text">
            Learn Today
            <br />
            Lead Tomorrow
          </div>

        </section>

        {/* ==================================================
            ADMIN LOGIN SHORTCUT
        ================================================== */}

        <section
          style={{
            margin: "20px",
            padding: "20px",
            background: "#fff",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >

          <h3>
            🔐 Admin
          </h3>

          <p>
            Exam और Questions manage करने के लिए
            Admin Panel खोलें।
          </p>

          <button
            className="start-test-button"
            onClick={() =>
              setShowAdminLogin(true)
            }
          >
            🔐 Admin Login
          </button>

        </section>

      </main>

      {/* ==================================================
          CHAT BUTTON
      ================================================== */}

      <button
        className="chat-button"
        onClick={() =>
          alert(
            "Chat support जल्द उपलब्ध होगा।"
          )
        }
      >
        💬
      </button>

    </div>
  );
}

export default App;

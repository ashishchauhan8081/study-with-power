import React, { useState } from "react";
import "./CurrentAffairs.css";

function CurrentAffairs({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = [
    "All",
    "National",
    "International",
    "Economy",
    "Science & Technology",
    "Sports",
    "Awards",
    "Government Schemes",
  ];

  const currentAffairs = [
    {
      id: 1,
      category: "National",
      title: "राष्ट्रीय करेंट अफेयर्स",
      description:
        "आज की महत्वपूर्ण राष्ट्रीय घटनाओं और सरकारी गतिविधियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 2,
      category: "International",
      title: "अंतरराष्ट्रीय करेंट अफेयर्स",
      description:
        "विश्व की महत्वपूर्ण घटनाओं, देशों और अंतरराष्ट्रीय संगठनों से संबंधित समाचार।",
      date: "Today",
    },
    {
      id: 3,
      category: "Economy",
      title: "अर्थव्यवस्था",
      description:
        "भारतीय अर्थव्यवस्था, बैंकिंग, बजट, वित्तीय नीतियों और महत्वपूर्ण आर्थिक घटनाओं से संबंधित जानकारी।",
      date: "Today",
    },
    {
      id: 4,
      category: "Science & Technology",
      title: "विज्ञान एवं प्रौद्योगिकी",
      description:
        "विज्ञान, अंतरिक्ष, AI, तकनीक और महत्वपूर्ण वैज्ञानिक उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 5,
      category: "Sports",
      title: "खेल करेंट अफेयर्स",
      description:
        "महत्वपूर्ण खेल प्रतियोगिताओं, खिलाड़ियों, रिकॉर्ड और खेल पुरस्कारों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 6,
      category: "Awards",
      title: "पुरस्कार एवं सम्मान",
      description:
        "राष्ट्रीय और अंतरराष्ट्रीय पुरस्कार, सम्मान तथा महत्वपूर्ण उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 7,
      category: "Government Schemes",
      title: "सरकारी योजनाएँ",
      description:
        "केंद्र और राज्य सरकार की महत्वपूर्ण योजनाओं तथा नई पहलों से संबंधित जानकारी।",
      date: "Today",
    },
  ];

  const filteredAffairs = currentAffairs.filter((item) => {
    const categoryMatch =
      activeCategory === "All" ||
      item.category === activeCategory;

    const searchMatch =
      item.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="current-affairs-page">

      {/* =========================================
          BACK BUTTON
      ========================================= */}

      <div className="current-affairs-container">
        <button
          className="back-home-btn"
          onClick={handleBack}
        >
          ← Home
        </button>
      </div>

      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="current-affairs-hero">
        <div className="hero-icon">
          📰
        </div>

        <h1>
          Current
          <br />
          Affairs
        </h1>

        <p>
          Daily Current Affairs और
          <br />
          Current Affairs MCQ
        </p>
      </section>

      {/* =========================================
          TODAY CARD
      ========================================= */}

      <section className="current-affairs-container">
        <div className="today-card">

          <div className="today-icon">
            📰
          </div>

          <div>
            <h2>
              Today's Current Affairs
            </h2>

            <p>
              आज के महत्वपूर्ण राष्ट्रीय और
              अंतरराष्ट्रीय घटनाक्रम।
            </p>
          </div>

        </div>
      </section>

      {/* =========================================
          SEARCH
      ========================================= */}

      <section className="current-affairs-container">

        <div className="search-box">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Current Affairs खोजें..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </section>

      {/* =========================================
          CATEGORY
      ========================================= */}

      <section className="current-affairs-container">

        <h2 className="section-title">
          📚 Categories
        </h2>

        <div className="category-list">

          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                activeCategory === category
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}
            </button>
          ))}

        </div>

      </section>

      {/* =========================================
          CURRENT AFFAIRS LIST
      ========================================= */}

      <section className="current-affairs-container">

        <div className="section-heading-row">

          <h2 className="section-title">
            📰 Latest Current Affairs
          </h2>

          <span className="article-count">
            {filteredAffairs.length} Topics
          </span>

        </div>

        <div className="affairs-list">

          {filteredAffairs.length > 0 ? (
            filteredAffairs.map((item) => (

              <div
                className="affair-card"
                key={item.id}
              >

                <div className="affair-card-top">

                  <span className="affair-category">
                    {item.category}
                  </span>

                  <span className="affair-date">
                    📅 {item.date}
                  </span>

                </div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                <button className="read-more-btn">
                  पढ़ें →
                </button>

              </div>

            ))
          ) : (

            <div className="no-results">
              <div className="no-results-icon">
                🔍
              </div>

              <h3>
                कोई Current Affairs नहीं मिला
              </h3>

              <p>
                कृपया दूसरा keyword या category
                चुनकर देखें।
              </p>
            </div>

          )}

        </div>

      </section>

      {/* =========================================
          MCQ SECTION
      ========================================= */}

      <section className="current-affairs-container">

        <div className="mcq-banner">

          <div className="mcq-banner-icon">
            📝
          </div>

          <div className="mcq-banner-content">

            <h2>
              Current Affairs MCQ
            </h2>

            <p>
              प्रतियोगी परीक्षाओं के लिए
              Current Affairs MCQ का अभ्यास करें।
            </p>

            <button
              className="mcq-start-btn"
              onClick={() => {
                alert(
                  "Current Affairs MCQ section जल्द उपलब्ध होगा।"
                );
              }}
            >
              MCQ शुरू करें →
            </button>

          </div>

        </div>

      </section>

      {/* =========================================
          EXAM PREPARATION
      ========================================= */}

      <section className="current-affairs-container">

        <div className="exam-info-card">

          <h2>
            🎯 Exam Preparation
          </h2>

          <p>
            Current Affairs आपकी प्रतियोगी परीक्षा
            की तैयारी का महत्वपूर्ण हिस्सा है।
          </p>

          <div className="exam-tags">

            <span>UPPCS</span>
            <span>UP Police</span>
            <span>SSC</span>
            <span>RRB</span>
            <span>UPSSSC</span>
            <span>Other Exams</span>

          </div>

        </div>

      </section>

      {/* =========================================
          FOOTER SPACE
      ========================================= */}

      <div className="current-affairs-bottom-space"></div>

    </div>
  );
}

export default CurrentAffairs;

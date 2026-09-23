import React, { useMemo, useState } from "react";
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
        "भारत की महत्वपूर्ण राष्ट्रीय घटनाओं, सरकारी निर्णयों और प्रमुख गतिविधियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 2,
      category: "International",
      title: "अंतरराष्ट्रीय करेंट अफेयर्स",
      description:
        "विश्व की महत्वपूर्ण घटनाओं, देशों, अंतरराष्ट्रीय संगठनों और वैश्विक गतिविधियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 3,
      category: "Economy",
      title: "अर्थव्यवस्था एवं बैंकिंग",
      description:
        "भारतीय अर्थव्यवस्था, बैंकिंग, वित्त, बजट और महत्वपूर्ण आर्थिक घटनाओं से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 4,
      category: "Science & Technology",
      title: "विज्ञान एवं प्रौद्योगिकी",
      description:
        "विज्ञान, अंतरिक्ष, AI, डिजिटल तकनीक और महत्वपूर्ण वैज्ञानिक उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 5,
      category: "Sports",
      title: "खेल करेंट अफेयर्स",
      description:
        "खेल प्रतियोगिताओं, खिलाड़ियों, रिकॉर्ड, चैंपियनशिप और खेल जगत की महत्वपूर्ण घटनाओं से संबंधित जानकारी।",
      date: "Today",
    },
    {
      id: 6,
      category: "Awards",
      title: "पुरस्कार एवं सम्मान",
      description:
        "राष्ट्रीय और अंतरराष्ट्रीय पुरस्कारों, सम्मानों तथा महत्वपूर्ण उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
    },
    {
      id: 7,
      category: "Government Schemes",
      title: "सरकारी योजनाएँ",
      description:
        "केंद्र और राज्य सरकार की महत्वपूर्ण योजनाओं, नीतियों और नई पहलों से संबंधित जानकारी।",
      date: "Today",
    },
  ];

  const filteredAffairs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return currentAffairs.filter((item) => {
      const categoryMatch =
        activeCategory === "All" ||
        item.category === activeCategory;

      const searchMatch =
        keyword === "" ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleReadMore = (item) => {
    alert(`${item.title}\n\n${item.description}`);
  };

  const handleMCQ = () => {
    alert(
      "Current Affairs MCQ section जल्द उपलब्ध होगा।"
    );
  };

  return (
    <div className="current-affairs-page">

      {/* ================================
          BACK BUTTON
      ================================= */}

      <div className="current-affairs-container">
        <button
          type="button"
          className="back-home-btn"
          onClick={handleBack}
        >
          ← Home
        </button>
      </div>

      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="current-affairs-hero">
        <div className="hero-icon">📰</div>

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

      {/* ================================
          TODAY CARD
      ================================= */}

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

      {/* ================================
          SEARCH
      ================================= */}

      <section className="current-affairs-container">

        <div className="search-box">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            value={search}
            placeholder="Current Affairs खोजें..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

        </div>

      </section>

      {/* ================================
          CATEGORY SECTION
      ================================= */}

      <section className="current-affairs-container">

        <h2 className="section-title">
          📚 Categories
        </h2>

        <div className="category-list">

          {categories.map((category) => (
            <button
              type="button"
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

      {/* ================================
          LATEST CURRENT AFFAIRS
      ================================= */}

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

              <article
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

                <button
                  type="button"
                  className="read-more-btn"
                  onClick={() =>
                    handleReadMore(item)
                  }
                >
                  पढ़ें →
                </button>

              </article>

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

              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Filters Reset करें
              </button>

            </div>

          )}

        </div>

      </section>

      {/* ================================
          CURRENT AFFAIRS MCQ
      ================================= */}

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
              type="button"
              className="mcq-start-btn"
              onClick={handleMCQ}
            >
              MCQ शुरू करें →
            </button>

          </div>

        </div>

      </section>

      {/* ================================
          EXAM PREPARATION
      ================================= */}

      <section className="current-affairs-container">

        <div className="exam-info-card">

          <h2>
            🎯 Exam Preparation
          </h2>

          <p>
            Current Affairs प्रतियोगी परीक्षाओं
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

      {/* ================================
          BOTTOM SPACE
      ================================= */}

      <div className="current-affairs-bottom-space"></div>

    </div>
  );
}

export default CurrentAffairs;

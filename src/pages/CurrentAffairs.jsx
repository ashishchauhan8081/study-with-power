import React, { useMemo, useState } from "react";
import "./CurrentAffairs.css";

function CurrentAffairs({ onBack }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAffair, setSelectedAffair] = useState(null);

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
      icon: "🇮🇳",
      details: [
        "राष्ट्रीय स्तर की महत्वपूर्ण घटनाओं पर आधारित प्रश्न।",
        "सरकारी निर्णय एवं प्रमुख गतिविधियाँ।",
        "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण तथ्य।",
      ],
    },
    {
      id: 2,
      category: "International",
      title: "अंतरराष्ट्रीय करेंट अफेयर्स",
      description:
        "विश्व की महत्वपूर्ण घटनाओं, देशों, अंतरराष्ट्रीय संगठनों और वैश्विक गतिविधियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
      icon: "🌍",
      details: [
        "अंतरराष्ट्रीय संगठनों से संबंधित घटनाएँ।",
        "विभिन्न देशों के महत्वपूर्ण घटनाक्रम।",
        "वैश्विक स्तर की महत्वपूर्ण घटनाएँ।",
      ],
    },
    {
      id: 3,
      category: "Economy",
      title: "अर्थव्यवस्था एवं बैंकिंग",
      description:
        "भारतीय अर्थव्यवस्था, बैंकिंग, वित्त, बजट और महत्वपूर्ण आर्थिक घटनाओं से संबंधित करेंट अफेयर्स।",
      date: "Today",
      icon: "💰",
      details: [
        "भारतीय अर्थव्यवस्था से संबंधित महत्वपूर्ण घटनाएँ।",
        "बैंकिंग एवं वित्तीय क्षेत्र की जानकारी।",
        "बजट और आर्थिक नीतियों से जुड़े तथ्य।",
      ],
    },
    {
      id: 4,
      category: "Science & Technology",
      title: "विज्ञान एवं प्रौद्योगिकी",
      description:
        "विज्ञान, अंतरिक्ष, AI, डिजिटल तकनीक और महत्वपूर्ण वैज्ञानिक उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
      icon: "🚀",
      details: [
        "अंतरिक्ष एवं वैज्ञानिक मिशन।",
        "Artificial Intelligence और नई तकनीक।",
        "महत्वपूर्ण वैज्ञानिक उपलब्धियाँ।",
      ],
    },
    {
      id: 5,
      category: "Sports",
      title: "खेल करेंट अफेयर्स",
      description:
        "खेल प्रतियोगिताओं, खिलाड़ियों, रिकॉर्ड, चैंपियनशिप और खेल जगत की महत्वपूर्ण घटनाओं से संबंधित जानकारी।",
      date: "Today",
      icon: "🏆",
      details: [
        "महत्वपूर्ण खेल प्रतियोगिताएँ।",
        "खिलाड़ियों और रिकॉर्ड से संबंधित तथ्य।",
        "राष्ट्रीय एवं अंतरराष्ट्रीय खेल घटनाएँ।",
      ],
    },
    {
      id: 6,
      category: "Awards",
      title: "पुरस्कार एवं सम्मान",
      description:
        "राष्ट्रीय और अंतरराष्ट्रीय पुरस्कारों, सम्मानों तथा महत्वपूर्ण उपलब्धियों से संबंधित करेंट अफेयर्स।",
      date: "Today",
      icon: "🏅",
      details: [
        "राष्ट्रीय पुरस्कार एवं सम्मान।",
        "अंतरराष्ट्रीय पुरस्कार।",
        "महत्वपूर्ण व्यक्तियों एवं संस्थाओं की उपलब्धियाँ।",
      ],
    },
    {
      id: 7,
      category: "Government Schemes",
      title: "सरकारी योजनाएँ",
      description:
        "केंद्र और राज्य सरकार की महत्वपूर्ण योजनाओं, नीतियों और नई पहलों से संबंधित जानकारी।",
      date: "Today",
      icon: "🏛️",
      details: [
        "केंद्र सरकार की महत्वपूर्ण योजनाएँ।",
        "राज्य सरकार की प्रमुख योजनाएँ।",
        "नई सरकारी नीतियाँ एवं पहल।",
      ],
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

  const closeModal = () => {
    setSelectedAffair(null);
  };

  return (
    <div className="current-affairs-page">

      {/* BACK BUTTON */}
      <div className="current-affairs-container">
        <button
          type="button"
          className="back-home-btn"
          onClick={handleBack}
        >
          ← Home
        </button>
      </div>

      {/* HERO */}
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

      {/* TODAY */}
      <section className="current-affairs-container">
        <div className="today-card">
          <div className="today-icon">📰</div>

          <div>
            <h2>Today's Current Affairs</h2>

            <p>
              आज के महत्वपूर्ण राष्ट्रीय और
              अंतरराष्ट्रीय घटनाक्रम।
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="current-affairs-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>

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
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
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

      {/* LATEST CURRENT AFFAIRS */}
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

                <div className="affair-icon">
                  {item.icon}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <button
                  type="button"
                  className="read-more-btn"
                  onClick={() =>
                    setSelectedAffair(item)
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

      {/* MCQ BANNER */}
      <section className="current-affairs-container">
        <div className="mcq-banner">
          <div className="mcq-banner-icon">
            📝
          </div>

          <div className="mcq-banner-content">
            <h2>Current Affairs MCQ</h2>

            <p>
              प्रतियोगी परीक्षाओं के लिए
              Current Affairs MCQ का अभ्यास करें।
            </p>

            <button
              type="button"
              className="mcq-start-btn"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              MCQ Practice →
            </button>
          </div>
        </div>
      </section>

      {/* EXAM PREPARATION */}
      <section className="current-affairs-container">
        <div className="exam-info-card">
          <h2>🎯 Exam Preparation</h2>

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

      <div className="current-affairs-bottom-space"></div>

      {/* =========================================
          DETAIL MODAL
      ========================================= */}

      {selectedAffair && (
        <div
          className="current-affairs-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="current-affairs-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div className="modal-title-area">
                <div className="modal-icon">
                  {selectedAffair.icon}
                </div>

                <div>
                  <span className="modal-category">
                    {selectedAffair.category}
                  </span>

                  <h2>
                    {selectedAffair.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-date">
              📅 {selectedAffair.date}
            </div>

            <div className="modal-content">
              <h3>
                📖 महत्वपूर्ण जानकारी
              </h3>

              <p>
                {selectedAffair.description}
              </p>

              <ul>
                {selectedAffair.details.map(
                  (detail, index) => (
                    <li key={index}>
                      {detail}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-close-action"
                onClick={closeModal}
              >
                बंद करें
              </button>

              <button
                type="button"
                className="modal-mcq-action"
                onClick={closeModal}
              >
                📝 MCQ अभ्यास करें
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CurrentAffairs;

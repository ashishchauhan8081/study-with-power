import React, { useMemo, useState } from "react";
import "./CurrentAffairs.css";

const currentAffairsData = [
  {
    id: 1,
    category: "National",
    icon: "🇮🇳",
    date: "Today",
    title: "राष्ट्रीय करंट अफेयर्स",
    description:
      "भारत की महत्वपूर्ण राष्ट्रीय घटनाओं, सरकारी निर्णयों और प्रमुख गतिविधियों से संबंधित करंट अफेयर्स।",
    points: [
      "राष्ट्रीय स्तर की महत्वपूर्ण घटनाओं पर आधारित प्रश्न।",
      "सरकारी निर्णय एवं प्रमुख गतिविधियाँ।",
      "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण तथ्य।",
    ],
  },

  {
    id: 2,
    category: "International",
    icon: "🌍",
    date: "Today",
    title: "अंतरराष्ट्रीय करंट अफेयर्स",
    description:
      "विश्व स्तर की महत्वपूर्ण घटनाओं, अंतरराष्ट्रीय संगठनों और विभिन्न देशों से संबंधित करंट अफेयर्स।",
    points: [
      "अंतरराष्ट्रीय संगठनों से संबंधित महत्वपूर्ण तथ्य।",
      "विभिन्न देशों के प्रमुख घटनाक्रम।",
      "विश्व स्तर की महत्वपूर्ण घटनाएँ।",
    ],
  },

  {
    id: 3,
    category: "Economy",
    icon: "💰",
    date: "Today",
    title: "अर्थव्यवस्था करंट अफेयर्स",
    description:
      "भारतीय अर्थव्यवस्था, बैंकिंग, वित्त, बजट और आर्थिक नीतियों से संबंधित महत्वपूर्ण करंट अफेयर्स।",
    points: [
      "बैंकिंग और वित्त से संबंधित तथ्य।",
      "आर्थिक नीतियाँ एवं सरकारी योजनाएँ।",
      "बजट और अर्थव्यवस्था से संबंधित प्रश्न।",
    ],
  },

  {
    id: 4,
    category: "Science & Technology",
    icon: "🔬",
    date: "Today",
    title: "विज्ञान एवं प्रौद्योगिकी",
    description:
      "विज्ञान, तकनीक, अंतरिक्ष, AI और नई तकनीकों से संबंधित महत्वपूर्ण करंट अफेयर्स।",
    points: [
      "नई तकनीक एवं वैज्ञानिक उपलब्धियाँ।",
      "अंतरिक्ष कार्यक्रम एवं मिशन।",
      "AI और आधुनिक तकनीक से संबंधित तथ्य।",
    ],
  },

  {
    id: 5,
    category: "Sports",
    icon: "🏆",
    date: "Today",
    title: "खेल करंट अफेयर्स",
    description:
      "राष्ट्रीय एवं अंतरराष्ट्रीय खेल प्रतियोगिताओं, खिलाड़ियों और प्रमुख खेल उपलब्धियों से संबंधित समाचार।",
    points: [
      "प्रमुख खेल प्रतियोगिताएँ।",
      "खिलाड़ियों की उपलब्धियाँ।",
      "महत्वपूर्ण खेल पुरस्कार एवं रिकॉर्ड।",
    ],
  },

  {
    id: 6,
    category: "Awards",
    icon: "🏅",
    date: "Today",
    title: "पुरस्कार एवं सम्मान",
    description:
      "राष्ट्रीय एवं अंतरराष्ट्रीय पुरस्कारों, सम्मानों और प्रमुख पुरस्कार विजेताओं से संबंधित करंट अफेयर्स।",
    points: [
      "राष्ट्रीय पुरस्कार एवं सम्मान।",
      "अंतरराष्ट्रीय पुरस्कार।",
      "प्रमुख पुरस्कार विजेता।",
    ],
  },

  {
    id: 7,
    category: "Government Schemes",
    icon: "🏛️",
    date: "Today",
    title: "सरकारी योजनाएँ",
    description:
      "केंद्र एवं राज्य सरकार की महत्वपूर्ण योजनाओं, नीतियों और सरकारी पहलों से संबंधित जानकारी।",
    points: [
      "केंद्र सरकार की प्रमुख योजनाएँ।",
      "राज्य सरकार की महत्वपूर्ण योजनाएँ।",
      "नई सरकारी नीतियाँ एवं पहल।",
    ],
  },
];

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

function CurrentAffairs({ onBack, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return currentAffairsData.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const searchMatch =
        !searchText ||
        item.title.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText);

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };

  const goToMCQ = () => {
    closeArticle();

    if (typeof onNavigate === "function") {
      onNavigate("mcq");
      return;
    }

    window.location.hash = "#mcq";
  };

  return (
    <div className="current-affairs-page">

      {/* ================= HEADER ================= */}
      <section className="ca-header">

        <button
          type="button"
          className="ca-back-button"
          onClick={handleBack}
        >
          ← Home
        </button>

        <div className="ca-header-icon">
          📰
        </div>

        <h1>Current Affairs</h1>

        <p>
          Daily Current Affairs और Current Affairs MCQ
        </p>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="ca-search-section">

        <div className="ca-search-box">

          <span className="ca-search-icon">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Current Affairs खोजें..."
            aria-label="Search Current Affairs"
          />

          {search && (
            <button
              type="button"
              className="ca-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="ca-category-section">

        <h2>
          📚 Categories
        </h2>

        <div className="ca-category-list">

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={
                selectedCategory === category
                  ? "ca-category-btn active"
                  : "ca-category-btn"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}

        </div>
      </section>

      {/* ================= LATEST CURRENT AFFAIRS ================= */}
      <section className="ca-latest-section">

        <div className="ca-latest-heading">

          <div>
            <h2>
              📰 Latest Current Affairs
            </h2>

            <span>
              {filteredArticles.length} Topics
            </span>
          </div>

        </div>

        {/* NO RESULT */}
        {filteredArticles.length === 0 ? (

          <div className="ca-no-result">

            <div className="ca-no-result-icon">
              🔍
            </div>

            <h3>
              कोई Current Affairs नहीं मिला
            </h3>

            <p>
              कृपया दूसरा शब्द या category चुनकर
              दोबारा प्रयास करें।
            </p>

          </div>

        ) : (

          <div className="ca-card-grid">

            {filteredArticles.map((article) => (

              <article
                className="ca-card"
                key={article.id}
              >

                {/* CARD TOP */}
                <div className="ca-card-top">

                  <span className="ca-card-category">
                    {article.category}
                  </span>

                  <span className="ca-card-date">
                    📅 {article.date}
                  </span>

                </div>

                {/* ICON */}
                <div className="ca-card-icon">
                  {article.icon}
                </div>

                {/* TITLE */}
                <h3>
                  {article.title}
                </h3>

                {/* DESCRIPTION */}
                <p>
                  {article.description}
                </p>

                {/* READ */}
                <button
                  type="button"
                  className="ca-read-button"
                  onClick={() => openArticle(article)}
                >
                  पढ़ें →
                </button>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* ================= DETAIL MODAL ================= */}
      {selectedArticle && (

        <div
          className="ca-modal-overlay"
          onClick={closeArticle}
        >

          <div
            className="ca-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE */}
            <button
              type="button"
              className="ca-modal-close"
              onClick={closeArticle}
              aria-label="Close"
            >
              ×
            </button>

            {/* MODAL HEADER */}
            <div className="ca-modal-header">

              <div className="ca-modal-icon">
                {selectedArticle.icon}
              </div>

              <div className="ca-modal-heading">

                <span className="ca-modal-category">
                  {selectedArticle.category}
                </span>

                <h2>
                  {selectedArticle.title}
                </h2>

                <div className="ca-modal-date">
                  📅 {selectedArticle.date}
                </div>

              </div>

            </div>

            {/* MODAL CONTENT */}
            <div className="ca-modal-content">

              <h3>
                📖 महत्वपूर्ण जानकारी
              </h3>

              <p>
                {selectedArticle.description}
              </p>

              <ul>

                {selectedArticle.points.map(
                  (point, index) => (
                    <li key={index}>
                      {point}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* ACTION BUTTONS */}
            <div className="ca-modal-actions">

              <button
                type="button"
                className="ca-mcq-button"
                onClick={goToMCQ}
              >
                📝 MCQ अभ्यास करें
              </button>

              <button
                type="button"
                className="ca-close-button"
                onClick={closeArticle}
              >
                बंद करें
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CurrentAffairs;

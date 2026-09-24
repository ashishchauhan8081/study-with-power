import React, { useMemo, useState } from "react";
import "./CurrentAffairs.css";

const currentAffairsData = [
  {
    id: 1,
    category: "National",
    emoji: "🇮🇳",
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
    emoji: "🌍",
    title: "अंतरराष्ट्रीय करंट अफेयर्स",
    description:
      "विश्व स्तर की महत्वपूर्ण घटनाओं, अंतरराष्ट्रीय संगठनों और विभिन्न देशों से संबंधित करंट अफेयर्स।",
    points: [
      "अंतरराष्ट्रीय संगठनों से संबंधित तथ्य।",
      "विभिन्न देशों की महत्वपूर्ण घटनाएँ।",
      "विश्व स्तर के महत्वपूर्ण समझौते एवं गतिविधियाँ।",
    ],
  },
  {
    id: 3,
    category: "Economy",
    emoji: "💰",
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
    emoji: "🔬",
    title: "विज्ञान एवं प्रौद्योगिकी",
    description:
      "विज्ञान, अंतरिक्ष, तकनीक, AI, ISRO, DRDO और नई तकनीकी उपलब्धियों से संबंधित महत्वपूर्ण घटनाएँ।",
    points: [
      "ISRO एवं अंतरिक्ष मिशन।",
      "AI और नई तकनीक।",
      "विज्ञान एवं तकनीकी उपलब्धियाँ।",
    ],
  },
  {
    id: 5,
    category: "Sports",
    emoji: "🏆",
    title: "खेल करंट अफेयर्स",
    description:
      "राष्ट्रीय और अंतरराष्ट्रीय खेल प्रतियोगिताओं, खिलाड़ियों, पुरस्कारों और रिकॉर्ड से संबंधित करंट अफेयर्स।",
    points: [
      "महत्वपूर्ण खेल प्रतियोगिताएँ।",
      "खिलाड़ियों एवं टीमों से संबंधित तथ्य।",
      "खेल पुरस्कार एवं रिकॉर्ड।",
    ],
  },
  {
    id: 6,
    category: "Awards",
    emoji: "🏅",
    title: "पुरस्कार एवं सम्मान",
    description:
      "राष्ट्रीय और अंतरराष्ट्रीय स्तर पर दिए जाने वाले महत्वपूर्ण पुरस्कारों एवं सम्मानों से संबंधित जानकारी।",
    points: [
      "राष्ट्रीय पुरस्कार एवं सम्मान।",
      "अंतरराष्ट्रीय पुरस्कार।",
      "महत्वपूर्ण व्यक्तियों एवं संस्थाओं से जुड़े सम्मान।",
    ],
  },
  {
    id: 7,
    category: "Government Schemes",
    emoji: "🏛️",
    title: "सरकारी योजनाएँ",
    description:
      "केंद्र एवं राज्य सरकार की महत्वपूर्ण योजनाओं, कार्यक्रमों और सरकारी पहलों से संबंधित करंट अफेयर्स।",
    points: [
      "केंद्र सरकार की प्रमुख योजनाएँ।",
      "राज्य सरकार की महत्वपूर्ण योजनाएँ।",
      "योजनाओं के उद्देश्य एवं लाभार्थी।",
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

function CurrentAffairs({ onBack, onMCQ, onOpenMCQ }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMCQ, setShowMCQ] = useState(false);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return currentAffairsData.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const searchMatch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.points.some((point) =>
          point.toLowerCase().includes(keyword)
        );

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  const handleMCQ = () => {
    /*
      अगर App.jsx से onMCQ या onOpenMCQ दिया गया है,
      तो वही function चलेगा।

      उदाहरण:
      <CurrentAffairs onMCQ={() => setPage("mcq")} />
    */

    if (typeof onMCQ === "function") {
      setSelectedItem(null);
      setShowMCQ(false);
      onMCQ(selectedItem);
      return;
    }

    if (typeof onOpenMCQ === "function") {
      setSelectedItem(null);
      setShowMCQ(false);
      onOpenMCQ(selectedItem);
      return;
    }

    // अगर App.jsx से navigation function नहीं आया है,
    // तो कम से कम MCQ Practice popup खुलेगा।
    setShowMCQ(true);
  };

  const handleRead = (item) => {
    setSelectedItem(item);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="current-affairs-page">

      {/* ================= HEADER ================= */}
      <div className="ca-header">

        <button
          type="button"
          className="ca-back-button"
          onClick={handleBack}
        >
          ← Home
        </button>

        <div className="ca-header-content">
          <div className="ca-header-icon">📰</div>

          <h1>Current Affairs</h1>

          <p>
            Daily Current Affairs और Current Affairs MCQ
          </p>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="ca-search-box">
        <span className="ca-search-icon">🔍</span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Current Affairs खोजें..."
          aria-label="Current Affairs खोजें"
        />

        {search && (
          <button
            type="button"
            className="ca-clear-search"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      {/* ================= CATEGORIES ================= */}
      <section className="ca-categories-section">

        <div className="ca-section-title">
          <span>📚</span>
          <h2>Categories</h2>
        </div>

        <div className="ca-category-list">

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`ca-category-button ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}

        </div>
      </section>

      {/* ================= RESULT INFO ================= */}
      <div className="ca-result-info">

        <span className="ca-topic-count">
          {filteredData.length} Topics
        </span>

        {search && (
          <span className="ca-search-result">
            "{search}" के परिणाम
          </span>
        )}

      </div>

      {/* ================= CURRENT AFFAIRS LIST ================= */}
      <section className="ca-list">

        {filteredData.length === 0 ? (
          <div className="ca-empty">

            <div className="ca-empty-icon">
              🔍
            </div>

            <h2>कोई परिणाम नहीं मिला</h2>

            <p>
              कृपया दूसरा keyword या category चुनें।
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              सभी Topics देखें
            </button>

          </div>
        ) : (
          filteredData.map((item) => (
            <article
              className="ca-card"
              key={item.id}
            >

              {/* CARD TOP */}
              <div className="ca-card-top">

                <span className="ca-badge">
                  {item.category}
                </span>

                <span className="ca-date">
                  📅 Today
                </span>

              </div>

              {/* EMOJI */}
              <div className="ca-card-emoji">
                {item.emoji}
              </div>

              {/* TITLE */}
              <h2 className="ca-card-title">
                {item.title}
              </h2>

              {/* DESCRIPTION */}
              <p className="ca-card-description">
                {item.description}
              </p>

              {/* BUTTON */}
              <button
                type="button"
                className="ca-read-button"
                onClick={() => handleRead(item)}
              >
                पढ़ें →
              </button>

            </article>
          ))
        )}

      </section>

      {/* ================= DETAIL MODAL ================= */}
      {selectedItem && !showMCQ && (
        <div
          className="ca-modal-overlay"
          onClick={handleClose}
        >

          <div
            className="ca-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="ca-modal-header">

              <div className="ca-modal-icon">
                {selectedItem.emoji}
              </div>

              <div className="ca-modal-heading">

                <span className="ca-modal-badge">
                  {selectedItem.category}
                </span>

                <h2>
                  {selectedItem.title}
                </h2>

              </div>

              <button
                type="button"
                className="ca-close-button"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* DATE */}
            <div className="ca-modal-date">
              📅 Today
            </div>

            {/* CONTENT */}
            <div className="ca-modal-content">

              <h3>
                📖 महत्वपूर्ण जानकारी
              </h3>

              <p>
                {selectedItem.description}
              </p>

              <ul>
                {selectedItem.points.map((point, index) => (
                  <li key={index}>
                    {point}
                  </li>
                ))}
              </ul>

            </div>

            {/* MODAL BUTTONS */}
            <div className="ca-modal-actions">

              <button
                type="button"
                className="ca-mcq-button"
                onClick={handleMCQ}
              >
                📝 MCQ अभ्यास करें
              </button>

              <button
                type="button"
                className="ca-close-bottom"
                onClick={handleClose}
              >
                बंद करें
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================= MCQ FALLBACK MODAL ================= */}
      {showMCQ && (
        <div
          className="ca-modal-overlay"
          onClick={() => setShowMCQ(false)}
        >

          <div
            className="ca-mcq-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="ca-mcq-close"
              onClick={() => setShowMCQ(false)}
            >
              ×
            </button>

            <div className="ca-mcq-icon">
              📝
            </div>

            <h2>
              MCQ अभ्यास
            </h2>

            <p>
              {selectedItem
                ? `${selectedItem.title} से संबंधित MCQ अभ्यास करें।`
                : "Current Affairs MCQ अभ्यास करें।"}
            </p>

            <div className="ca-mcq-info">

              <div>
                <strong>📚 Topic</strong>
                <span>
                  {selectedItem
                    ? selectedItem.category
                    : "Current Affairs"}
                </span>
              </div>

              <div>
                <strong>❓ Questions</strong>
                <span>10 MCQ</span>
              </div>

              <div>
                <strong>⏱️ Time</strong>
                <span>10 Minutes</span>
              </div>

            </div>

            <button
              type="button"
              className="ca-start-mcq"
              onClick={() => {
                if (typeof onMCQ === "function") {
                  setShowMCQ(false);
                  onMCQ(selectedItem);
                  return;
                }

                if (typeof onOpenMCQ === "function") {
                  setShowMCQ(false);
                  onOpenMCQ(selectedItem);
                  return;
                }

                alert(
                  "MCQ section को App.jsx से connect करना बाकी है।"
                );
              }}
            >
              🚀 MCQ शुरू करें
            </button>

            <button
              type="button"
              className="ca-mcq-back"
              onClick={() => setShowMCQ(false)}
            >
              वापस जाएँ
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default CurrentAffairs;

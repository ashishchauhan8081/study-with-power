import React, { useMemo, useState } from "react";
import "./CurrentAffairs.css";

const categories = [
  {
    id: "all",
    name: "All",
    icon: "📚",
  },

  {
    id: "national",
    name: "National",
    icon: "🇮🇳",
    title: "राष्ट्रीय करेंट अफेयर्स",
    description:
      "भारत की महत्वपूर्ण राष्ट्रीय घटनाओं, सरकारी निर्णयों और प्रमुख गतिविधियों से संबंधित करेंट अफेयर्स।",
    points: [
      "राष्ट्रीय स्तर की महत्वपूर्ण घटनाओं पर आधारित प्रश्न।",
      "सरकारी निर्णय एवं प्रमुख गतिविधियाँ।",
      "प्रतियोगी परीक्षाओं के लिए महत्वपूर्ण तथ्य।",
    ],
  },

  {
    id: "international",
    name: "International",
    icon: "🌍",
    title: "अंतरराष्ट्रीय करेंट अफेयर्स",
    description:
      "विश्व स्तर की महत्वपूर्ण घटनाओं, अंतरराष्ट्रीय संगठनों और विभिन्न देशों से संबंधित करेंट अफेयर्स।",
    points: [
      "अंतरराष्ट्रीय घटनाओं से संबंधित महत्वपूर्ण तथ्य।",
      "अंतरराष्ट्रीय संगठन एवं समझौते।",
      "विभिन्न देशों से संबंधित महत्वपूर्ण घटनाएँ।",
    ],
  },

  {
    id: "economy",
    name: "Economy",
    icon: "💰",
    title: "अर्थव्यवस्था करेंट अफेयर्स",
    description:
      "भारतीय अर्थव्यवस्था, बैंकिंग, वित्त, बजट और आर्थिक नीतियों से संबंधित महत्वपूर्ण करेंट अफेयर्स।",
    points: [
      "बैंकिंग और वित्त से संबंधित तथ्य।",
      "आर्थिक नीतियाँ एवं सरकारी योजनाएँ।",
      "बजट और अर्थव्यवस्था से संबंधित प्रश्न।",
    ],
  },

  {
    id: "science",
    name: "Science & Technology",
    icon: "🔬",
    title: "विज्ञान एवं प्रौद्योगिकी",
    description:
      "विज्ञान, अंतरिक्ष, तकनीक, AI और महत्वपूर्ण वैज्ञानिक उपलब्धियों से संबंधित करेंट अफेयर्स।",
    points: [
      "अंतरिक्ष एवं ISRO से संबंधित घटनाएँ।",
      "नई तकनीक एवं Artificial Intelligence।",
      "वैज्ञानिक खोज एवं महत्वपूर्ण उपलब्धियाँ।",
    ],
  },

  {
    id: "sports",
    name: "Sports",
    icon: "🏆",
    title: "खेल करेंट अफेयर्स",
    description:
      "राष्ट्रीय एवं अंतरराष्ट्रीय खेल प्रतियोगिताओं, खिलाड़ियों और महत्वपूर्ण खेल उपलब्धियों से संबंधित करेंट अफेयर्स।",
    points: [
      "महत्वपूर्ण खेल प्रतियोगिताएँ।",
      "खिलाड़ियों एवं पुरस्कारों से संबंधित तथ्य।",
      "राष्ट्रीय एवं अंतरराष्ट्रीय खेल उपलब्धियाँ।",
    ],
  },

  {
    id: "awards",
    name: "Awards",
    icon: "🏅",
    title: "पुरस्कार एवं सम्मान",
    description:
      "राष्ट्रीय एवं अंतरराष्ट्रीय पुरस्कारों, सम्मानों और महत्वपूर्ण उपलब्धियों से संबंधित करेंट अफेयर्स।",
    points: [
      "महत्वपूर्ण राष्ट्रीय पुरस्कार।",
      "अंतरराष्ट्रीय पुरस्कार एवं सम्मान।",
      "प्रमुख व्यक्तियों की उपलब्धियाँ।",
    ],
  },

  {
    id: "schemes",
    name: "Government Schemes",
    icon: "🏛️",
    title: "सरकारी योजनाएँ",
    description:
      "केंद्र एवं राज्य सरकार की महत्वपूर्ण योजनाओं, नीतियों और कार्यक्रमों से संबंधित करेंट अफेयर्स।",
    points: [
      "केंद्र सरकार की महत्वपूर्ण योजनाएँ।",
      "राज्य सरकार की प्रमुख योजनाएँ।",
      "योजनाओं के उद्देश्य एवं लाभार्थी।",
    ],
  },
];

function CurrentAffairs({ onBack, onMCQ }) {
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [selectedArticle, setSelectedArticle] =
    useState(null);

  const [search, setSearch] = useState("");

  const visibleCategories = useMemo(() => {
    let list = categories.filter(
      (item) => item.id !== "all"
    );

    if (selectedCategory !== "all") {
      list = list.filter(
        (item) => item.id === selectedCategory
      );
    }

    if (search.trim()) {
      const text = search.toLowerCase();

      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(text) ||
          item.title.toLowerCase().includes(text) ||
          item.description.toLowerCase().includes(text)
      );
    }

    return list;
  }, [selectedCategory, search]);

  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  // ============================================
  // MCQ BUTTON
  // ============================================

  const handleMCQ = () => {
    setSelectedArticle(null);

    if (typeof onMCQ === "function") {
      onMCQ();
    } else {
      console.warn(
        "onMCQ function App.jsx से नहीं मिला।"
      );
    }
  };

  return (
    <div className="current-affairs-page">

      {/* ================= HEADER ================= */}

      <section className="ca-header">

        <button
          className="back-button"
          onClick={() => {
            if (typeof onBack === "function") {
              onBack();
            } else {
              window.history.back();
            }
          }}
        >
          ← Home
        </button>

        <div className="ca-hero-icon">
          📰
        </div>

        <h1>
          Current Affairs
        </h1>

        <p>
          Daily Current Affairs और Current Affairs MCQ
        </p>

      </section>

      {/* ================= SEARCH ================= */}

      <section className="ca-search-section">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="🔎 Current Affairs खोजें..."
          className="ca-search"
        />

      </

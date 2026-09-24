import React from "react";

export default function QuestionsForm({
  question,
  questionNumber,
  onQuestionChange,
  onOptionChange,
}) {
  if (!question) return null;

  return (
    <div className="question-form">
      <div className="form-group form-group-full">
        <label>❓ Question {questionNumber}</label>

        <textarea
          rows={4}
          placeholder="यहाँ प्रश्न लिखें..."
          value={question.question || ""}
          onChange={(e) =>
            onQuestionChange("question", e.target.value)
          }
        />
      </div>

      <div className="options-editor">
        <h3>🔤 Options</h3>

        {question.options.map((option, index) => (
          <div className="option-row" key={index}>
            <div className="option-label">
              {String.fromCharCode(65 + index)}
            </div>

            <input
              type="text"
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              value={option || ""}
              onChange={(e) =>
                onOptionChange(index, e.target.value)
              }
            />

            <label className="correct-option">
              <input
                type="radio"
                name={`correct-answer-${question.id}`}
                checked={Number(question.answer) === index}
                onChange={() =>
                  onQuestionChange("answer", index)
                }
              />

              <span>सही</span>
            </label>
          </div>
        ))}
      </div>

      <div className="form-group form-group-full">
        <label>💡 सही उत्तर की व्याख्या</label>

        <textarea
          rows={4}
          placeholder="सही उत्तर की व्याख्या लिखें..."
          value={question.explanation || ""}
          onChange={(e) =>
            onQuestionChange("explanation", e.target.value)
          }
        />
      </div>

      <div className="form-group form-group-full">
        <label>🖼️ Explanation Image URL (Optional)</label>

        <input
          type="text"
          placeholder="https://..."
          value={question.explanationImage || ""}
          onChange={(e) =>
            onQuestionChange(
              "explanationImage",
              e.target.value
            )
          }
        />
      </div>
    </div>
  );
}

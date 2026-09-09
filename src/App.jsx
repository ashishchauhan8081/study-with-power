from pathlib import Path

src = Path("/mnt/data/Pasted text(20260909-105014).txt")
out = Path("/mnt/data/App_FIXED.jsx")

code = src.read_text(encoding="utf-8-sig")

# 1) Keep the Test page inside a controlled full-width page container.
code = code.replace(
'''    return (
      <div className="app">

        <style>{styles}</style>

        <TestRunner
          test={selectedTest}
          onBack={() => {
            setPage("tests");
          }}
        />

      </div>
    );''',
'''    return (
      <div className="app test-page-app">

        <style>{styles}</style>

        <main className="test-page-container">
          <TestRunner
            test={selectedTest}
            onBack={() => {
              setPage("tests");
            }}
          />
        </main>

      </div>
    );'''
)

# 2) Replace TestRunner outer wrappers with stable responsive classes.
code = code.replace(
'''      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>''',
'''      <div className="test-runner-page">'''
)

code = code.replace(
'''    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>''',
'''    <div className="test-runner-page">'''
)

# 3) Fix the main Test panel: no visible overflow.
code = code.replace(
'''      <div style={{ width: "100%", background: "#fff", border: "1px solid #dbe3ee", borderRadius: "18px", padding: "30px", boxSizing: "border-box", overflow: "visible", display: "block" }}>''',
'''      <div className="test-runner-shell">'''
)

# 4) Make the result card and empty state robust on narrow screens.
code = code.replace(
'''<div style={{ maxWidth: "760px", margin: "30px auto", background: "#fff", borderRadius: "18px", padding: "35px", textAlign: "center", boxSizing: "border-box", boxShadow: "0 10px 35px rgba(0,0,0,.10)" }}>''',
'''<div className="test-result-card">'''
)

code = code.replace(
'''<div style={{ background: "#fff", border: "1px solid #dbe3ee", borderRadius: "16px", padding: "50px 20px", textAlign: "center" }}>''',
'''<div className="test-empty-card">'''
)

# 5) Prevent long test titles/question text from forcing the page wider.
code = code.replace(
'''<div style={{ width: "100%", display: "block", borderBottom: "1px solid #e2e8f0", paddingBottom: "18px", marginBottom: "28px" }}>''',
'''<div className="test-header-block">'''
)

code = code.replace(
'''<div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>''',
'''<div className="test-exam-name">'''
)

code = code.replace(
'''<div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", lineHeight: "1.4", marginTop: "4px" }}>''',
'''<div className="test-title-name">'''
)

code = code.replace(
'''<div style={{ fontSize: "18px", fontWeight: "700", color: "#334155", marginTop: "6px" }}>''',
'''<div className="test-progress-text">'''
)

code = code.replace(
'''<div style={{ width: "100%", display: "block", marginBottom: "28px" }}>
          <h2 style={{ width: "100%", margin: 0, padding: 0, color: "#111827", textAlign: "left", fontSize: "28px", fontWeight: "600", lineHeight: "1.6", wordBreak: "break-word", overflowWrap: "anywhere" }}>''',
'''<div className="test-question-block">
          <h2 className="test-question-text">'''
)

# 6) Make options/navigation explicitly shrinkable and wrap safely.
code = code.replace(
'''<div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "14px", width: "100%", clear: "both" }}>''',
'''<div className="test-options-list">'''
)

code = code.replace(
'''style={{
                  ...buttonBase,
                  display: "flex",''',
'''style={{
                  ...buttonBase,
                  minWidth: 0,
                  maxWidth: "100%",
                  display: "flex",'''
)

code = code.replace(
'''<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "15px", marginTop: "30px" }}>''',
'''<div className="test-navigation">'''
)

# 7) Add a strong final responsive layer before the closing styles template.
marker = '\n`;'
responsive_css = r'''
/* =========================================================
   TEST PAGE RESPONSIVE / OVERFLOW FIX
   ========================================================= */

html,
body,
#root,
.app {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden !important;
}

.test-page-app {
  width: 100%;
  min-width: 0;
  overflow-x: hidden !important;
}

.test-page-container {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.test-runner-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.test-runner-shell {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 18px;
  padding: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.test-header-block,
.test-question-block,
.test-options-list,
.test-navigation {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.test-header-block {
  display: block;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 18px;
  margin-bottom: 28px;
}

.test-exam-name,
.test-title-name,
.test-progress-text,
.test-question-text {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-exam-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.test-title-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  margin-top: 4px;
}

.test-progress-text {
  font-size: 18px;
  font-weight: 700;
  color: #334155;
  margin-top: 6px;
}

.test-question-block {
  display: block;
  margin-bottom: 28px;
}

.test-question-text {
  width: 100%;
  margin: 0;
  padding: 0;
  color: #111827;
  text-align: left;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 600;
  line-height: 1.6;
}

.test-options-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  clear: both;
}

.test-options-list > button {
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

.test-options-list > button > span {
  min-width: 0 !important;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.test-navigation > button {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.test-result-card {
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 30px auto;
  background: #fff;
  border-radius: 18px;
  padding: 35px;
  text-align: center;
  box-sizing: border-box;
  box-shadow: 0 10px 35px rgba(0,0,0,.10);
  overflow: hidden;
}

.test-empty-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  padding: 50px 20px;
  text-align: center;
  box-sizing: border-box;
  overflow: hidden;
}

.test-result-card h1,
.test-result-card h2,
.test-result-card p,
.test-result-card div {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.test-runner-page .back {
  max-width: 100%;
  box-sizing: border-box;
}

.test-runner-page button {
  max-width: 100%;
}

@media (max-width: 700px) {
  .test-page-container {
    padding: 12px;
  }

  .test-runner-shell {
    padding: 18px 14px;
    border-radius: 14px;
  }

  .test-header-block {
    margin-bottom: 20px;
    padding-bottom: 14px;
  }

  .test-exam-name {
    font-size: 19px;
  }

  .test-title-name {
    font-size: 17px;
  }

  .test-progress-text {
    font-size: 15px;
  }

  .test-question-block {
    margin-bottom: 20px;
  }

  .test-question-text {
    font-size: 20px;
    line-height: 1.5;
  }

  .test-options-list {
    gap: 10px;
  }

  .test-options-list > button {
    min-height: 56px !important;
    padding: 13px 12px !important;
    font-size: 16px !important;
  }

  .test-options-list > button > span:first-child {
    flex: 0 0 32px !important;
    width: 32px !important;
    font-size: 17px !important;
  }

  .test-navigation {
    align-items: stretch;
  }

  .test-navigation > button {
    flex: 1 1 140px;
    padding: 11px 12px !important;
    font-size: 15px !important;
  }

  .test-navigation > div {
    width: 100%;
    text-align: center;
    order: 3;
  }

  .test-result-card {
    padding: 24px 15px;
    margin: 15px auto;
  }
}

@media (max-width: 420px) {
  .test-page-container {
    padding: 8px;
  }

  .test-runner-shell {
    padding: 14px 10px;
  }

  .test-options-list > button {
    padding: 12px 10px !important;
    font-size: 15px !important;
  }

  .test-navigation > button {
    flex-basis: 100%;
  }
}
'''
if responsive_css not in code:
    code = code.replace(marker, responsive_css + marker)

# 8) Strengthen the existing test-grid rules without changing its basic design.
code = code.replace(
''' .test-grid {
   display: grid;
   grid-template-columns:
     repeat(5, 1fr);
   gap: 14px;
 }'''.lstrip(),
''' .test-grid {
   display: grid;
   grid-template-columns:
     repeat(5, minmax(0, 1fr));
   gap: 14px;
   width: 100%;
   max-width: 100%;
   min-width: 0;
   box-sizing: border-box;
 }'''.lstrip()
)

# Ensure test cards themselves cannot push the page wider.
extra_test_css = r'''
.test-card {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.test-card h3,
.test-card p,
.test-card .price,
.test-card button {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
}

.test-card button {
  width: 100%;
}
'''
if extra_test_css not in code:
    code = code.replace(responsive_css, responsive_css + "\n" + extra_test_css)

out.write_text(code, encoding="utf-8")
print(f"पूरा corrected App.jsx तैयार है: {out}")
print(f"कुल lines: {len(code.splitlines())}")

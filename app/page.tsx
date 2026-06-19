"use client";

import { useState } from "react";

type Card = { label: string; description: string };
type EylfOutcome = { outcome: string; explanation: string };
type SupportingItem = { name: string; detail: string };
type SupportingGroup = { type: string; items: SupportingItem[] };

type GenerateResult = {
  cards: Card[];
  eylfOutcomes: EylfOutcome[];
  howToUse: string;
  supportingText: SupportingGroup[];
};

const PRESET_THEMES = [
  "Café / Coffee Shop",
  "Restaurant",
  "Supermarket",
  "Doctor's Office",
  "Farm",
  "Post Office",
];

const AGE_GROUPS = ["Toddler (1-2)", "Preschool (3-4)", "Kindergarten (5)"];

const card =
  "bg-white rounded-2xl p-6 shadow-sm border border-[#EDE8DF]";

const inputStyle: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  border: "1.5px solid #B5C9B7",
  color: "#3D3D3D",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  width: "100%",
  fontSize: "1rem",
  outline: "none",
};

export default function Home() {
  const [theme, setTheme] = useState(PRESET_THEMES[0]);
  const [customTheme, setCustomTheme] = useState("");
  const [cardCount, setCardCount] = useState(12);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const effectiveTheme = customTheme.trim() || theme;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setRating(null);
    setFeedbackText("");
    setFeedbackSubmitted(false);
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: effectiveTheme, cardCount, ageGroup }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Generation failed — please try again.");
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setRating(null);
    setFeedbackText("");
    setFeedbackSubmitted(false);
    setCopied(false);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const lines: string[] = [
      `RESOURCE SPARK — ${effectiveTheme.toUpperCase()} (${ageGroup})`,
      "=".repeat(52),
      "",
      `CARD LIST (${result.cards.length} cards)`,
      "-".repeat(24),
      ...result.cards.map((c, i) => `${i + 1}. ${c.label} — ${c.description}`),
      "",
      "EYLF OUTCOMES",
      "-".repeat(24),
      ...result.eylfOutcomes.flatMap((o) => [`• ${o.outcome}`, `  ${o.explanation}`, ""]),
      "HOW TO USE THIS PACK",
      "-".repeat(24),
      result.howToUse,
    ];

    if (result.supportingText?.length) {
      lines.push("", "SUPPORTING TEXT", "-".repeat(24));
      result.supportingText.forEach((g) => {
        lines.push(`${g.type}:`);
        g.items.forEach((item) =>
          lines.push(`  • ${item.name}${item.detail ? ` — ${item.detail}` : ""}`)
        );
        lines.push("");
      });
    }

    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = () => {
    console.log("Resource Spark feedback", {
      rating,
      theme: effectiveTheme,
      ageGroup,
      cardCount,
      feedback: feedbackText,
      timestamp: new Date().toISOString(),
    });
    setFeedbackSubmitted(true);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FAF8F5" }}>
      {/* Header */}
      <header
        style={{ backgroundColor: "#B5C9B7", padding: "2.5rem 1.5rem", textAlign: "center" }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "#3D3D3D",
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          Resource Spark
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#3D3D3D", opacity: 0.85 }}>
          Turn your idea into a ready-to-build resource pack in seconds
        </p>
      </header>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Explainer */}
        <p
          style={{
            textAlign: "center",
            color: "#3D3D3D",
            opacity: 0.75,
            marginBottom: "2.5rem",
            lineHeight: 1.6,
          }}
        >
          Pick a theme below, or type your own, and we&apos;ll generate the card list, learning
          outcomes, and instructions — so you can go straight into Canva.
        </p>

        {/* Tips panel */}
        <div
          style={{
            backgroundColor: "#EDE8DF",
            borderRadius: "1rem",
            marginBottom: "1.5rem",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setTipsOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#3D3D3D" }}>
              💡 What makes a resource pack sell well
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#3D3D3D",
                opacity: 0.55,
                flexShrink: 0,
                transition: "transform 0.2s",
                display: "inline-block",
                transform: tipsOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </span>
          </button>

          {tipsOpen && (
            <div style={{ padding: "0 1.25rem 1.25rem" }}>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { bold: "Bundle, don’t single-sell.", text: "Buyers want value — a themed bundle (e.g. 3 related sub-themes like café + restaurant + supermarket) outsells a single small set at a higher price point." },
                  { bold: "10–15 cards per theme is the sweet spot.", text: "Enough to feel substantial without being overwhelming to design or use." },
                  { bold: "Low prep, high engagement wins.", text: "Resources that are “just laminate and play” get called out positively in reviews — avoid anything that needs lots of setup." },
                  { bold: "Name the framework directly.", text: "If your resource supports EYLF outcomes, say so explicitly and confidently — don’t just hint at “learning outcomes.”" },
                  { bold: "Cohesive, branded visuals beat generic AI-look images.", text: "A consistent illustration style across the whole pack signals quality more than any single great image." },
                  { bold: "Clear “how it works” instructions reduce bad reviews.", text: "Buyer confusion about digital delivery (Canva links, printing, editing) is one of the most common sources of complaints — spell it out clearly." },
                ].map((tip, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.625rem", fontSize: "0.875rem", color: "#3D3D3D", lineHeight: 1.55 }}>
                    <span style={{ color: "#B5C9B7", flexShrink: 0, marginTop: "0.05em" }}>•</span>
                    <span>
                      <strong>{tip.bold}</strong>{" "}{tip.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Form */}
        {!result && (
          <div className={card} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Theme dropdown */}
            <div>
              <label
                htmlFor="theme-select"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#3D3D3D" }}
              >
                Choose a theme
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={inputStyle}
              >
                {PRESET_THEMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Custom theme */}
            <div>
              <label
                htmlFor="custom-theme"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem", color: "#3D3D3D" }}
              >
                Or describe your own theme
              </label>
              <p style={{ fontSize: "0.8125rem", color: "#3D3D3D", opacity: 0.6, marginBottom: "0.5rem", lineHeight: 1.4 }}>
                The more detail you give, the better your pack will be.
              </p>
              <textarea
                id="custom-theme"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="e.g. Vet clinic dramatic play — checking up on stuffed animals, taking temperatures, giving pretend vaccinations"
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.55,
                  minHeight: "6rem",
                }}
              />
            </div>

            {/* Age group + card count */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="age-group"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#3D3D3D" }}
                >
                  Age group
                </label>
                <select
                  id="age-group"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  style={inputStyle}
                >
                  {AGE_GROUPS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="card-count"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", color: "#3D3D3D" }}
                >
                  Cards per pack
                </label>
                <input
                  id="card-count"
                  type="number"
                  value={cardCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setCardCount(Math.min(20, Math.max(6, v)));
                  }}
                  min={6}
                  max={20}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                backgroundColor: "#D4A5A5",
                color: "#3D3D3D",
                border: "none",
                borderRadius: "0.75rem",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "opacity 0.15s, transform 0.1s",
                width: "100%",
              }}
            >
              {isLoading ? "Generating your resource pack…" : "Generate my resource pack"}
            </button>

            {error && (
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#c0392b" }}>{error}</p>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#3D3D3D" }}>
                {effectiveTheme} — {ageGroup}
              </h2>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={handleCopyAll}
                  style={{
                    backgroundColor: "#EDE8DF",
                    color: "#3D3D3D",
                    border: "none",
                    borderRadius: "0.625rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied!" : "Copy all"}
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: "#B5C9B7",
                    color: "#3D3D3D",
                    border: "none",
                    borderRadius: "0.625rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Generate another
                </button>
              </div>
            </div>

            {/* Card list */}
            <div className={card}>
              <h3
                style={{ fontSize: "1rem", fontWeight: 600, color: "#3D3D3D", marginBottom: "1rem" }}
              >
                Card List ({result.cards.length} cards)
              </h3>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {result.cards.map((c, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", color: "#3D3D3D", lineHeight: 1.5 }}
                  >
                    <span
                      style={{ color: "#B5C9B7", fontWeight: 600, minWidth: "1.5rem", textAlign: "right", flexShrink: 0 }}
                    >
                      {i + 1}.
                    </span>
                    <span>
                      <strong>{c.label}</strong>
                      {" — "}
                      <span style={{ opacity: 0.75 }}>{c.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* EYLF outcomes */}
            <div className={card}>
              <h3
                style={{ fontSize: "1rem", fontWeight: 600, color: "#3D3D3D", marginBottom: "1rem" }}
              >
                EYLF Outcomes
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.eylfOutcomes.map((o, i) => (
                  <div key={i}>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#3D3D3D", marginBottom: "0.25rem" }}>
                      {o.outcome}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#3D3D3D", opacity: 0.72, lineHeight: 1.55 }}>
                      {o.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to use */}
            <div
              style={{
                backgroundColor: "#EDE8DF",
                borderRadius: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{ fontSize: "1rem", fontWeight: 600, color: "#3D3D3D", marginBottom: "0.75rem" }}
              >
                How to use this pack
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#3D3D3D", lineHeight: 1.65 }}>
                {result.howToUse}
              </p>
            </div>

            {/* Supporting text */}
            {result.supportingText?.length > 0 && (
              <div className={card}>
                <h3
                  style={{ fontSize: "1rem", fontWeight: 600, color: "#3D3D3D", marginBottom: "1rem" }}
                >
                  Supporting Text Content
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {result.supportingText.map((group, i) => (
                    <div key={i}>
                      <p
                        style={{ fontSize: "0.8rem", fontWeight: 700, color: "#B5C9B7", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}
                      >
                        {group.type}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        {group.items.map((item, j) => (
                          <div
                            key={j}
                            style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#3D3D3D", gap: "1rem" }}
                          >
                            <span>{item.name}</span>
                            {item.detail && (
                              <span style={{ opacity: 0.6, flexShrink: 0 }}>{item.detail}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className={card}>
              <h3
                style={{ fontSize: "1rem", fontWeight: 600, color: "#3D3D3D", marginBottom: "1rem" }}
              >
                Was this useful?
              </h3>

              {feedbackSubmitted ? (
                <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "#B5C9B7" }}>
                  Thanks for the feedback! It really helps.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Star rating */}
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        title={`${star} star${star !== 1 ? "s" : ""}`}
                        style={{
                          fontSize: "1.75rem",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: rating !== null && star <= rating ? "#D4A5A5" : "#ddd",
                          transition: "color 0.1s, transform 0.1s",
                          padding: "0 0.1rem",
                          lineHeight: 1,
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label
                      htmlFor="feedback-text"
                      style={{ display: "block", fontSize: "0.875rem", color: "#3D3D3D", marginBottom: "0.5rem", opacity: 0.8 }}
                    >
                      What would make this more useful? (optional)
                    </label>
                    <textarea
                      id="feedback-text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Your thoughts here…"
                      rows={3}
                      style={{
                        ...inputStyle,
                        resize: "none",
                        lineHeight: 1.5,
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={rating === null}
                    style={{
                      backgroundColor: rating !== null ? "#D4A5A5" : "#EDE8DF",
                      color: "#3D3D3D",
                      border: "none",
                      borderRadius: "0.625rem",
                      padding: "0.625rem 1.25rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: rating !== null ? "pointer" : "not-allowed",
                      opacity: rating === null ? 0.5 : 1,
                      alignSelf: "flex-start",
                      transition: "opacity 0.15s",
                    }}
                  >
                    Submit feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

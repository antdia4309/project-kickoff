import { useState } from "react";

const phases = [
  {
    id: "identity",
    number: "01",
    label: "PROJECT IDENTITY",
    color: "#F59E0B",
    icon: "◈",
    fields: [
      { id: "name", label: "Project Name", type: "text", placeholder: "e.g. CodeQuest, PortfolioV2..." },
      { id: "problem", label: "Problem It Solves", type: "textarea", placeholder: "What pain point does this address?" },
      { id: "audience", label: "Who It's For", type: "text", placeholder: "Target user / stakeholder" },
      { id: "success", label: "What Does Success Look Like?", type: "textarea", placeholder: "Define done. What's the measurable outcome?" },
    ],
  },
  {
    id: "constraints",
    number: "02",
    label: "TECH & CONSTRAINTS",
    color: "#3B82F6",
    icon: "⬡",
    fields: [
      { id: "stack", label: "Tech Stack", type: "text", placeholder: "e.g. React, Node, Tailwind, C#..." },
      { id: "structure", label: "File / Folder Structure", type: "textarea", placeholder: "Any existing structure or convention to follow?" },
      { id: "design", label: "Design System / Style Guide", type: "text", placeholder: "Colors, fonts, component library..." },
      { id: "conventions", label: "Naming & Coding Conventions", type: "text", placeholder: "e.g. camelCase, BEM, PascalCase components..." },
    ],
  },
  {
    id: "scope",
    number: "03",
    label: "SCOPE DEFINITION",
    color: "#10B981",
    icon: "◎",
    fields: [
      { id: "in_scope", label: "In Scope (Must Haves)", type: "textarea", placeholder: "Core features for this session / project..." },
      { id: "out_scope", label: "Out of Scope (Not Now)", type: "textarea", placeholder: "What are we deliberately NOT building yet?" },
      { id: "priority", label: "Priority Order", type: "textarea", placeholder: "Rank features: #1 most critical → #N nice-to-have" },
    ],
  },
  {
    id: "sessions",
    number: "04",
    label: "SESSION BREAKDOWN",
    color: "#8B5CF6",
    icon: "▣",
    fields: [
      { id: "session1", label: "Session 1 Focus", type: "text", placeholder: "e.g. Core data model + API scaffold" },
      { id: "session2", label: "Session 2 Focus", type: "text", placeholder: "e.g. UI shell + routing" },
      { id: "session3", label: "Session 3 Focus", type: "text", placeholder: "e.g. Feature A implementation" },
      { id: "session4", label: "Session 4+ / Future", type: "textarea", placeholder: "Remaining sessions or phases..." },
    ],
  },
  {
    id: "authority",
    number: "05",
    label: "DECISION AUTHORITY",
    color: "#EF4444",
    icon: "◆",
    fields: [
      { id: "autonomous", label: "Claude Can Decide Autonomously", type: "textarea", placeholder: "e.g. Code style, component structure, minor UX choices..." },
      { id: "checkin", label: "Must Check In First", type: "textarea", placeholder: "e.g. Architecture changes, new dependencies, data schema..." },
      { id: "hardno", label: "Hard No's / Don't Touch", type: "textarea", placeholder: "e.g. Don't refactor X, don't change the DB schema..." },
    ],
  },
  {
    id: "context",
    number: "06",
    label: "CONTEXT & OUTPUT",
    color: "#F97316",
    icon: "◉",
    fields: [
      { id: "existing", label: "Existing Codebase / Files to Know About", type: "textarea", placeholder: "Key files, patterns, or components I should understand..." },
      { id: "output_format", label: "Preferred Output Format", type: "text", placeholder: "e.g. Artifact, file download, code snippet, explanation..." },
      { id: "notes", label: "Other Notes / Context", type: "textarea", placeholder: "Anything else I should know before we start?" },
    ],
  },
];

const Connector = ({ color }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 auto", width: 2 }}>
    <div style={{ width: 2, height: 20, background: `linear-gradient(to bottom, ${color}88, #ffffff22)` }} />
    <div style={{ fontSize: 10, color: "#ffffff44", marginBottom: 2 }}>▼</div>
  </div>
);

export default function ProjectKickoffTemplate() {
  const [values, setValues] = useState({});
  const [expanded, setExpanded] = useState({ identity: true });
  const [copied, setCopied] = useState(false);

  const handleChange = (phaseId, fieldId, val) => {
    setValues((prev) => ({ ...prev, [`${phaseId}_${fieldId}`]: val }));
  };

  const togglePhase = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    phases.forEach((p) => (all[p.id] = true));
    setExpanded(all);
  };

  const collapseAll = () => setExpanded({});

  const exportText = () => {
    let out = "═══════════════════════════════════════\n";
    out += "       PROJECT KICKOFF TEMPLATE\n";
    out += "═══════════════════════════════════════\n\n";
    phases.forEach((phase) => {
      out += `[ ${phase.number} ] ${phase.label}\n`;
      out += "─────────────────────────────────\n";
      phase.fields.forEach((f) => {
        const val = values[`${phase.id}_${f.id}`] || "(not filled)";
        out += `${f.label}:\n${val}\n\n`;
      });
      out += "\n";
    });
    navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    if (window.confirm("Clear all fields?")) setValues({});
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        fontFamily: "'Courier New', monospace",
        padding: "32px 16px 64px",
        color: "#E2E8F0",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 680, margin: "0 auto 36px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#F59E0B", marginBottom: 8, textTransform: "uppercase" }}>
          ◈ Antonio's Standard
        </div>
        <h1
          style={{
            fontSize: "clamp(22px, 5vw, 36px)",
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: "uppercase",
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Project Kickoff Template
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, letterSpacing: 1, margin: 0 }}>
          Set the standard. Maximize the session. Ship with confidence.
        </p>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          {[
            { label: "Expand All", action: expandAll, color: "#1E293B" },
            { label: "Collapse All", action: collapseAll, color: "#1E293B" },
            { label: copied ? "✓ Copied!" : "Copy to Clipboard", action: exportText, color: "#F59E0B", textColor: "#0A0A0F" },
            { label: "Clear All", action: clearAll, color: "#1E1020" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{
                background: btn.color,
                color: btn.textColor || "#CBD5E1",
                border: `1px solid ${btn.textColor ? btn.color : "#334155"}`,
                padding: "6px 14px",
                fontSize: 11,
                letterSpacing: 1,
                cursor: "pointer",
                textTransform: "uppercase",
                fontFamily: "inherit",
                fontWeight: 700,
                transition: "all 0.15s",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flowchart */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {phases.map((phase, idx) => {
          const isOpen = expanded[phase.id];
          const completedFields = phase.fields.filter((f) => values[`${phase.id}_${f.id}`]?.trim()).length;
          const total = phase.fields.length;

          return (
            <div key={phase.id}>
              {/* Phase Card */}
              <div
                style={{
                  border: `1px solid ${isOpen ? phase.color + "66" : "#1E293B"}`,
                  background: isOpen ? `${phase.color}08` : "#0F1117",
                  transition: "all 0.2s",
                  overflow: "hidden",
                }}
              >
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 20, color: phase.color, lineHeight: 1 }}>{phase.icon}</span>
                  <span style={{ fontSize: 11, color: phase.color, letterSpacing: 3, fontWeight: 900, flex: 1 }}>
                    {phase.number} — {phase.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: completedFields === total ? "#10B981" : "#475569",
                      letterSpacing: 1,
                      marginRight: 12,
                    }}
                  >
                    {completedFields}/{total}
                  </span>
                  <span style={{ color: phase.color, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Progress bar */}
                <div style={{ height: 2, background: "#1E293B" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(completedFields / total) * 100}%`,
                      background: phase.color,
                      transition: "width 0.3s",
                    }}
                  />
                </div>

                {/* Fields */}
                {isOpen && (
                  <div style={{ padding: "16px 20px 20px" }}>
                    {phase.fields.map((field) => {
                      const key = `${phase.id}_${field.id}`;
                      return (
                        <div key={field.id} style={{ marginBottom: 16 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 10,
                              letterSpacing: 2,
                              color: "#94A3B8",
                              textTransform: "uppercase",
                              marginBottom: 6,
                              fontWeight: 700,
                            }}
                          >
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              value={values[key] || ""}
                              onChange={(e) => handleChange(phase.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              rows={3}
                              style={{
                                width: "100%",
                                background: "#0A0A0F",
                                border: `1px solid ${values[key] ? phase.color + "55" : "#1E293B"}`,
                                color: "#E2E8F0",
                                padding: "10px 12px",
                                fontSize: 13,
                                fontFamily: "inherit",
                                resize: "vertical",
                                outline: "none",
                                lineHeight: 1.6,
                                boxSizing: "border-box",
                                transition: "border-color 0.15s",
                              }}
                            />
                          ) : (
                            <input
                              type="text"
                              value={values[key] || ""}
                              onChange={(e) => handleChange(phase.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              style={{
                                width: "100%",
                                background: "#0A0A0F",
                                border: `1px solid ${values[key] ? phase.color + "55" : "#1E293B"}`,
                                color: "#E2E8F0",
                                padding: "10px 12px",
                                fontSize: 13,
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.15s",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Connector between cards */}
              {idx < phases.length - 1 && <Connector color={phase.color} />}
            </div>
          );
        })}

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            border: "1px solid #1E293B",
            padding: "16px 20px",
            textAlign: "center",
            background: "#0F1117",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#475569", textTransform: "uppercase" }}>
            ◈ When all phases are complete — paste into your first message to Claude ◈
          </div>
        </div>
      </div>
    </div>
  );
}
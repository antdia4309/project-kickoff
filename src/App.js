import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Copy, Download, FileText, Info, Plus, RotateCcw, X } from "lucide-react";

/* ---------- Content ---------- */

const PHASES = [
  {
    id: "identity",
    short: "Identity",
    title: "What are we building?",
    intro: "Start with the why. If you only have five minutes, fill in the fields marked with a yellow dot.",
    fields: [
      { id: "name", label: "Project name", type: "text", placeholder: "e.g. Vendor onboarding portal", key: true },
      { id: "problem", label: "What problem does it solve?", type: "textarea", placeholder: "Describe the pain point in a sentence or two.", key: true },
      { id: "audience", label: "Who is it for?", type: "text", placeholder: "e.g. Internal billing team, first-time home buyers" },
      { id: "success", label: "How will you know it worked?", type: "textarea", placeholder: "A measurable outcome, e.g. 'Users finish setup in under 5 minutes.'", key: true },
    ],
  },
  {
    id: "tech",
    short: "Tech & constraints",
    title: "Tech and constraints",
    intro: "What's already decided, so nobody re-litigates it later.",
    fields: [
      { id: "stack", label: "Tech stack", type: "text", placeholder: "e.g. React, Node, Postgres, C#", key: true },
      { id: "structure", label: "File or folder structure", type: "textarea", placeholder: "Any existing layout or convention to follow?" },
      { id: "design", label: "Design system or style guide", type: "text", placeholder: "Colors, fonts, component library" },
      { id: "conventions", label: "Naming and coding conventions", type: "text", placeholder: "e.g. camelCase variables, PascalCase components" },
    ],
  },
  {
    id: "scope",
    short: "Scope",
    title: "Scope",
    intro: "Saying what you won't build is just as useful as saying what you will. One item per line works best.",
    fields: [
      { id: "in", label: "In scope", type: "textarea", placeholder: "The must-haves for this version, one per line.", key: true },
      { id: "out", label: "Out of scope, for now", type: "textarea", placeholder: "Things you're deliberately leaving out." },
      { id: "priority", label: "Priority order", type: "textarea", placeholder: "Most critical first, nice-to-haves last." },
    ],
  },
  {
    id: "sessions",
    short: "Work plan",
    title: "Break the work into sessions",
    intro: "Small, focused chunks. Each one should end with something you can see or test.",
    fields: [
      { id: "list", label: "Sessions", type: "list" },
      { id: "later", label: "Later, or future phases", type: "textarea", placeholder: "Anything beyond the first few sessions." },
    ],
  },
  {
    id: "authority",
    short: "Decisions",
    title: "Who decides what",
    intro: "Applies to an AI assistant or a teammate. Clear lines here save a lot of back-and-forth.",
    fields: [
      { id: "free", label: "Can decide without asking", type: "textarea", placeholder: "e.g. Code style, component structure, small UX choices" },
      { id: "ask", label: "Check in first", type: "textarea", placeholder: "e.g. New dependencies, data model changes, architecture" },
      { id: "never", label: "Don't touch", type: "textarea", placeholder: "e.g. Don't refactor the auth module, don't change the DB schema" },
    ],
  },
  {
    id: "risks",
    short: "Risks & questions",
    title: "Risks and open questions",
    intro: "What could slow you down, and what you still don't know.",
    fields: [
      { id: "assumptions", label: "Assumptions", type: "textarea", placeholder: "Things you're treating as true but haven't confirmed." },
      { id: "dependencies", label: "Dependencies", type: "textarea", placeholder: "Other teams, systems, APIs, or approvals you're waiting on." },
      { id: "risks", label: "Risks", type: "textarea", placeholder: "What could go wrong, and how bad would it be?" },
      { id: "questions", label: "Open questions", type: "textarea", placeholder: "Decisions still pending, and who owns them." },
    ],
  },
  {
    id: "context",
    short: "Context",
    title: "Context and output",
    intro: "Last bit. Point to what already exists and say what you want back.",
    fields: [
      { id: "existing", label: "Existing code or files to know about", type: "textarea", placeholder: "Key files, patterns, or components." },
      { id: "format", label: "Preferred output", type: "text", placeholder: "e.g. Full files, code snippets, a short explanation" },
      { id: "notes", label: "Anything else?", type: "textarea", placeholder: "Context that didn't fit anywhere above." },
    ],
  },
];

const EXAMPLE = {
  values: {
    "identity.name": "Neighborhood Park Finder",
    "identity.problem": "Families and dog owners can't easily tell which nearby parks have playgrounds, off-leash areas, or good walking loops.",
    "identity.audience": "Parents and dog owners in Richmond, VA",
    "identity.success": "A user can find a park that fits their needs within 30 seconds of opening the app.",
    "tech.stack": "React, Leaflet maps, public parks API, GitHub Pages",
    "tech.conventions": "Function components, camelCase, one component per file",
    "scope.in": "Map of nearby parks\nFilters for kids, dogs, and walking\nPark detail card",
    "scope.out": "User accounts\nReviews and ratings\nNative mobile app",
    "scope.priority": "1. Map + filters\n2. Detail card\n3. 'Near me' location",
    "sessions.later": "Favorites, accessibility info, sharing a park link",
    "authority.free": "Component structure, styling details, copy tweaks",
    "authority.ask": "Adding any new library\nChanging the data source",
    "risks.dependencies": "Public parks API rate limits",
    "risks.questions": "Do we show parks outside city limits? (owner: Antonio)",
    "context.format": "Complete files I can drop in, with a short note on what changed",
  },
  sessions: ["Project setup + map rendering", "Load parks data and pins", "Filters for kids, dogs, walking"],
};

const AI_NOTE =
  "Before writing any code, read this brief and ask me about anything unclear or missing. Stay inside the scope and decision rules above.";

/* ---------- Helpers ---------- */

const keyOf = (phaseId, fieldId) => `${phaseId}.${fieldId}`;
const filledText = (v) => (v || "").trim();

const toList = (t, splitCommas = false) =>
  (t || "")
    .split(splitCommas ? /\n|,/ : /\n/)
    .map((s) => s.replace(/^\s*([-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
const bullets = (t, splitCommas) => toList(t, splitCommas).map((s) => `- ${s}`).join("\n");
const section = (title, body) => (body ? `\n## ${title}\n\n${body}\n` : "");
const join = (...parts) => parts.filter(Boolean).join("\n\n");

function getData(values, sessions) {
  const g = (p, f) => filledText(values[keyOf(p, f)]);
  return {
    rawName: g("identity", "name"),
    name: g("identity", "name") || "Untitled project",
    problem: g("identity", "problem"),
    audience: g("identity", "audience"),
    success: g("identity", "success"),
    stack: g("tech", "stack"),
    structure: g("tech", "structure"),
    design: g("tech", "design"),
    conventions: g("tech", "conventions"),
    inScope: g("scope", "in"),
    outScope: g("scope", "out"),
    priority: g("scope", "priority"),
    sessions: sessions.map(filledText).filter(Boolean),
    later: g("sessions", "later"),
    free: g("authority", "free"),
    ask: g("authority", "ask"),
    never: g("authority", "never"),
    assumptions: g("risks", "assumptions"),
    dependencies: g("risks", "dependencies"),
    risks: g("risks", "risks"),
    questions: g("risks", "questions"),
    existing: g("context", "existing"),
    format: g("context", "format"),
    notes: g("context", "notes"),
  };
}

/* ---------- Export formats ---------- */

function buildBrief(values, sessions, includeAiNote) {
  const name = filledText(values["identity.name"]);
  let md = `# Kickoff brief: ${name || "Untitled project"}\n`;
  PHASES.forEach((phase) => {
    const parts = [];
    phase.fields.forEach((f) => {
      if (f.type === "list") {
        const items = sessions.map(filledText).filter(Boolean);
        if (items.length) parts.push(`**${f.label}**\n${items.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
        return;
      }
      if (phase.id === "identity" && f.id === "name") return;
      const v = filledText(values[keyOf(phase.id, f.id)]);
      if (v) parts.push(`**${f.label}**\n${v}`);
    });
    if (parts.length) md += `\n## ${phase.title}\n\n${parts.join("\n\n")}\n`;
  });
  if (includeAiNote) md += `\n---\n\n${AI_NOTE}\n`;
  return md;
}

function agentDoc(d, intro) {
  let out = `# ${d.name}\n\n${intro}\n`;
  out += section("Overview", join(d.problem, d.audience && `Built for: ${d.audience}`));
  out += section("Goal", d.success);
  out += section("Tech stack", bullets(d.stack, true));
  out += section("Project structure", d.structure);
  out += section("Conventions", [bullets(d.conventions), d.design && `- Design: ${d.design}`].filter(Boolean).join("\n"));
  out += section(
    "Scope",
    join(
      d.inScope && `**Building now**\n${bullets(d.inScope)}`,
      d.outScope && `**Not building yet** (don't start these without asking)\n${bullets(d.outScope)}`,
      d.priority && `**Priority**\n${d.priority}`
    )
  );
  out += section("Plan", join(d.sessions.length > 0 && d.sessions.map((s, i) => `${i + 1}. ${s}`).join("\n"), d.later && `Later: ${d.later}`));
  out += section(
    "Working rules",
    join(
      d.free && `**Decide on your own**\n${bullets(d.free)}`,
      d.ask && `**Ask before**\n${bullets(d.ask)}`,
      d.never && `**Never**\n${bullets(d.never)}`
    )
  );
  out += section(
    "Risks and open questions",
    join(
      d.assumptions && `**Assumptions**\n${bullets(d.assumptions)}`,
      d.dependencies && `**Dependencies**\n${bullets(d.dependencies)}`,
      d.risks && `**Risks**\n${bullets(d.risks)}`,
      d.questions && `**Open questions**\n${bullets(d.questions)}`
    )
  );
  out += section("Existing code", d.existing);
  out += section("How to respond", d.format);
  out += section("Notes", d.notes);
  return out.trim() + "\n";
}

function jiraEpic(d) {
  const ac = [...toList(d.inScope), ...toList(d.success)].map((s) => `- [ ] ${s}`).join("\n");
  return (
    join(
      `Epic: ${d.name}`,
      d.problem && `Background\n${d.problem}`,
      d.audience && `Users\n${d.audience}`,
      d.success && `Goal\n${d.success}`,
      ac && `Acceptance criteria\n${ac}`,
      d.outScope && `Out of scope\n${bullets(d.outScope)}`,
      d.dependencies && `Dependencies\n${bullets(d.dependencies)}`,
      d.risks && `Risks\n${bullets(d.risks)}`,
      d.questions && `Open questions\n${bullets(d.questions)}`,
      d.sessions.length > 0 && `Suggested stories\n${d.sessions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    ) + "\n"
  );
}

function stakeholderSummary(d) {
  const risky = [bullets(d.risks), bullets(d.dependencies)].filter(Boolean).join("\n");
  return (
    join(
      `Subject: Kickoff summary for ${d.name}`,
      `Hi all,\n\nHere's a quick summary of ${d.name} before we get started.`,
      d.problem && `What we're building and why\n${d.problem}`,
      d.audience && `Who it's for\n${d.audience}`,
      d.success && `What done looks like\n${d.success}`,
      d.inScope && `What's included\n${bullets(d.inScope)}`,
      d.outScope && `What's not included, for now\n${bullets(d.outScope)}`,
      d.sessions.length > 0 && `Plan\n${d.sessions.map((s, i) => `${i + 1}. ${s}`).join("\n")}${d.later ? `\nLater: ${d.later}` : ""}`,
      risky && `Risks and dependencies\n${risky}`,
      d.questions && `Open questions\n${bullets(d.questions)}`,
      "Let me know if anything looks off or is missing."
    ) + "\n"
  );
}

const FORMATS = [
  {
    id: "brief",
    label: "Kickoff brief",
    file: (slug) => `${slug}-kickoff.md`,
    mime: "text/markdown",
    where: "Paste into your first message to any AI assistant, or share it with your team.",
  },
  {
    id: "claude",
    label: "CLAUDE.md",
    file: () => "CLAUDE.md",
    mime: "text/markdown",
    where: "Save in your repo root. Claude Code reads it at the start of every session.",
    build: (d) => agentDoc(d, "Project context for Claude. Follow the working rules below, and ask before going outside the current scope."),
  },
  {
    id: "agents",
    label: "AGENTS.md",
    file: () => "AGENTS.md",
    mime: "text/markdown",
    where: "Save in your repo root. Many coding agents read this file automatically.",
    build: (d) => agentDoc(d, "Project context and rules for AI coding agents working in this repo."),
  },
  {
    id: "cursor",
    label: "Cursor rule",
    file: () => "project.mdc",
    mime: "text/markdown",
    where: "Save as .cursor/rules/project.mdc so Cursor applies it to every chat.",
    build: (d) =>
      `---\ndescription: Project context and working rules for ${d.name}\nalwaysApply: true\n---\n\n` +
      agentDoc(d, "Project context for Cursor. Follow the working rules below."),
  },
  {
    id: "jira",
    label: "Jira epic",
    file: (slug) => `${slug}-epic.txt`,
    mime: "text/plain",
    where: "Paste into a new epic. In-scope items become acceptance criteria and sessions become suggested stories.",
    build: jiraEpic,
  },
  {
    id: "summary",
    label: "Stakeholder summary",
    file: (slug) => `${slug}-summary.txt`,
    mime: "text/plain",
    where: "A plain-language recap for email or Teams. No tech jargon.",
    build: stakeholderSummary,
  },
];

/* ---------- Readiness check ---------- */

const VAGUE = [
  "fast", "quick", "quickly", "easy", "easily", "simple", "simply", "user-friendly", "intuitive",
  "seamless", "seamlessly", "robust", "modern", "scalable", "efficient", "better", "improved",
  "nice", "clean", "asap", "best-in-class", "world-class", "optimal", "etc",
];
const MEASURABLE = /\d|percent|second|minute|hour|day|week|month|under |less than|more than|at least|at most|within|zero|no more than/i;
const vagueIn = (text) =>
  VAGUE.filter((w) => new RegExp(`(^|[^a-z-])${w.replace(/-/g, "\\-")}(?![a-z-])`, "i").test(text));

function readiness(d) {
  const checks = [];
  const add = (ok, weight, level, fix, pass, detail, step) => checks.push({ ok, weight, level, fix, pass, detail, step });

  add(!!d.rawName, 8, "fix", "Name the project", "Project has a name", "Even a working title helps everyone refer to the same thing.", 0);
  add(d.problem.length >= 40, 12, "fix", d.problem ? "Add more detail to the problem" : "Describe the problem", "Problem is described",
    "One or two sentences on what's painful today, and for whom.", 0);

  if (!d.success) {
    add(false, 22, "fix", "Define what success looks like", "", "Without this, there's no way to say when you're done.", 0);
  } else {
    add(true, 12, "fix", "", "Success is defined", "", 0);
    add(MEASURABLE.test(d.success), 10, "fix", "Make success measurable", "Success is measurable",
      "Add a number, time limit, or threshold so you can actually test it.", 0);
  }

  add(!!d.audience, 6, "tip", "Say who it's for", "Audience is named", "Naming the audience shapes design and wording decisions.", 0);
  add(!!d.stack, 8, "fix", "List the tech stack", "Tech stack is set", "Stops anyone, AI included, from picking tools you didn't want.", 1);
  add(!!d.inScope, 12, "fix", "List what's in scope", "In-scope items are listed", "The must-haves for this version.", 2);
  add(!!d.outScope, 10, "fix", "Say what you're not building", "Out of scope is defined",
    "The most-skipped field, and one of the most useful. It's your best defense against scope creep.", 2);

  const n = toList(d.inScope).length;
  add(n <= 8, 4, "tip", `Scope looks big (${n} must-haves)`, "Scope is a manageable size",
    "Consider moving a few items to out of scope or later.", 2);

  add(d.sessions.length >= 2, 8, "fix", "Break the work into at least two sessions", "Work is broken into sessions",
    "Smaller chunks are easier to review and harder to derail.", 3);
  add(!!(d.ask || d.never), 8, "tip", "Set at least one guardrail", "Guardrails are set",
    "List something that needs a check-in first, or something that's off limits.", 4);
  add(!!(d.risks || d.questions || d.dependencies), 6, "tip", "Note a risk or open question", "Risks or open questions are noted",
    "Even one makes surprises less likely.", 5);

  const scanned = [
    ["Problem", d.problem, 0],
    ["Success", d.success, 0],
    ["Audience", d.audience, 0],
    ["In scope", d.inScope, 2],
  ].map(([label, text, step]) => ({ label, step, words: vagueIn(text) })).filter((x) => x.words.length);
  const words = [...new Set(scanned.flatMap((x) => x.words))];
  add(!scanned.length, 8, "tip", `Vague wording: ${words.map((w) => `"${w}"`).join(", ")}`, "No vague wording found",
    `Found in ${scanned.map((x) => x.label).join(", ")}. Swap these for something you can test or see.`, scanned[0]?.step ?? 0);

  const total = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce((a, c) => a + (c.ok ? c.weight : 0), 0);
  return { score: Math.round((earned / total) * 100), checks };
}

const scoreLabel = (s) => (s >= 80 ? "Ready to build" : s >= 50 ? "Getting there" : "Needs work");

/* ---------- Autosave ---------- */

const STORAGE_KEY = "project-kickoff:v2";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ---------- Clipboard ---------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

/* ---------- Small components ---------- */

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="11" fill="var(--accent)" />
    <path d="M14 11 V29" stroke="var(--accent-ink)" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
    <path d="M14 20 H24" stroke="var(--accent-ink)" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
    <circle cx="14" cy="11" r="3.5" fill="var(--accent-ink)" />
    <circle cx="14" cy="20" r="3.5" fill="var(--accent-ink)" />
    <circle cx="14" cy="29" r="3.5" fill="var(--accent-ink)" />
    <circle cx="27" cy="20" r="4.5" fill="var(--glow)" />
  </svg>
);

const ScoreRing = ({ score }) => {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`Readiness score ${score} out of 100`}>
      <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
        <circle cx="46" cy="46" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="46" cy="46" r={r} fill="none" stroke="var(--glow)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} transform="rotate(-90 46 46)"
          className="ring-arc"
        />
      </svg>
      <span className="ring-num">{score}</span>
    </div>
  );
};

/* ---------- App ---------- */

export default function App() {
  const [saved] = useState(loadSaved);
  const [values, setValues] = useState(saved?.values ?? {});
  const [sessions, setSessions] = useState(saved?.sessions?.length ? saved.sessions : ["", ""]);
  const [step, setStep] = useState(saved?.step ?? 0);
  const [aiNote, setAiNote] = useState(saved?.aiNote ?? true);
  const [fmt, setFmt] = useState(saved?.fmt ?? "brief");
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, sessions, step, aiNote, fmt }));
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  }, [values, sessions, step, aiNote, fmt]);
  const [toast, setToast] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const REVIEW = PHASES.length;
  const setVal = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const stats = PHASES.map((p) => {
    const filled = p.fields.filter((f) =>
      f.type === "list" ? sessions.some((s) => filledText(s)) : filledText(values[keyOf(p.id, f.id)])
    ).length;
    return { filled, total: p.fields.length };
  });
  const answered = stats.reduce((a, s) => a + s.filled, 0);
  const totalFields = stats.reduce((a, s) => a + s.total, 0);
  const pct = Math.round((answered / totalFields) * 100);

  const data = useMemo(() => getData(values, sessions), [values, sessions]);
  const ready = useMemo(() => readiness(data), [data]);
  const openChecks = ready.checks.filter((c) => !c.ok).sort((a, b) => (a.level === b.level ? 0 : a.level === "fix" ? -1 : 1));
  const passedChecks = ready.checks.filter((c) => c.ok);
  const fixCount = openChecks.filter((c) => c.level === "fix").length;
  const tipCount = openChecks.length - fixCount;

  const format = FORMATS.find((f) => f.id === fmt);
  const output = useMemo(
    () => (fmt === "brief" ? buildBrief(values, sessions, aiNote) : format.build(data)),
    [fmt, values, sessions, aiNote, data, format]
  );
  const slug = (data.rawName || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
  const fileName = format.file(slug);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const go = (i) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = async () => flash((await copyText(output)) ? `Copied ${format.label}` : "Couldn't copy. Select the preview text instead.");

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([output], { type: format.mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    flash(`Downloaded ${fileName}`);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setValues({});
    setSessions(["", ""]);
    setStep(0);
    setConfirmClear(false);
    flash("Cleared. Fresh start.");
  };

  const loadExample = () => {
    setValues(EXAMPLE.values);
    setSessions(EXAMPLE.sessions);
    flash("Example loaded");
  };

  const phase = PHASES[step];

  return (
    <div className="pk">
      <style>{CSS}</style>

      <header className="top">
        <div className="brand">
          <Logo />
          <div>
            <h1>Project Kickoff</h1>
            <p>Plan it before you build it.</p>
            <p className="saved">{canSave ? "Saved in this browser" : "Not saving: browser storage is off"}</p>
          </div>
        </div>

        <div className="meter" aria-label={`${answered} of ${totalFields} questions answered`}>
          <div className="meter-text">
            <strong>{pct}%</strong> <span>{answered} of {totalFields} answered</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="top-actions">
          <button className="btn ghost" onClick={loadExample}>Load example</button>
          <button className={`btn ghost ${confirmClear ? "danger" : ""}`} onClick={handleClear}>
            <RotateCcw size={15} /> {confirmClear ? "Click again to clear" : "Start over"}
          </button>
        </div>
      </header>

      <div className="layout">
        <nav className="rail" aria-label="Kickoff steps">
          <ol>
            {PHASES.map((p, i) => {
              const s = stats[i];
              const state = s.filled === s.total ? "done" : s.filled > 0 ? "partial" : "empty";
              return (
                <li key={p.id}>
                  <button
                    className={`station ${state} ${step === i ? "current" : ""}`}
                    aria-current={step === i ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="dot">{state === "done" ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
                    <span className="st-text">
                      <span className="st-title">{p.short}</span>
                      <span className="st-count">{s.filled} of {s.total}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                className={`station review ${step === REVIEW ? "current" : ""}`}
                aria-current={step === REVIEW ? "step" : undefined}
                onClick={() => go(REVIEW)}
              >
                <span className="dot"><FileText size={13} /></span>
                <span className="st-text">
                  <span className="st-title">Review & export</span>
                  <span className="st-count">Readiness {ready.score}</span>
                </span>
              </button>
            </li>
          </ol>
        </nav>

        <main className="panel">
          {step < REVIEW ? (
            <>
              <p className="step-of">Step {step + 1} of {PHASES.length}</p>
              <h2>{phase.title}</h2>
              <p className="intro">{phase.intro}</p>

              <div className="fields">
                {phase.fields.map((f) => {
                  if (f.type === "list") {
                    return (
                      <fieldset key={f.id} className="field">
                        <legend className="label">{f.label}</legend>
                        <div className="sessions">
                          {sessions.map((s, i) => (
                            <div className="session" key={i}>
                              <span className="session-num" aria-hidden="true">{i + 1}</span>
                              <input
                                aria-label={`Session ${i + 1} focus`}
                                value={s}
                                placeholder={i === 0 ? "e.g. Data model + API scaffold" : i === 1 ? "e.g. UI shell + navigation" : "What's the focus?"}
                                onChange={(e) => setSessions((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                              />
                              {sessions.length > 1 && (
                                <button
                                  className="icon-btn"
                                  aria-label={`Remove session ${i + 1}`}
                                  onClick={() => setSessions((p) => p.filter((_, j) => j !== i))}
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button className="add" onClick={() => setSessions((p) => [...p, ""])}>
                            <Plus size={16} /> Add a session
                          </button>
                        </div>
                      </fieldset>
                    );
                  }
                  const k = keyOf(phase.id, f.id);
                  const id = `f-${phase.id}-${f.id}`;
                  return (
                    <div className="field" key={f.id}>
                      <label className="label" htmlFor={id}>
                        {f.label}
                        {f.key && (
                          <>
                            <span className="key-dot" aria-hidden="true" />
                            <span className="sr">(key field)</span>
                          </>
                        )}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea id={id} rows={3} value={values[k] || ""} placeholder={f.placeholder} onChange={(e) => setVal(k, e.target.value)} />
                      ) : (
                        <input id={id} value={values[k] || ""} placeholder={f.placeholder} onChange={(e) => setVal(k, e.target.value)} />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="step-of">Last step</p>
              <h2>Review and export</h2>
              <p className="intro">See how ready your plan is, then export it in the format you need.</p>

              <section className="ready" aria-labelledby="ready-h">
                <div className="ready-top">
                  <ScoreRing score={ready.score} />
                  <div>
                    <h3 id="ready-h">{scoreLabel(ready.score)}</h3>
                    <p>
                      {openChecks.length === 0
                        ? "Every check passes. This plan is in good shape."
                        : [fixCount && `${fixCount} ${fixCount === 1 ? "thing" : "things"} to fix`, tipCount && `${tipCount} ${tipCount === 1 ? "suggestion" : "suggestions"}`]
                            .filter(Boolean)
                            .join(", ") + "."}
                    </p>
                  </div>
                </div>

                {openChecks.length > 0 && (
                  <ul className="checks">
                    {openChecks.map((c) => (
                      <li key={c.fix} className={`check ${c.level}`}>
                        {c.level === "fix" ? <AlertCircle size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
                        <div className="check-text">
                          <strong>{c.fix}</strong>
                          <span>{c.detail}</span>
                        </div>
                        <button className="btn small" onClick={() => go(c.step)}>Fix</button>
                      </li>
                    ))}
                  </ul>
                )}

                {passedChecks.length > 0 && (
                  <details className="passed">
                    <summary>{passedChecks.length} {passedChecks.length === 1 ? "check" : "checks"} passing</summary>
                    <ul>
                      {passedChecks.map((c) => (
                        <li key={c.pass}><Check size={15} strokeWidth={3} aria-hidden="true" /> {c.pass}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>

              <h3 className="sub">Export</h3>
              <div className="tabs" role="tablist" aria-label="Export format">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={fmt === f.id}
                    className={`tab ${fmt === f.id ? "on" : ""}`}
                    onClick={() => setFmt(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div role="tabpanel" className="tabpanel">
                <p className="where">{format.where}</p>

                {fmt === "brief" && (
                  <label className="toggle">
                    <input type="checkbox" checked={aiNote} onChange={(e) => setAiNote(e.target.checked)} />
                    <span>Add a note asking the AI to read the brief and ask questions first</span>
                  </label>
                )}

                <div className="export-actions">
                  <button className="btn primary" onClick={handleCopy}><Copy size={16} /> Copy</button>
                  <button className="btn" onClick={handleDownload}><Download size={16} /> Download {fileName}</button>
                </div>

                <pre className="preview" tabIndex={0} aria-label={`${format.label} preview`}>{output}</pre>
              </div>

              <p className="privacy">Everything runs in your browser. Your answers are saved on this device only and never sent anywhere.</p>
            </>
          )}

          <footer className="step-nav">
            <button className="btn" onClick={() => go(step - 1)} disabled={step === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            {step < REVIEW && (
              <button className="btn primary" onClick={() => go(step + 1)}>
                {step === REVIEW - 1 ? "Review & export" : "Next"} <ChevronRight size={16} />
              </button>
            )}
          </footer>
        </main>
      </div>

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast && <><Check size={15} strokeWidth={3} /> {toast}</>}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');

.pk {
  --canvas: #EDF0F5;
  --surface: #FFFFFF;
  --sunken: #F5F7FA;
  --ink: #1A1F36;
  --ink-soft: #5A6280;
  --line: #D7DCE7;
  --accent: #3550F0;
  --accent-ink: #FFFFFF;
  --accent-soft: #E6EAFE;
  --glow: #FFD23F;
  --glow-ink: #3A2E00;
  --danger: #C2283C;
  color-scheme: light;
  min-height: 100vh;
  background: var(--canvas);
  color: var(--ink);
  font-family: 'Instrument Sans', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  padding: 24px 20px 64px;
  box-sizing: border-box;
}
@media (prefers-color-scheme: dark) {
  .pk {
    --canvas: #12152A;
    --surface: #1B1F38;
    --sunken: #151933;
    --ink: #EEF0F8;
    --ink-soft: #A3A9C4;
    --line: #2E3456;
    --accent: #8090FF;
    --accent-ink: #0F1230;
    --accent-soft: #262D57;
    --danger: #FF7A8A;
    color-scheme: dark;
  }
}
.pk *, .pk *::before, .pk *::after { box-sizing: border-box; }
.pk h1, .pk h2, .pk h3 { font-family: 'Bricolage Grotesque', system-ui, sans-serif; margin: 0; }
.pk button { font: inherit; color: inherit; cursor: pointer; }
.pk :focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 8px; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

/* Header */
.top {
  max-width: 1080px; margin: 0 auto 28px;
  display: grid; grid-template-columns: auto 1fr auto; gap: 28px; align-items: center;
}
.brand { display: flex; gap: 14px; align-items: center; }
.brand h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
.brand p { margin: 2px 0 0; color: var(--ink-soft); font-size: 14px; }
.brand p.saved { font-size: 12.5px; margin-top: 0; display: flex; align-items: center; gap: 6px; }
.brand p.saved::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--glow); }
.meter { max-width: 340px; width: 100%; justify-self: center; }
.meter-text { display: flex; gap: 8px; align-items: baseline; font-size: 13px; color: var(--ink-soft); margin-bottom: 6px; }
.meter-text strong { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; color: var(--ink); }
.meter-track { height: 8px; border-radius: 99px; background: var(--line); overflow: hidden; }
.meter-fill { height: 100%; background: var(--glow); border-radius: 99px; transition: width .4s ease; }
.top-actions { display: flex; gap: 8px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 16px; border-radius: 10px;
  border: 1px solid var(--line); background: var(--surface);
  font-weight: 600; font-size: 14px;
  transition: background .15s, border-color .15s, transform .1s;
}
.btn:hover:not(:disabled) { border-color: var(--accent); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: .4; cursor: default; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.btn.primary:hover { filter: brightness(1.08); }
.btn.ghost { background: transparent; border-color: transparent; color: var(--ink-soft); }
.btn.ghost:hover { color: var(--ink); background: var(--surface); border-color: var(--line); }
.btn.danger, .btn.ghost.danger { color: var(--danger); border-color: var(--danger); }
.btn.small { padding: 6px 12px; font-size: 13px; border-radius: 8px; }

/* Layout */
.layout { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 250px 1fr; gap: 32px; align-items: start; }

/* Rail */
.rail { position: sticky; top: 24px; }
.rail ol { list-style: none; margin: 0; padding: 0; position: relative; }
.rail ol::before {
  content: ""; position: absolute; left: 16px; top: 22px; bottom: 22px;
  width: 3px; border-radius: 3px; background: var(--line);
}
.rail li { position: relative; }
.station {
  width: 100%; display: flex; align-items: center; gap: 14px;
  padding: 8px 10px 8px 0; background: none; border: none; text-align: left; border-radius: 12px;
}
.dot {
  position: relative; z-index: 1; flex: none;
  width: 35px; height: 35px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 13px; font-weight: 600;
  background: var(--canvas); border: 3px solid var(--line); color: var(--ink-soft);
  transition: background .2s, border-color .2s, color .2s, transform .2s;
}
.station.partial .dot { border-color: var(--glow); color: var(--ink); background: var(--surface); }
.station.done .dot { background: var(--glow); border-color: var(--glow); color: var(--glow-ink); }
.station.review .dot { border-style: dashed; }
.station.current .dot { transform: scale(1.12); box-shadow: 0 0 0 5px var(--accent-soft); border-color: var(--accent); }
.station.done.current .dot { border-color: var(--glow); }
.st-text { display: flex; flex-direction: column; line-height: 1.25; }
.st-title { font-weight: 600; font-size: 15px; }
.st-count { font-size: 12.5px; color: var(--ink-soft); }
.station.current .st-title { color: var(--accent); }
.station:hover .st-title { text-decoration: underline; text-underline-offset: 3px; }

/* Panel */
.panel {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 22px; padding: 36px 40px 28px; max-width: 720px;
}
.step-of { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--accent); }
.panel h2 { font-size: clamp(28px, 4vw, 38px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.08; }
.intro { margin: 10px 0 28px; color: var(--ink-soft); max-width: 56ch; }
.fields { display: grid; gap: 22px; }
.field { border: none; padding: 0; margin: 0; }
.label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; margin-bottom: 8px; padding: 0; }
.key-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--glow); box-shadow: 0 0 0 2px var(--surface), 0 0 0 3px var(--glow); }
.panel input:not([type=checkbox]), .panel textarea {
  width: 100%; font: inherit; font-size: 15.5px; color: var(--ink);
  background: var(--sunken); border: 1.5px solid var(--line); border-radius: 12px;
  padding: 12px 14px; transition: border-color .15s, background .15s;
}
.panel textarea { resize: vertical; min-height: 92px; line-height: 1.55; }
.panel input::placeholder, .panel textarea::placeholder { color: var(--ink-soft); opacity: .75; }
.panel input:focus, .panel textarea:focus { outline: none; border-color: var(--accent); background: var(--surface); box-shadow: 0 0 0 4px var(--accent-soft); }

/* Sessions */
.sessions { display: grid; gap: 10px; }
.session { display: flex; align-items: center; gap: 10px; }
.session-num {
  flex: none; width: 30px; height: 30px; border-radius: 9px;
  display: grid; place-items: center; font-weight: 600; font-size: 13px;
  background: var(--accent-soft); color: var(--accent);
}
.icon-btn { flex: none; width: 36px; height: 36px; border-radius: 10px; border: none; background: none; color: var(--ink-soft); display: grid; place-items: center; }
.icon-btn:hover { background: var(--sunken); color: var(--danger); }
.add {
  justify-self: start; display: inline-flex; align-items: center; gap: 6px;
  margin-left: 40px; padding: 8px 12px; border-radius: 10px;
  border: 1.5px dashed var(--line); background: none; color: var(--accent); font-weight: 600; font-size: 14px;
}
.add:hover { border-color: var(--accent); }

/* Readiness */
.ready { background: var(--sunken); border: 1px solid var(--line); border-radius: 18px; padding: 22px; margin-bottom: 32px; }
.ready-top { display: flex; gap: 20px; align-items: center; }
.ready-top h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.ready-top p { margin: 4px 0 0; color: var(--ink-soft); }
.ring { position: relative; width: 92px; height: 92px; flex: none; }
.ring-arc { transition: stroke-dashoffset .6s ease; }
.ring-num {
  position: absolute; inset: 0; display: grid; place-items: center;
  font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 28px;
}
.checks { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 8px; }
.check {
  display: flex; gap: 12px; align-items: center;
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px;
}
.check > svg { flex: none; }
.check.fix > svg { color: var(--danger); }
.check.tip > svg { color: var(--ink-soft); }
.check-text { flex: 1; display: flex; flex-direction: column; line-height: 1.35; }
.check-text strong { font-weight: 600; font-size: 15px; }
.check-text span { color: var(--ink-soft); font-size: 14px; }
.passed { margin-top: 14px; font-size: 14px; color: var(--ink-soft); }
.passed summary { cursor: pointer; font-weight: 600; }
.passed ul { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 6px; }
.passed li { display: flex; gap: 8px; align-items: center; }
.passed li svg { color: var(--ink); background: var(--glow); border-radius: 50%; padding: 2px; color: var(--glow-ink); }

/* Export */
.sub { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px !important; }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tab {
  padding: 8px 14px; border-radius: 99px; border: 1.5px solid var(--line);
  background: var(--surface); font-weight: 600; font-size: 14px; color: var(--ink-soft);
}
.tab:hover { border-color: var(--accent); color: var(--ink); }
.tab.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
.where { margin: 0 0 14px; color: var(--ink-soft); font-size: 15px; }
.toggle { display: flex; gap: 10px; align-items: flex-start; font-size: 15px; margin-bottom: 16px; cursor: pointer; }
.toggle input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--accent); }
.export-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.preview {
  margin: 0; max-height: 420px; overflow: auto;
  background: var(--sunken); border: 1px solid var(--line); border-radius: 14px;
  padding: 20px 22px; white-space: pre-wrap; word-break: break-word;
  font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 14.5px; line-height: 1.6; color: var(--ink);
}
.privacy { margin: 16px 0 0; font-size: 13.5px; color: var(--ink-soft); }

.step-nav { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--line); }

/* Toast */
.toast {
  position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 20px);
  display: flex; align-items: center; gap: 8px;
  background: var(--ink); color: var(--canvas);
  padding: 11px 18px; border-radius: 99px; font-weight: 600; font-size: 14px;
  opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }

/* Responsive */
@media (max-width: 860px) {
  .top { grid-template-columns: 1fr; gap: 16px; }
  .meter { justify-self: stretch; max-width: none; }
  .layout { grid-template-columns: 1fr; gap: 16px; }
  .rail { position: static; overflow-x: auto; margin: 0 -20px; padding: 4px 20px 8px; }
  .rail ol { display: flex; gap: 6px; width: max-content; }
  .rail ol::before { display: none; }
  .station { padding: 6px 12px 6px 6px; background: var(--surface); border: 1px solid var(--line); border-radius: 99px; }
  .station.current { border-color: var(--accent); }
  .dot { width: 28px; height: 28px; border-width: 2px; font-size: 12px; }
  .station.current .dot { transform: none; box-shadow: none; }
  .st-count { display: none; }
  .st-title { font-size: 14px; white-space: nowrap; }
  .panel { padding: 26px 20px 20px; border-radius: 18px; }
  .ready { padding: 18px; }
  .ready-top { gap: 14px; }
  .check { flex-wrap: wrap; }
  .check .btn.small { margin-left: 30px; }
}

@media (prefers-reduced-motion: reduce) {
  .pk *, .toast { transition: none !important; }
}
`;

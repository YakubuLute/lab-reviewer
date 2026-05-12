import { useState, useEffect, useRef } from "react";

// ── Learners ─────────────────────────────────────────────────────────────────
const _learnerNames = (import.meta.env.VITE_LEARNER_NAMES || "").split(",");
const _learnerEmails = (import.meta.env.VITE_LEARNER_EMAILS || "").split(",");

const LEARNERS = _learnerNames.map((name, i) => ({
  name: name.trim(),
  email: _learnerEmails[i]?.trim() || "",
}));

const EMMANUEL_EMAIL = import.meta.env.VITE_CC_EMAIL || "";

// ── Lab Data ──────────────────────────────────────────────────────────────────
const LAB_DATA = {
  "RESTful Task Tracker": {
    description:
      "Express.js RESTful API with MVC pattern, middleware, and error handling.",
    criteria: [
      {
        id: "setup",
        name: "Project Setup",
        description: "Express app runs correctly using .env variables",
        weight: 10,
      },
      {
        id: "routing",
        name: "Routing & Parameters",
        description:
          "CRUD routes implemented correctly and return proper status codes",
        weight: 20,
      },
      {
        id: "middleware",
        name: "Middleware Usage",
        description:
          "Proper use of logger, parser, error handler, and 404 middleware",
        weight: 15,
      },
      {
        id: "errorhandling",
        name: "Error Handling",
        description: "Graceful handling of invalid routes and bad inputs",
        weight: 15,
      },
      {
        id: "mvc",
        name: "MVC Structure",
        description: "Logical and organized folder structure",
        weight: 15,
      },
      {
        id: "response",
        name: "Response Format",
        description: "Returns clean JSON and correct HTTP status codes",
        weight: 10,
      },
      {
        id: "codequality",
        name: "Code Quality & Clarity",
        description: "Code readability, organization, and documentation",
        weight: 15,
      },
    ],
  },
  "Task Tracker - Database": {
    description:
      "Extends Task Tracker with persistent database storage, models, and async operations.",
    criteria: [
      {
        id: "dbsetup",
        name: "Database Setup & Connection",
        description: "Successfully connects to a database",
        weight: 15,
      },
      {
        id: "datamodel",
        name: "Data Model / Schema",
        description: "Properly structured model with validation",
        weight: 15,
      },
      {
        id: "crud",
        name: "CRUD Integration",
        description: "Routes correctly interact with the database",
        weight: 25,
      },
      {
        id: "async",
        name: "Async/Await & Error Handling",
        description: "Correct handling of async operations and errors",
        weight: 15,
      },
      {
        id: "envconfig",
        name: "Environment Configuration",
        description: "Secure management of environment variables",
        weight: 10,
      },
      {
        id: "responsq",
        name: "Response Quality",
        description: "Proper HTTP status codes and consistent JSON output",
        weight: 10,
      },
      {
        id: "codeorg",
        name: "Code Organization & Clarity",
        description: "Follows MVC and readable structure",
        weight: 10,
      },
    ],
  },
  "Task Tracker with Auth": {
    description:
      "Secures the Task Tracker API with JWT authentication and role-based access control.",
    criteria: [
      {
        id: "authreglogin",
        name: "User Registration & Login",
        description: "Implements secure signup and login with bcrypt hashing",
        weight: 20,
      },
      {
        id: "jwt",
        name: "JWT Authentication",
        description: "Correctly issues, verifies, and expires JWT tokens",
        weight: 20,
      },
      {
        id: "protected",
        name: "Protected Routes",
        description:
          "Middleware correctly restricts access to authenticated users only",
        weight: 20,
      },
      {
        id: "rbac",
        name: "Role-Based Access Control",
        description:
          "Properly applies user roles (user/admin) to control access",
        weight: 15,
      },
      {
        id: "secerr",
        name: "Error Handling & Security",
        description:
          "Secure coding practices, environment variables, consistent error responses",
        weight: 15,
      },
      {
        id: "orgdoc",
        name: "Code Organization & Documentation",
        description:
          "Clean folder structure, clear naming, and concise documentation",
        weight: 10,
      },
    ],
  },
  "Media Library API": {
    description:
      "Production-grade API with layered architecture, file uploads, pagination, and error handling.",
    criteria: [
      {
        id: "layered",
        name: "Layered Architecture",
        description:
          "Clear separation across routes, controllers, services, repositories",
        weight: 20,
      },
      {
        id: "globalerr",
        name: "Global Error Handling",
        description:
          "Centralized error middleware, AppError class, process-level handlers",
        weight: 20,
      },
      {
        id: "validation",
        name: "Request Validation",
        description:
          "Joi/Zod schemas via reusable middleware with structured errors",
        weight: 15,
      },
      {
        id: "fileupload",
        name: "File Upload Handling",
        description:
          "Multer correctly configured; metadata persisted alongside file info",
        weight: 20,
      },
      {
        id: "pagination",
        name: "Pagination, Filtering & Search",
        description:
          "All query parameters function correctly with full pagination metadata",
        weight: 15,
      },
      {
        id: "asyncprom",
        name: "Async/Await & Promise Handling",
        description:
          "catchAsync in use, Promise.all() demonstrated, no unhandled rejections",
        weight: 10,
      },
    ],
  },
  "Testing, Deployment & Monitoring": {
    description:
      "Makes Media Library API production-ready with tests, CI/CD, Vercel deployment, and logging.",
    criteria: [
      {
        id: "postman",
        name: "Postman Collection",
        description:
          "All endpoints covered, env vars used, assertions present, collection committed",
        weight: 15,
      },
      {
        id: "unittests",
        name: "Unit Tests",
        description:
          "AppError, catchAsync, validate, and service logic tested correctly",
        weight: 20,
      },
      {
        id: "inttests",
        name: "Integration Tests",
        description:
          "All endpoints covered with Supertest; edge cases tested; test DB isolated",
        weight: 20,
      },
      {
        id: "envconf",
        name: "Environment Configuration",
        description:
          "Separate env files, startup validation, .env.example committed",
        weight: 15,
      },
      {
        id: "gitcicd",
        name: "Git Workflow & CI/CD",
        description:
          "Clean commit history, feature branch + PR workflow, GitHub Actions passes",
        weight: 15,
      },
      {
        id: "deploylog",
        name: "Deployment & Logging",
        description:
          "App live on Vercel, structured logging, /health endpoint responds",
        weight: 15,
      },
    ],
  },
  "Full-Stack Kanban Application": {
    description:
      "Full-stack Kanban board connecting Node.js/Express backend to an existing frontend.",
    criteria: [
      {
        id: "apidesign",
        name: "API Design & Structure",
        description:
          "Clear RESTful endpoints, modular code structure, separation of concerns",
        weight: 20,
      },
      {
        id: "dbmodel",
        name: "Database Modeling & Persistence",
        description:
          "Logical schema design, relationships (boards–columns–tasks), consistent persistence",
        weight: 20,
      },
      {
        id: "authz",
        name: "Authentication & Authorization",
        description:
          "Secure JWT implementation, role-based access control, hashed passwords",
        weight: 20,
      },
      {
        id: "features",
        name: "Functionality & Feature Completion",
        description:
          "All core CRUD operations working; collaboration features where possible",
        weight: 15,
      },
      {
        id: "frontend",
        name: "Frontend Integration",
        description:
          "Successful connection of frontend to backend APIs (data loads, updates, persists)",
        weight: 10,
      },
      {
        id: "codeqdoc",
        name: "Code Quality & Documentation",
        description:
          "Clean, readable code with meaningful names, comments, and setup guide",
        weight: 10,
      },
      {
        id: "bonus",
        name: "Bonus / Stretch Features",
        description:
          "Activity logs, notifications, real-time updates, or theme persistence",
        weight: 5,
      },
    ],
  },
};

const RATING_LABELS = [
  "Not attempted",
  "Poor",
  "Below average",
  "Average",
  "Good",
  "Excellent",
];
const PASSING_SCORE = 80;

const getWeight = (base, attempt) =>
  attempt === "2nd" ? parseFloat((base * 0.8).toFixed(1)) : base;
const getMaxScore = (attempt) => (attempt === "2nd" ? 80 : 100);

const gradeInfo = (score, attempt) => {
  const s = parseFloat(score),
    max = getMaxScore(attempt),
    pct = (s / max) * 100;
  if (s >= PASSING_SCORE) {
    if (pct >= 95) return { label: "Distinction", color: "#22c55e" };
    if (pct >= 85) return { label: "Merit", color: "#3b82f6" };
    return { label: "Pass", color: "#f59e0b" };
  }
  return { label: "Needs Work", color: "#ef4444" };
};

// ── Email builder ─────────────────────────────────────────────────────────────
function buildEmailHTML({
  learnerName,
  selectedLab,
  attempt,
  totalScore,
  maxScore,
  grade,
  passed,
  redoLab,
  plagiarism,
  strengths,
  improvements,
  otherRemarks,
  reviewerName,
  reviewDate,
  criteriaRows,
}) {
  const dateStr = new Date(reviewDate).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  const dateStrLong = new Date(reviewDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const statusColor = passed ? "#16a34a" : "#dc2626";
  const statusText = passed ? "PASSED" : "DID NOT PASS";

  const ratingLabel = (raw) => {
    if (raw === 5) return "Excellent";
    if (raw === 4) return "Good";
    if (raw === 3) return "Average";
    if (raw === 2) return "Below Average";
    if (raw === 1) return "Poor";
    return "Not attempted";
  };

  const scoreColor = (raw) =>
    raw >= 4 ? "#16a34a" : raw >= 3 ? "#d97706" : "#dc2626";

  const sections = criteriaRows
    .map((c, i) => {
      const num = String(i + 1).padStart(2, "0");
      const color = scoreColor(c.rawScore);
      return `
    <div style="border:1px solid #e5e7eb;border-radius:12px;margin-bottom:14px;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:32px;height:32px;border-radius:50%;background:#4f46e5;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:32px;flex-shrink:0;">${num}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827;">${c.criterion}</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;">Weight: ${c.effectiveWeight}%${attempt === "2nd" ? ` &nbsp;·&nbsp; Base: ${c.weight}%` : ""}</div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px;">
          <div style="font-size:22px;font-weight:900;color:${color};">${c.rawScore} <span style="font-size:14px;color:#9ca3af;font-weight:400;">/ 5</span></div>
          <div style="font-size:11px;font-weight:700;color:${color};margin-top:2px;">${ratingLabel(c.rawScore)}</div>
        </div>
      </div>
      ${
        c.feedback
          ? `<div style="padding:14px 20px;"><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Reviewer Remarks</div><div style="font-size:13px;color:#374151;line-height:1.7;">${c.feedback}</div></div>`
          : `<div style="padding:14px 20px;font-size:13px;color:#d1d5db;font-style:italic;">No remarks recorded.</div>`
      }
    </div>`;
    })
    .join("");

  const progressPct = Math.min(
    (parseFloat(totalScore) / maxScore) * 100,
    100,
  ).toFixed(1);

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:680px;margin:36px auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.18);">

  <!-- ══════════════════════════════════════
       HERO — dark navy, exact Sprint design
       ══════════════════════════════════════ -->
  <div style="background:#0b1f38;padding:44px 44px 36px;">

    <!-- Top label -->
    <div style="font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:28px;">NSP &nbsp; Performance &nbsp; Review</div>

    <!-- Results for + Name -->
    <div style="font-size:14px;color:rgba(255,255,255,0.6);font-weight:400;margin-bottom:6px;">Results for</div>
    <div style="font-size:38px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:10px;">${learnerName}</div>

    <!-- Lab name in cyan accent -->
    <div style="font-size:15px;font-weight:600;color:#38bdf8;margin-bottom:36px;">${selectedLab}</div>

    <!-- Metadata cards row -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <!-- Reviewer -->
      <div style="flex:1;min-width:140px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Reviewer</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${reviewerName}</div>
      </div>
      <!-- Date -->
      <div style="flex:1;min-width:140px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Date</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${dateStr}</div>
      </div>
      <!-- Attempt -->
      <div style="flex:1;min-width:100px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Attempt</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${attempt}</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       OVERALL SCORE — orange bar, exact Sprint design
       ══════════════════════════════════════ -->
  <div style="background:#f97316;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <!-- Left: label + progress bar -->
        <td style="padding:28px 32px;vertical-align:middle;width:60%;">
          <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:4px;">Overall &nbsp; Score</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:18px;">
            Σ (raw ÷ 5 × weight%) &nbsp;·&nbsp; Max: ${maxScore}%
            ${
              passed
                ? `&nbsp;·&nbsp;<span style="color:#fff;font-weight:700;">✅ PASSED</span>`
                : `&nbsp;·&nbsp;<span style="color:#fff;font-weight:700;">❌ NOT PASSED</span>`
            }
            ${redoLab ? `<br><span style="color:rgba(255,255,255,0.85);font-weight:600;">🔁 Re-do Required</span>` : ""}
            ${plagiarism ? `<br><span style="color:rgba(255,255,255,0.85);font-weight:600;">⚠️ Plagiarism Flagged</span>` : ""}
          </div>
          <!-- Progress bar -->
          <div style="position:relative;height:6px;background:rgba(255,255,255,0.25);border-radius:999px;overflow:visible;">
            <div style="height:6px;width:${progressPct}%;background:#ffffff;border-radius:999px;position:relative;">
              <!-- Dot at end of bar -->
              <div style="position:absolute;right:-5px;top:-4px;width:14px;height:14px;border-radius:50%;background:#ffffff;box-shadow:0 0 0 3px rgba(255,255,255,0.35);"></div>
            </div>
          </div>
        </td>
        <!-- Right: big score number -->
        <td style="padding:28px 32px 28px 0;vertical-align:middle;text-align:right;width:40%;background:rgba(0,0,0,0.08);border-left:1px solid rgba(255,255,255,0.15);">
          <div style="display:inline-flex;align-items:baseline;gap:2px;">
            <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-2px;line-height:1;">${totalScore}</span>
            <span style="font-size:20px;font-weight:600;color:rgba(255,255,255,0.8);align-self:flex-end;margin-bottom:8px;">%</span>
          </div>
          <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);margin-top:4px;">${grade.label}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- ══════════════════════════════════════
       BODY — white background cards
       ══════════════════════════════════════ -->
  <div style="background:#f0f2f5;padding:12px 0 0;">

    <!-- Assessment breakdown -->
    <div style="background:#ffffff;margin:0 0 8px;padding:32px 40px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin-bottom:22px;">Assessment Breakdown</div>
      ${sections}
    </div>

    <!-- Remarks -->
    ${
      strengths || improvements || otherRemarks
        ? `
    <div style="background:#ffffff;margin:0 0 8px;padding:32px 40px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin-bottom:20px;">Overall Remarks</div>

      ${
        strengths
          ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
        <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Strengths</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${strengths}</div>
      </div>`
          : ""
      }

      ${
        improvements
          ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
        <div style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Gaps</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${improvements}</div>
      </div>`
          : ""
      }

      ${
        otherRemarks
          ? `
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:18px 20px;">
        <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Other Remarks</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${otherRemarks}</div>
      </div>`
          : ""
      }
    </div>`
        : ""
    }

    <!-- Footer -->
    <div style="background:#ffffff;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div style="font-size:11px;color:#9ca3af;">Score formula: Σ (raw ÷ 5 × weight%)${attempt === "2nd" ? " · 2nd attempt max = 80%" : ""}</div>
      <div style="font-size:11px;color:#9ca3af;">AmaliTech · ${dateStrLong}</div>
    </div>

  </div><!-- /body -->
</div><!-- /container -->
</body></html>`;
}

// ── Excel row builder ─────────────────────────────────────────────────────────
function buildExcelRow({
  reviewDate,
  learnerName,
  reviewerName,
  selectedLab,
  attempt,
  criteriaRows,
  totalScore,
  redoLab,
  plagiarism,
  strengths,
  improvements,
  otherRemarks,
}) {
  return [
    new Date(reviewDate).toLocaleDateString("en-GB"),
    learnerName,
    reviewerName,
    selectedLab,
    attempt,
    ...criteriaRows.map((c) => c.weightedScore),
    totalScore,
    redoLab ? "Yes" : "No",
    plagiarism ? "Yes" : "No",
    strengths,
    improvements,
    otherRemarks,
  ].join("\t");
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LabReviewForm() {
  const [learnerName, setLearnerName] = useState("");
  const [learnerEmail, setLearnerEmail] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [attempt, setAttempt] = useState("1st");
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [otherRemarks, setOtherRemarks] = useState("");
  const [redoLab, setRedoLab] = useState(false);
  const [plagiarism, setPlagiarism] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState("");
  const reportRef = useRef(null);

  const lab = selectedLab ? LAB_DATA[selectedLab] : null;
  const maxScore = getMaxScore(attempt);

  // Auto-fill email when learner is selected
  const handleLearnerSelect = (name) => {
    setLearnerName(name);
    const found = LEARNERS.find((l) => l.name === name);
    setLearnerEmail(found ? found.email : "");
  };

  useEffect(() => {
    if (selectedLab) {
      const init = {};
      LAB_DATA[selectedLab].criteria.forEach((c) => {
        init[c.id] = 0;
      });
      setScores(init);
      setFeedbacks({});
    }
  }, [selectedLab]);

  const weightedScore = (id, base) =>
    (((scores[id] || 0) / 5) * getWeight(base, attempt)).toFixed(1);

  const totalScore = lab
    ? lab.criteria
        .reduce(
          (s, c) =>
            s + ((scores[c.id] || 0) / 5) * getWeight(c.weight, attempt),
          0,
        )
        .toFixed(1)
    : "0";

  const grade = gradeInfo(totalScore, attempt);
  const passed = parseFloat(totalScore) >= PASSING_SCORE;
  const isValid =
    learnerName && learnerEmail && selectedLab && reviewerName && reviewDate;

  const copy = (text, key) => {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:absolute;left:-9999px;top:-9999px;";
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, el.value.length);
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(key);
      setTimeout(() => setCopied(""), 2200);
    } catch (err) {
      setCopied(key + "_fail");
      setTimeout(() => setCopied(""), 2200);
    }
  };

  const handleGenerate = () => {
    const criteriaRows = lab.criteria.map((c) => ({
      criterion: c.name,
      weight: c.weight,
      effectiveWeight: getWeight(c.weight, attempt),
      rating: RATING_LABELS[scores[c.id] || 0],
      rawScore: scores[c.id] || 0,
      weightedScore: parseFloat(weightedScore(c.id, c.weight)),
      feedback: feedbacks[c.id] || "",
    }));
    const data = {
      learnerName,
      learnerEmail,
      selectedLab,
      attempt,
      totalScore,
      maxScore,
      grade,
      passed,
      redoLab,
      plagiarism,
      strengths,
      improvements,
      otherRemarks,
      reviewerName,
      reviewDate,
      criteriaRows,
    };
    setReport({
      ...data,
      html: buildEmailHTML(data),
      excelRow: buildExcelRow(data),
      subject: `Lab Review: ${selectedLab} — ${learnerName} (${grade.label})`,
    });
    setTimeout(
      () => reportRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const reset = () => {
    setLearnerName("");
    setLearnerEmail("");
    setSelectedLab("");
    setAttempt("1st");
    setStrengths("");
    setImprovements("");
    setOtherRemarks("");
    setRedoLab(false);
    setPlagiarism(false);
    setReport(null);
    setReviewDate(new Date().toISOString().split("T")[0]);
  };

  const S = {
    card: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      color: "#475569",
      marginBottom: 6,
      fontWeight: 600,
      display: "block",
    },
    slab: {
      fontSize: 12,
      fontWeight: 700,
      color: "#4f46e5",
      textTransform: "uppercase",
      letterSpacing: ".1em",
      marginBottom: 16,
    },
    input: {
      width: "100%",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "10px 12px",
      color: "#f1f5f9",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    copyBtn: (key) => ({
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 16px",
      background:
        copied === key
          ? "rgba(34,197,94,0.15)"
          : copied === key + "_fail"
            ? "rgba(239,68,68,0.1)"
            : "rgba(99,102,241,0.15)",
      border: `1px solid ${copied === key ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`,
      borderRadius: 8,
      color: copied === key ? "#22c55e" : "#818cf8",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }),
  };

  const Toggle = ({ label, value, onChange, color }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
        padding: "10px 14px",
        borderRadius: 8,
        transition: "all 0.2s",
        background: value ? `${color}14` : "rgba(255,255,255,0.03)",
        border: `1px solid ${value ? color : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: value ? color : "rgba(255,255,255,0.1)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          color: value ? "#f1f5f9" : "#64748b",
          fontWeight: value ? 600 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        fontFamily: "'DM Sans',-apple-system,sans-serif",
        color: "#f1f5f9",
        padding: "32px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.1);border-radius:999px;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#818cf8;cursor:pointer;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        select option{background:#1e293b;color:#f1f5f9;}
        ::placeholder{color:#334155;}
        input:focus,textarea:focus,select:focus{border-color:rgba(129,140,248,0.4)!important;}
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#4f46e5",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            AmaliTech · Backend Module
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg,#f1f5f9,#818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Lab Review Tool
          </h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 8 }}>
            Score a learner → Generate email & Excel row instantly
          </p>
        </div>

        {/* Review Details */}
        <div style={S.card}>
          <div style={S.slab}>Review Details</div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={S.label}>Reviewer Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your name"
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Review Date</label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                style={S.input}
              />
            </div>
          </div>
        </div>

        {/* Learner */}
        <div style={S.card}>
          <div style={S.slab}>Learner</div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={S.label}>Select Learner</label>
              <select
                value={learnerName}
                onChange={(e) => handleLearnerSelect(e.target.value)}
                style={{
                  ...S.input,
                  color: learnerName ? "#f1f5f9" : "#475569",
                  cursor: "pointer",
                }}
              >
                <option value="">— Choose a learner —</option>
                {LEARNERS.map((l) => (
                  <option key={l.email} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Learner Email</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={learnerEmail}
                  readOnly
                  placeholder="Auto-filled on learner select"
                  style={{
                    ...S.input,
                    color: learnerEmail ? "#818cf8" : "#334155",
                    background: learnerEmail
                      ? "rgba(99,102,241,0.08)"
                      : "rgba(255,255,255,0.02)",
                    cursor: "default",
                    paddingRight: learnerEmail ? 36 : 12,
                  }}
                />
                {learnerEmail && (
                  <div
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CC notice */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            <div>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                CC on every email:{" "}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#818cf8" }}>
                {EMMANUEL_EMAIL}
              </span>
            </div>
          </div>
        </div>

        {/* Lab & Attempt */}
        <div style={S.card}>
          <div style={S.slab}>Lab & Attempt</div>
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}
          >
            <div>
              <label style={S.label}>Lab Module</label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                style={{
                  ...S.input,
                  color: selectedLab ? "#f1f5f9" : "#475569",
                  cursor: "pointer",
                }}
              >
                <option value="">— Choose a lab —</option>
                {Object.keys(LAB_DATA).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Attempt</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["1st", "2nd"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAttempt(a)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 8,
                      fontFamily: "inherit",
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border:
                        attempt === a
                          ? "2px solid #818cf8"
                          : "1px solid rgba(255,255,255,0.08)",
                      background:
                        attempt === a
                          ? "rgba(99,102,241,0.2)"
                          : "rgba(255,255,255,0.03)",
                      color: attempt === a ? "#c7d2fe" : "#475569",
                      fontWeight: attempt === a ? 700 : 400,
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {attempt === "2nd" && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                fontSize: 12,
                color: "#f59e0b",
              }}
            >
              ⚠️ 2nd attempt — weights scaled to 80% of original. Maximum
              achievable score is <strong>80</strong>.
            </div>
          )}
          {lab && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "rgba(99,102,241,0.08)",
                borderRadius: 8,
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              {lab.description}
            </div>
          )}
        </div>

        {/* Criteria Scoring */}
        {lab && (
          <div style={S.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={S.slab}>Evaluation Criteria</div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{ fontSize: 26, fontWeight: 900, color: grade.color }}
                >
                  {totalScore}
                </span>
                <span style={{ fontSize: 13, color: "#475569" }}>
                  {" "}
                  / {maxScore}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: grade.color,
                    marginLeft: 8,
                  }}
                >
                  ({grade.label})
                </span>
                <div
                  style={{
                    fontSize: 11,
                    color: passed ? "#22c55e" : "#ef4444",
                    marginTop: 2,
                  }}
                >
                  {passed
                    ? "✅ Passed"
                    : `❌ Below passing score (${PASSING_SCORE})`}
                </div>
              </div>
            </div>
            {lab.criteria.map((c) => {
              const raw = scores[c.id] || 0;
              const ew = getWeight(c.weight, attempt);
              const ws = weightedScore(c.id, c.weight);
              return (
                <div
                  key={c.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "18px 22px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#f1f5f9",
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: "rgba(99,102,241,0.2)",
                            color: "#818cf8",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          {ew}%{attempt === "2nd" ? ` (base ${c.weight}%)` : ""}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {c.description}
                      </p>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        minWidth: 54,
                        marginLeft: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: raw === 0 ? "#334155" : "#818cf8",
                        }}
                      >
                        {raw} / 5
                      </div>
                      <div style={{ fontSize: 10, color: "#475569" }}>
                        weight: {ew}%
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={raw}
                      onChange={(e) =>
                        setScores((p) => ({
                          ...p,
                          [c.id]: parseInt(e.target.value),
                        }))
                      }
                      style={{
                        flex: 1,
                        accentColor: "#818cf8",
                        cursor: "pointer",
                        height: 4,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: raw === 0 ? "#475569" : "#c7d2fe",
                        minWidth: 96,
                        textAlign: "right",
                        fontStyle: raw === 0 ? "italic" : "normal",
                      }}
                    >
                      {RATING_LABELS[raw]}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Inline notes for this criterion…"
                    value={feedbacks[c.id] || ""}
                    onChange={(e) =>
                      setFeedbacks((p) => ({ ...p, [c.id]: e.target.value }))
                    }
                    style={{
                      marginTop: 10,
                      width: "100%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#94a3b8",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Flags */}
        {lab && (
          <div style={S.card}>
            <div style={S.slab}>Flags</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Toggle
                label="Re-do Lab Required"
                value={redoLab}
                onChange={setRedoLab}
                color="#f59e0b"
              />
              <Toggle
                label="Plagiarism Flagged"
                value={plagiarism}
                onChange={setPlagiarism}
                color="#ef4444"
              />
            </div>
          </div>
        )}

        {/* Remarks */}
        {lab && (
          <div style={S.card}>
            <div style={S.slab}>Remarks</div>
            {[
              {
                label: "Strengths",
                ph: "What did the learner do particularly well?",
                val: strengths,
                set: setStrengths,
              },
              {
                label: "Gaps",
                ph: "What areas need improvement?",
                val: improvements,
                set: setImprovements,
              },
              {
                label: "Other Remarks",
                ph: "Any additional comments…",
                val: otherRemarks,
                set: setOtherRemarks,
              },
            ].map(({ label, ph, val, set }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={S.label}>{label}</label>
                <textarea
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  rows={3}
                  style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Generate Button */}
        {lab && !report && (
          <>
            <button
              onClick={handleGenerate}
              disabled={!isValid}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                border: "none",
                background: isValid
                  ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                  : "rgba(255,255,255,0.05)",
                color: isValid ? "#fff" : "#334155",
                fontSize: 15,
                fontWeight: 700,
                cursor: isValid ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
              }}
            >
              Generate Report →
            </button>
            {!isValid && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#334155",
                  marginTop: 8,
                }}
              >
                Select a learner, lab, fill in reviewer name and date to
                continue
              </p>
            )}
          </>
        )}

        {/* ── REPORT OUTPUT ──────────────────────────────────────────────── */}
        {report && (
          <div ref={reportRef}>
            {/* Action bar */}
            <div
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#22c55e",
                  marginBottom: 4,
                }}
              >
                ✅ Report ready!
              </div>

              {/* Email addresses */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#475569",
                      marginBottom: 2,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    To
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#c7d2fe", fontWeight: 600 }}
                  >
                    {report.learnerEmail}
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#475569",
                      marginBottom: 2,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    CC
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#818cf8", fontWeight: 600 }}
                  >
                    {EMMANUEL_EMAIL}
                  </div>
                </div>
              </div>

              {/* Copy buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => copy(report.subject, "subject")}
                  style={S.copyBtn("subject")}
                >
                  {copied === "subject" ? "✓ Copied!" : "📋 Copy Subject"}
                </button>
                <button
                  onClick={() => copy(report.html, "html")}
                  style={S.copyBtn("html")}
                >
                  {copied === "html" ? "✓ Copied!" : "📧 Copy Email HTML"}
                </button>
                <button
                  onClick={() => copy(report.excelRow, "excel")}
                  style={S.copyBtn("excel")}
                >
                  {copied === "excel" ? "✓ Copied!" : "📊 Copy Excel Row"}
                </button>
                <button
                  onClick={() => copy(report.learnerEmail, "lemail")}
                  style={S.copyBtn("lemail")}
                >
                  {copied === "lemail" ? "✓ Copied!" : "@ Copy To Email"}
                </button>
                <button
                  onClick={reset}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#475569",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginLeft: "auto",
                  }}
                >
                  ← New Review
                </button>
              </div>

              {/* Fallback selectable text areas */}
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}
                >
                  💡 Click inside any field below — it auto-selects. Then press
                  Ctrl+C (or Cmd+C on Mac) to copy.
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4f46e5",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Subject Line
                    </div>
                    <textarea
                      readOnly
                      value={report.subject}
                      rows={1}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#c7d2fe",
                        fontSize: 12,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "monospace",
                        resize: "none",
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4f46e5",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Excel Row
                    </div>
                    <textarea
                      readOnly
                      value={report.excelRow}
                      rows={2}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#94a3b8",
                        fontSize: 11,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "monospace",
                        resize: "none",
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#4f46e5",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}
                    >
                      Email HTML (paste into Outlook HTML mode)
                    </div>
                    <textarea
                      readOnly
                      value={report.html}
                      rows={5}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#64748b",
                        fontSize: 11,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "monospace",
                        resize: "vertical",
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Excel row preview */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4f46e5",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  📊 Excel Row Preview
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>
                  Tab-separated — paste directly into your sheet
                </div>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#4f46e5",
                    marginBottom: 6,
                    letterSpacing: "0.05em",
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                    overflowX: "auto",
                  }}
                >
                  DATE │ LEARNER │ REVIEWER │ LAB │ ATTEMPT │{" "}
                  {report.criteriaRows
                    .map((c) => c.criterion.split(" ")[0])
                    .join(" │ ")}{" "}
                  │ TOTAL │ REDO │ PLAGIARISM │ STRENGTHS │ GAPS │ OTHER
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    lineHeight: 1.8,
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {report.excelRow}
                </div>
              </div>
            </div>

            {/* Email preview */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4f46e5",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  📧 Email Preview
                </div>
                <button
                  onClick={() => {
                    const w = window.open("", "_blank");
                    w.document.write(report.html);
                    w.document.close();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: 8,
                    color: "#818cf8",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🌐 Open in Browser
                </button>
              </div>
              <div style={{ background: "#f8fafc" }}>
                <iframe
                  srcDoc={report.html}
                  style={{
                    width: "100%",
                    height: 640,
                    border: "none",
                    display: "block",
                  }}
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Sending guide */}
            <div
              style={{
                background: "rgba(79,70,229,0.06)",
                border: "1px solid rgba(79,70,229,0.15)",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#818cf8",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginBottom: 6,
                }}
              >
                How to Send in Outlook
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#f59e0b",
                  marginBottom: 14,
                  padding: "8px 12px",
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 8,
                }}
              >
                ⭐ Recommended: Use the <strong>Open in Browser</strong> method
                below for the best formatting result in Outlook.
              </div>
              {[
                `Click 🌐 Open in Browser above — the email opens in a new browser tab`,
                `In the browser tab, press Ctrl+A (Windows) or Cmd+A (Mac) to select all`,
                `Press Ctrl+C / Cmd+C to copy the formatted content`,
                `Open Outlook → New Email`,
                `Click inside the email body and press Ctrl+V / Cmd+V to paste — formatting comes in perfectly`,
                `Set To: ${""} (use the @ Copy To Email button) and CC: ${EMMANUEL_EMAIL}`,
                `Copy Subject using 📋 Copy Subject and paste it into the Subject field`,
                `Hit Send`,
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.3)",
                      color: "#818cf8",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

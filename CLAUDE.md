# CLAUDE.md

## Project Overview

This is the **AmaliTech NSP Lab Review Tool**, a web application that helps technical trainers review learner lab submissions for the Node.js / backend module. It lets a reviewer score a learner against weighted criteria, generates a polished email report, and sends it directly to the learner (with a colleague CC'd).

The app is being extended to integrate **Claude AI** for three new capabilities:

1. **Auto-suggest scores** per criterion based on the learner's codebase + reviewer notes
2. **Auto-generate internal/criterion comments** in the reviewer's established voice
3. **Send the final report email** via a backend mail service

## Architecture

```
/client            React + Vite frontend (the existing lab review form)
  /src
    App.jsx        Main form component
    /components    UI components
    /lib           API client helpers (calls /api/*)
/server            Node + Express backend (NEW)
  /routes
    analyze.js     POST /api/analyze   -> proxies to Anthropic, returns scores + comments
    email.js       POST /api/send-email -> sends report via Nodemailer
    github.js      POST /api/fetch-repo -> fetches public repo files for analysis
  /services
    anthropic.js   Anthropic API client (key lives here, server-side only)
    mailer.js      Nodemailer transport + send logic
    githubFetch.js Fetches and flattens a public GitHub repo's key files
  /prompts
    reviewPrompt.js The system prompt that encodes the scoring rubric + reviewer voice
  index.js         Express app entry
.env               Secrets (NEVER commit)
```

## Critical Security Rules

- **The Anthropic API key lives ONLY in the backend** (`/server/.env` as `ANTHROPIC_API_KEY`). It must NEVER be sent to or referenced in the frontend. All Claude calls go through `POST /api/analyze`.
- **SMTP credentials live ONLY in the backend** (`/server/.env`). The frontend never sees them.
- `.env` is gitignored. A `.env.example` documents the required variables without values.
- The frontend calls relative `/api/*` endpoints; in dev, Vite proxies these to the Express server.

## Environment Variables (server/.env)

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
PORT=3001

# SMTP (example uses a dedicated Gmail or Outlook account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nsp.labreview@gmail.com
SMTP_PASS=app-specific-password
MAIL_FROM_NAME=AmaliTech NSP Reviews
MAIL_FROM_ADDRESS=nsp.labreview@gmail.com

# Always CC this colleague on every report
CC_EMAIL=emmanuel.asaber@amalitech.com
```

## Domain Model

### Learners (hardcoded roster)

| Name | Email |
|---|---|
| Illona Addae | <illona.addae@amalitech.com> |
| Abraham Jimah Zorwi | <abraham.zorwi@amalitech.com> |
| Kofi Frimpong Osei | <kofi.osei@amalitech.com> |
| Emmanuel Joe Letsu | <emmanuel.letsu@amalitech.com> |
| Kwadjo Wusu-Ansah | <kwadjo.wusu-ansah@amalitech.com> |
| Broderick Nana Bentil | <broderick.bentil@amalitech.com> |
| Jude Boachie | <jude.boachie@amalitech.com> |

Emmanuel Asaber (`emmanuel.asaber@amalitech.com`) is **always CC'd** on every report.

### Labs & Criteria (weights sum to 100%)

**RESTful Task Tracker**: Project Setup 10, Routing & Parameters 20, Middleware Usage 15, Error Handling 15, MVC Structure 15, Response Format 10, Code Quality & Clarity 15

**Task Tracker - Database**: Database Setup & Connection 15, Data Model/Schema 15, CRUD Integration 25, Async/Await & Error Handling 15, Environment Configuration 10, Response Quality 10, Code Organization & Clarity 10

**Task Tracker with Auth**: User Registration & Login 20, JWT Authentication 20, Protected Routes 20, Role-Based Access Control 15, Error Handling & Security 15, Code Organization & Documentation 10

**Media Library API**: Layered Architecture 20, Global Error Handling 20, Request Validation 15, File Upload Handling 20, Pagination/Filtering/Search 15, Async/Await & Promise Handling 10

**Testing, Deployment & Monitoring**: Postman Collection 15, Unit Tests 20, Integration Tests 20, Environment Configuration 15, Git Workflow & CI/CD 15, Deployment & Logging 15

**Full-Stack Kanban Application**: API Design & Structure 20, Database Modeling & Persistence 20, Authentication & Authorization 20, Functionality & Feature Completion 15, Frontend Integration 10, Code Quality & Documentation 10, Bonus/Stretch Features 5

## Scoring Formula

Each criterion is scored **0 to 5** (raw). The weighted total is:

```
Total % = Σ ( (rawScore / 5) × criterionWeight )
```

- Passing score: **80%**
- Grades: Distinction ≥ 95% of max, Merit ≥ 85% of max, Pass ≥ 80%, else Needs Work
- **Re-submissions (2nd attempt)**: every weight is scaled by **0.8**, so the maximum achievable score is **80%**. A perfect 5 across all criteria yields exactly 80%.

## Reviewer Voice & Comment Style (IMPORTANT for AI generation)

The reviewer addresses the learner **directly by first name** in a professional, constructive tone. Comments must:

- Open by addressing the learner by name ("Broderick, your...")
- Lead with genuine, specific strengths tied to **actual code references** (file names, function names, patterns)
- Name gaps honestly but constructively, always with the path to fix
- Reference specific code: e.g. "your `wrapAsync` utility in `utils/helpers.ts`"
- **Never use em-dashes or en-dashes.** Use commas, periods, or restructure the sentence.
- Read organically, like a human mentor wrote it, not a template
- For re-dos, acknowledge improvement from the previous attempt and apply stricter expectations
- Only award 4 or 5 when the codebase AND the verbal explanation both justify it
- A criterion can score 0 if the requirement is entirely unimplemented (e.g. no auth middleware in an auth lab)

### Three remark blocks always accompany the criterion comments

- **Strengths**: specific, code-referenced, genuine
- **Gaps**: honest, constructive, with the fix path
- **Other Remarks**: forward-looking mentorship, study suggestions, integrity notes if warranted

## Known Concerns to Watch For (code authorship)

The reviewer cares about whether learners can explain their own code. If reviewer notes indicate a learner could not explain core patterns they submitted (e.g. `process.exit(1)`, `wrapAsync`, `jwt.sign()`), the AI should reflect this in the comments and flag a potential authorship/understanding concern in the "Other Remarks" block, recommending it be raised in the plagiarism column where appropriate.

## Email Report

- Rendered as inline-styled HTML, table-based layout for the criterion cards (Outlook-safe).
- Hero: dark navy (#0b1f38), lab name in cyan (#38bdf8), glass-style metadata cards.
- Score bar: orange (#f97316) with a white progress bar and large score number.
- Numbered criterion cards, rounded remarks cards (strengths green, gaps red, other purple).
- Subject format: `Lab Review: {Lab} — {Learner Name} ({Grade})`
- Always CC `CC_EMAIL`.

## Coding Conventions

- Frontend: React functional components, hooks, no external state library needed.
- Backend: Express with async/await, errors forwarded to a centralized error handler.
- Never put secrets in the frontend or in committed files.
- Validate all request bodies on the backend before acting on them.
- Keep the Anthropic prompt logic in `/server/prompts/` so it is easy to tune.

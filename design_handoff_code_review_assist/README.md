# Handoff: Code Review Assist (LabLens)

## Overview

**Code Review Assist** is a new step inserted into LabLens's existing lab-review flow. LabLens is a cohort-based lab review app used by instructors across specializations (Frontend, Backend, QA, Data Engineering). Instructors record scores and remarks for a learner's lab submission; those **remarks are the raw input an AI step uses to generate the score**. Better remarks in → better scores out.

Code Review Assist helps the instructor produce better, more grounded remarks during a live one-on-one session. It reads the submitted code and turns it into a short, guided set of questions to work through with the learner. Each question carries an AI-generated **model answer** ("what to listen for"). As the instructor captures observations against each question, those notes **compile automatically into the existing reviewer-notes field** — the same field the scoring AI has always consumed. Assist augments how remarks are created; it does not replace the scores-and-remarks model.

The critical design element is the **seam**: how guided-review observations become the scoring AI's input remarks, with no re-typing.

## About the design files

The files in this bundle are **design references created in HTML** — a working prototype demonstrating intended look and behavior. They are **not production code to copy directly**.

- `LabLens.dc.html` — the full prototype. It is authored as a "Design Component" (a custom HTML format) and depends on `support.js` (a proprietary runtime, included only so the prototype opens in a browser). **Do not port the `.dc.html`/`support.js` machinery into your codebase.** Read it as a spec.
- `reference_guidance_sections.png` — reference screenshot of the guidance content model (collapsible focus-area sections, color legend, critical-gap headline).
- `reference_expected_answers.png` — reference screenshot of how each question pairs with its expected/model answer, tinted by severity.

Your task is to **recreate this feature in the target codebase's existing environment** (React, Vue, etc.), using its established component library, state management, styling system, and API layer. If no environment exists yet, choose the most appropriate framework and implement it there. **Assume LabLens already exists** — the review screen, the scores model, the reviewer-notes field, and the scoring-AI call are pre-existing. You are integrating Assist *into* that, not rebuilding the app.

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate the UI faithfully using your codebase's existing primitives. Exact tokens are in **Design Tokens** below.

---

## Where it fits in the existing flow

Existing flow: **open submission → write remarks → AI generates score.**

Assist is inserted between "open submission" and "write remarks". On the review screen (the "Review Workspace"), the left column is a numbered sequence of cards:

1. **01 · Code intake** (existing) — fetch repo from GitHub or paste code.
2. **02 · Code Review Assist** (NEW — this handoff) — replaces what was formerly a plain "Reviewer notes" textarea card.
3. **03 · Criteria scoring** (existing) — per-criterion rubric scores.
4. **04 · Remarks** (existing) — structured strengths/gaps/other.

The right column (existing) shows **Live Score**, flags, etc. and is unaffected except that it reads from the same remarks the Assist card now populates.

**Specialization-agnostic requirement (biggest constraint):** the *shell* — how Assist launches, how comments are captured, how they feed scoring — must be identical for every specialization. Only the *generated content* (the questions and model answers) varies by lab type. In the prototype this is modeled by selecting a guide by the cohort's rubric id (`rest-api` vs `cicd`); in production the guide comes from your generation service keyed on the submission's specialization/lab.

---

## Screens / Views

There are **two surfaces**, both driven by the same underlying state (edits in one reflect instantly in the other):

### A. The inline "02 · Code Review Assist" card (in the Review Workspace left column)

A card (`background: --surface; border: 1px solid --line; border-radius: 14px; box-shadow: --shadow`). Card header row (`padding: 15px 20px; border-bottom: 1px solid --line2`):

- Left: mono `02` in `--orange` (13px/700) · title **"Code Review Assist"** (14px/600) · a pill badge **"✦ AI ON-RAMP"** (9px/600 mono, letter-spacing .06em, `background: --ai-t; color: --ai-d; border: 1px solid --ai-line; border-radius: 6px; padding: 3px 8px`).
- Right: a **segmented toggle** `Guided | Freeform` (container `background: --line2; border-radius: 9px; padding: 3px`; active segment = white pill with shadow, inactive = transparent).

The card body has **four mutually-exclusive states**:

**A1. Launch (fresh review, guided mode, not yet generated)** — `padding: 24px 20px`, a two-column row:
- Left: heading "Start with a guided review" (15px/700) + explainer paragraph (12.5px, `--ink2`, line-height 1.55, max-width 460px): *"Assist reads the submission and turns it into a short set of questions to work through live with {learnerName} — adapted to {specialization}. Your answers compile straight into the reviewer notes the scoring AI reads. Recommended, but you can skip it."*
- Right: primary button **"✦ Generate guided review"** (`background: --orange; color:#fff; padding: 13px 22px; border-radius: 11px; 13.5px/600; box-shadow: 0 4px 12px rgba(242,107,33,.3)`) and below it a text button **"Skip — write freeform notes"** (12px/600, `--ink3`).

**A2. Generating** — `padding: 26px 22px`. A row: a 38×38 rounded tile (`--ai-t` bg, `--ai-line` border) holding an 18px spinner (border 2.5px `--ai-line`, top `--ai`, `ll-spin .8s linear infinite`); a title *"Reading the submission & adapting questions to {specialization}…"* (13.5px/600) + subtitle *"Grounding each question in the real code, not a template."* (11.5px, `--ink3`); a large percentage (20px/700 mono, `--ai-d`). Below: a 6px progress track (`--line2`) with a gradient fill (`linear-gradient(90deg, --ai, #8785EE)`) whose width = the percent, `transition: width .2s`. The percentage animates 0→100 over ~1.4s then transitions to the Guided state. (In production, drive this from the real generation request.)

**A3. Guided (ready)** — `padding: 16px 20px 20px`. Contents top to bottom:

1. **Guide meta row** (space-between):
   - Left: "Guide for {learnerName}" (13.5px/700) + a level pill (e.g. "Junior (0–2 yrs)", 9.5px/600 mono, `background: --blue-t; color: --blue`); below, the stack in mono 11.5px `--ink3` (e.g. "Node.js · Express · MongoDB"); below, "{N} focus areas · {M} questions · adapted to {specialization}" (11px, `--ink2`).
   - Right: two buttons — **"↻ Regenerate"** (outline: `border 1px --line; --ink2; 11.5px/600; padding 7px 12px; radius 9px`) and **"▶ Start live session"** (`background: --ink; color:#fff; padding 8px 14px; radius 9px; 11.5px/600; box-shadow 0 2px 8px rgba(20,24,33,.18)`).
2. **Live-session hint strip** (`background: --line2; radius 9px; padding 9px 13px`): "▶  Sitting down with {learnerName}? **Start live session** opens a focused, full-screen surface — just the guide and the notes, scoring hidden — for the conversation. Everything you capture there lands right back here." (11.5px, `--ink2`).
3. **Critical-gap headline** — a callout (`border 1px {gapColor}; border-left 3px {gapAccent}; background {gapBg}; radius 12px; padding 14px 16px`). Header: a 9×9 rounded dot ({gapColor}) + a mono label *"{KIND} — THE HEADLINE OF THIS SESSION"* (10px/700, letter-spacing .06em, colored by kind). Then a bold title (13.5px/700) and a body paragraph (12.5px, `--ink2`, line-height 1.6). Kind is one of critical/notable/concept (see color mapping below).
4. **Observed strengths** — a mono label "OBSERVED STRENGTHS" (10px/700, `--green-d`) then a wrap of chips: each `font-size 11.5px; color --green-d; background --green-t; border 1px #C7EAD8; padding 5px 11px; border-radius 20px`.
5. **Legend** (`background --line2; radius 9px; padding 9px 13px`): three inline items, each a 9×9 rounded dot + label — red `--red` "Critical gap or real bug", amber `--amber` "Notable pattern worth probing", grey `#B7BECC` "Concept question".
6. **Focus-area sections** (vertical stack, gap 10px). Each section is a **collapsible**:
   - Header button (full width, `border 1px --line; radius 11px; padding 12px 14px; background --surface` or `#FBFBFC` when open): an icon glyph (15px, `--ink2`), the section title (13.5px/600), a progress badge "{answered}/{total}" (mono 10.5px, `background --line2; radius 6px; padding 3px 8px`), and a chevron (`–` open / `+` closed).
   - When open: a stack of **question rows** (see component below).
7. **Instructor-added questions** — if any exist, a mono label "ADDED BY YOU" then the same question rows (but with a **Remove** button instead of Skip, and no expected-answer block).
8. **Add-your-own row** — a text input ("Add your own question…") + an **"+ Add"** button (`background --ink` when input non-empty, else `--line2`/`--ink3`; `padding 9px 15px; radius 9px; 12px/600`).
9. **THE SEAM — "Reviewer notes" panel** (`border 1px --ai-line; radius 13px; background --ai-t; overflow hidden`):
   - Header (`padding 11px 15px; border-bottom 1px --ai-line`): "↳ Reviewer notes — what the scoring AI reads" (12px/700, `--ai-d`) and a badge "{answered} of {total} captured" (mono 10.5px, white bg, `--ai-line` border).
   - A 5px progress track (white, `--ai-line` border) with an `--ai` fill = capture percent.
   - A **textarea** (min-height 104px, white bg, `--ai-line` border, radius 10px, 12.5px, line-height 1.6) bound to the reviewer-notes value. Below it, helper text (10.5px, `--ai-d`): "Compiled live from your guided answers — edit freely. This is the same remarks field the AI has always used; Assist just fills it faster and keeps it grounded."

**A4. Freeform** — `padding 18px 20px`. Helper line (12px, `--ink3`): "Freeform mode — write your live-session observations directly. Switch to **Guided** any time for AI-generated questions grounded in the code." Then a plain textarea (min-height 120px, `--line` border, radius 10px, 13px) bound to the same reviewer-notes value.

### B. The full-screen Live Session (focus mode)

A `position: fixed; inset: 0; z-index: 200; background: --bg` overlay, opened by "▶ Start live session", closed by "✕ Exit session" or "Done — back to review". Entering opens **all** sections. Layout is a column:

**Top bar** (`flex: none; background: #15181D; color: #fff; padding: 13px 26px`, flex row):
- A pulsing 8px orange dot (`ll-pulse 1.4s infinite`) + mono label "LIVE SESSION" (11px/700, letter-spacing .1em, `--orange`).
- A vertical divider, then "{learnerName} · {labName}" (14px/600) with a mono sub-line "{stack} · {specialization}" (11px, `rgba(255,255,255,.55)`).
- Pushed right: a small right-aligned block "{answered} of {total} captured" (11px, `rgba(255,255,255,.55)`) over a 120px progress track (`rgba(255,255,255,.14)` with `--orange` fill), then an **"✕ Exit session"** button (`background rgba(255,255,255,.1); border 1px rgba(255,255,255,.18); color #fff; padding 9px 16px; radius 10px; 12.5px/600`).

**Body** — a flex row filling remaining height:
- **Left column** (`flex: 1; overflow-y: auto; padding: 26px 30px`, inner max-width 720px, centered): the **critical-gap headline** (slightly larger: title 15px, body 13px), **observed strengths** ("OBSERVED STRENGTHS — LEAD WITH THESE"), then the sections **rendered expanded, non-collapsible** (each: icon + title 15px/700 + a "{answered}/{total}" badge, then its question rows), then "ADDED BY YOU" and the add-your-own row. Question rows here use slightly larger type (question 15px, expected-answer body 12.5px, note textarea 13.5px).
- **Right column** (`flex: none; width: 400px; border-left: 1px solid --line; background: --ai-t`, column): sticky **seam** — header "↳ Reviewer notes" (13px/700, `--ai-d`) + sub "What the scoring AI reads. Compiling live from your answers on the left." + a progress track; a full-height textarea (`resize: none`) bound to the reviewer-notes value; a footer with a full-width **"Done — back to review"** button (`background --orange; color #fff; padding 12px; radius 10px; 13px/600`).

---

## Component: the Question Row (used in both surfaces)

A card: `border: 1px solid {rowBorder}; border-left: 3px solid {accent}; border-radius: 11–12px; background: {rowBg}; padding: 12–16px`.

Top flex row:
- A 9–10px rounded **severity dot** ({kind dot color}), aligned to the first text line.
- A flex-1 text column:
  - **Question text** (13px inline card / 15px live; weight 600; line-height ~1.5).
  - Optional **code reference** (only if present): mono 10.5–11px `--ink3`, prefixed "grounded in: " (e.g. `controllers/tasks.controller.js`, `ci.yml:34`, `middleware/validate.js`). NOTE: in the reference screenshots the reference renders as a bordered chip/pill — either treatment is acceptable; keep it monospace and muted.
  - **Expected-answer block** (only if the question has a model answer — generated questions do; instructor-added ones do not): a tinted panel `background: {kind tagBg}; border-radius: 8–9px; padding: 8–13px`, containing a mono eyebrow **"✦ EXPECTED ANSWER · what to listen for"** (9–9.5px/700, letter-spacing .05em, color = {kind tagFg}) and the model-answer text (11.5–12.5px, line-height ~1.5, `--ink2`). This is what tells the instructor what a strong response sounds like.
- A flex-none actions cluster:
  - **Capture** toggle button — default: `border 1px --line; #fff bg; color --ink2; label "Capture"`. When captured (done): `border 1px --green; color --green-d; label "✓ Captured"`. (11px/600, padding 4px 10px, radius 7px.)
  - **Skip** text button (`--ink3`, borderless) — toggles skip; label flips to "Undo" when skipped. (In the "added by you" list this is a **Remove** button instead.)

Row background/behavior by state:
- Default: `background = {kind bg}`, `border = --line`.
- Captured (done): `background = --green-t`, `border = --green`.
- Skipped: `background = #FAFAFB`, `border = --line`, `accent = --line`; the note textarea is **hidden** and replaced by italic text "Skipped — not included in reviewer notes."; skipped questions are **excluded** from the compiled remarks.
- Otherwise a **note textarea** is shown (min-height 52–58px, white bg, `--line` border, radius 9px), placeholder "What did they say? What did you observe?" (inline) / "Capture what they said, what you observed…" (live), bound to that question's note.

### Kind → color mapping

| kind | dot | accent (left border) | tag label | tagFg (eyebrow) | tagBg (expected-answer panel) | default row bg |
|---|---|---|---|---|---|---|
| `critical` | `--red` (#D9434A) | `--red` | CRITICAL | `--red` | `--red-t` (#FCEAEA) | `#FEF5F5` |
| `notable` | `--amber` (#D98A0B) | `--amber` | NOTABLE | `--amber` | `--amber-t` (#FBF1DC) | `#FEFAF0` |
| `concept` | `#B7BECC` | `--line` | CONCEPT | `--ink3` (#8A93A2) | `--line2` (#F0F2F5) | `#FFFFFF` |

---

## Interactions & Behavior

- **Mode toggle** — Guided ↔ Freeform. Both bind the **same** reviewer-notes value. Switching does not clear it.
- **Optionality (recommended but skippable)** — Guided is the default and is nudged (primary button, hint strip), but the instructor can skip to Freeform at any time and type remarks by hand. Assist is **not** a required step.
- **Generate / Regenerate** — "Generate guided review" runs the generating animation then reveals the guide. "Regenerate" re-runs it and **clears** captured notes/done/skipped/added questions for a fresh set. (Production: call the generation service; show a real progress/loading state.)
- **Capture toggle** — marks a question visually captured (green); purely a visual/organizational aid.
- **Skip / Undo** — excludes a question from compiled remarks; hides its note field.
- **Add / Remove question** — instructor can append their own questions (no model answer) and remove them.
- **Section collapse** — inline card sections collapse/expand (chevron `+`/`–`); live session shows all expanded.
- **The compile (seam)** — whenever any note, skip, or added/removed question changes, the reviewer-notes value is **recompiled** from all non-skipped questions that have a non-empty note, grouped by section. The instructor can still freely edit the compiled text in the textarea. See "Compile format" below.
- **Enter live session** — opens the fixed overlay and expands all sections. **Exit / Done** — closes it. State is shared, so anything captured in either surface is present in the other on switch.
- **Reset on context change** — when the instructor switches learner, lab, cohort, or attempt, Assist resets to the Launch state (guide cleared, notes cleared, back to guided mode).
- **Animations** — `ll-spin` (spinner, 0.8s linear infinite), `ll-pulse` (opacity 0.4↔1, live dot), `ll-fade` (overlay entrance, 0.18s), progress-fill width transitions (0.2–0.3s).

### Compile format (guided answers → reviewer notes)

The compiled string is what lands in the reviewer-notes / remarks field. Structure used in the prototype:

```
Guided review — {labName} ({learnerName})

{SECTION TITLE, UPPERCASE}
— {question text}
  {instructor's note}
— {question text}
  {instructor's note}

{NEXT SECTION TITLE}
— {question text}
  {instructor's note}

ADDED BY YOU
— {added question text}
  {instructor's note}
```

Only sections with at least one answered (non-skipped, non-empty-note) question are included. **This exact shape is a placeholder for the contract your scoring AI already expects — match whatever structure your existing remarks/scoring step consumes.** The key requirement: guided observations must land in the existing remarks field with no re-typing, preserving the current scores-and-remarks model as the source of truth.

---

## State Management

Per active review (reset when learner/lab/cohort/attempt changes):

- `assistMode`: `'guided' | 'freeform'` — which tab is active.
- `guideReady`: boolean — a guide has been generated.
- `guideGenerating`: boolean + `guideGenPct`: number — generation in progress + percent.
- `guide`: the generated content object (see Data shape). In production this comes from your generation service, keyed on the submission's specialization/lab/cohort.
- `guideNotes`: `{ [questionId]: string }` — per-question instructor notes.
- `guideDone`: `{ [questionId]: boolean }` — captured toggles.
- `guideSkipped`: `{ [questionId]: boolean }` — skip toggles.
- `guideExtra`: array of instructor-added questions `{ id, kind:'concept', ref:'', text }` (no `expect`).
- `newGuideQ`: string — the add-your-own input buffer.
- `openSections`: `{ [sectionId]: boolean }` — collapse state (inline card).
- `liveSession`: boolean — full-screen overlay open.
- `notes` (existing): the reviewer-notes / remarks string — **the pre-existing field**; Assist writes to it via the compile step, and Freeform binds to it directly.

Derived per render: per-section answered/total counts; overall answered/total; capture percent; kind→color styling for each question.

### Data shape (generated guide)

```
{
  stack:        "Node.js · Express · MongoDB",     // display string
  level:        "Junior (0–2 yrs)",                 // pill label
  specialization: "Backend",                        // from cohort/lab
  lab:          "RESTful Task Tracker",
  learner:      "Ama Osei",
  focusTags:    ["REST","Middleware","Error handling"],
  gapKind:      "notable",                           // critical|notable|concept
  gapTitle:     "Solid submission — the teaching moment is error handling",
  gapBody:      "…paragraph…",
  strengths:    ["Consistent { success, data, message } envelope", …],
  sections: [
    {
      id: "err",
      title: "Error handling (start here)",
      icon: "⚠",                                     // glyph
      questions: [
        {
          id:   "err-null",
          kind: "critical",                          // critical|notable|concept
          ref:  "controllers/tasks.controller.js",   // code reference, may be ""
          text: "Walk me through what happens when findById returns null…",
          expect: "Should recognise it is NOT handled — a null falls through…"  // model answer / "what to listen for"
        },
        …
      ]
    },
    …
  ]
}
```

Every generated question includes `expect` (the model answer). Instructor-added questions omit it. The full seeded content for two specializations (`rest-api` Backend and `cicd` DevOps) lives in the `guides` object inside the logic class of `LabLens.dc.html` — copy the copywriting from there.

---

## Design Tokens

**Colors**
```
--bg:       #F4F5F7   page background
--surface:  #FFFFFF   cards
--ink:      #15181D   primary text / dark buttons / live-session top bar
--ink2:     #576070   secondary text
--ink3:     #8A93A2   tertiary / muted text
--line:     #E7E9EE   borders
--line2:    #F0F2F5   subtle fills / dividers / segmented-control track

--orange:   #F26B21   brand / primary buttons / step numbers
--orange-d: #CF5310   orange text on tint
--orange-t: #FFF1E8   orange tint bg
--orange-t2:#FBD9C2   orange tint border

--ai:       #5B59E0   AI accent (seam, generating)
--ai-d:     #4644C2   AI text
--ai-t:     #EEEEFC   AI tint bg (seam panel)
--ai-line:  #CFCDF6   AI tint border

--green:    #16A36A   captured/pass         --green-d: #0F7C50   --green-t: #E6F6EF   (chip border #C7EAD8)
--amber:    #D98A0B   notable               --amber-t: #FBF1DC
--red:      #D9434A   critical              --red-t:   #FCEAEA
--blue:     #2A57C9   level pill            --blue-t:  #E7EEFB

concept dot: #B7BECC          critical row bg: #FEF5F5     notable row bg: #FEFAF0
skipped row bg: #FAFAFB       live-session top bar: #15181D
generating gradient: linear-gradient(90deg, #5B59E0, #8785EE)
```

**Typography**
```
--sans: 'IBM Plex Sans', system-ui, -apple-system, sans-serif   (body, UI)
--mono: 'IBM Plex Mono', ui-monospace, monospace                (step numbers, eyebrows, refs, badges)
```
Load IBM Plex Sans + IBM Plex Mono (weights 400/500/600/700). Body uses `-webkit-font-smoothing: antialiased`.

Type scale used in this feature: 9px (mono eyebrows), 10–10.5px (mono labels/badges), 11–12px (helper/meta), 12.5–13px (body, inline question), 13.5–14px (card titles, live question), 15px (live question / gap title / launch heading), 20px (generating percent).

**Radii**: 6px (badges), 7px (small buttons), 8–9px (inputs, note fields, tint panels), 10–12px (buttons, question rows, callouts), 13–14px (cards, seam panel), 20px (chips).

**Shadows**
```
--shadow:   0 1px 2px rgba(20,24,29,.04), 0 1px 3px rgba(20,24,29,.05)   cards
--shadow-l: 0 6px 22px rgba(20,24,29,.09)                                popovers
orange button: 0 4px 12px rgba(242,107,33,.3)
ink button:    0 2px 8px rgba(20,24,33,.18)
```

**Spacing**: card padding 15–20px; body paddings 16–26px; gaps 7–16px; section stack gap 10px; live-session left column 26px/30px.

---

## Assets

- **Fonts**: IBM Plex Sans + IBM Plex Mono (Google Fonts). Use your codebase's existing font-loading approach.
- **Icons**: the prototype uses plain Unicode glyphs (✦ ↳ ▶ ✕ ↻ ⚠ ⇄ ↧ ↥ ↤ ▤ ◤ ✎ – +). Replace with your codebase's icon set (equivalents: sparkle/AI, corner-down-arrow for the seam, play, x/close, refresh, alert-triangle, arrows, document, pencil, minus/plus).
- **No raster/image assets** are required for this feature. The two `reference_*.png` files are documentation only.
- If LabLens has a brand system in your codebase, prefer its tokens where they map to the values above.

---

## Files in this bundle

- `README.md` — this document (self-sufficient spec).
- `LabLens.dc.html` — the full working prototype. Feature source of truth:
  - Template: search for `02 · CODE REVIEW ASSIST` (inline card, ~line 482) and `CODE REVIEW ASSIST · LIVE SESSION` (overlay, ~line 1370).
  - Logic: search for `guides = {` (generated content for both specializations), `generateGuide` / `finishGuide` / `compileGuide` / `syncGuideNotes` (generation + the seam), `mkQ` (per-question styling), `enterLive` / `exitLive`, and `guideReset` (context-change reset). All exact copywriting and the two seeded guides live here.
- `support.js` — proprietary prototype runtime. **Reference only; do not port.**
- `reference_guidance_sections.png`, `reference_expected_answers.png` — reference screenshots.

To view the prototype: open `LabLens.dc.html` in a browser, go to **Review Workspace** in the sidebar, scroll to card **02**, and click **▶ Start live session**. Switch the cohort (top-left) to see the questions adapt by specialization.

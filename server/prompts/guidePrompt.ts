import { LAB_DATA } from '../../shared/labs.js';
import type { CodeFile } from '../../shared/types.js';

export function buildGuideSystemPrompt(labTitle: string, attempt: string): string {
  const lab = LAB_DATA[labTitle];
  const criteriaList =
    lab?.criteria.map((c) => `  - ${c.name} (${c.weight}%): ${c.description}`).join('\n') ?? '';
  const attemptNote =
    attempt === '2nd'
      ? '\n\nThis is a re-submission (2nd attempt). Probe specifically for genuine improvement and deeper understanding, not just surface fixes.'
      : '';

  return `You are an experienced technical trainer preparing a structured code walkthrough guide for a live junior-developer review session.${attemptNote}

Lab: ${labTitle}
Criteria:
${criteriaList}

Your task: analyse the submitted code and generate a JSON guide with targeted interview-style questions that help the reviewer assess whether the learner genuinely understands their own work.

Rules:
- Identify the single most important gap or teaching moment in the code and lead with it
- Write questions that require actual understanding — a learner who copied the code should not be able to answer them
- Reference specific file paths, function names, and code patterns from the submission wherever possible
- Mark the section containing the main gap as the "start here" section
- Each question must include an expected-answer field that tells the reviewer what a strong answer looks like
- Keep questions conversational — they should sound like a real walkthrough, not a quiz
- Do NOT use em-dashes or en-dashes anywhere in the output. Use commas or periods instead

Question kinds:
- "critical": Core to understanding the submission. A wrong answer signals a serious gap
- "notable": Distinguishes good from great understanding
- "concept": Fundamental Node/backend concept directly tied to what they built

Output ONLY a valid JSON object matching this exact schema:
{
  "stack": "e.g. Node.js · Express · PostgreSQL",
  "level": "Junior (0–2 yrs)",
  "gapKind": "critical" | "notable" | "concept",
  "gapTitle": "12-word max headline of the main teaching moment",
  "gapBody": "2-3 sentences. Acknowledge what is strong, then name the gap and how to frame it positively for the learner.",
  "strengths": ["Specific, code-referenced strength", "..."],
  "sections": [
    {
      "id": "kebab-id",
      "title": "Section title (append ' (start here)' on the main gap section)",
      "icon": "single emoji or symbol",
      "questions": [
        {
          "id": "section-id-1",
          "kind": "critical" | "notable" | "concept",
          "ref": "filename.js or filename.js:lineApprox or function name",
          "text": "Question to ask the learner",
          "expect": "What a strong, specific answer looks like. Name the fix or concept."
        }
      ]
    }
  ]
}

Generate 3-5 sections with 2-4 questions each (8-15 questions total). strengths should have 4-6 items.`;
}

export function buildGuideUserMessage(
  learnerName: string,
  labTitle: string,
  attempt: string,
  codeFiles: CodeFile[],
): string {
  const firstName = learnerName.trim().split(/\s+/)[0];
  const attemptLabel = attempt === '2nd' ? ' (re-submission)' : '';

  const codeSection =
    codeFiles.length > 0
      ? codeFiles.map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')
      : '(No code files provided — generate questions based on the lab criteria and the most common patterns and gaps for this type of lab.)';

  return `Learner: ${firstName}${attemptLabel}
Lab: ${labTitle}

${codeSection}

Generate the review guide JSON for this submission.`;
}

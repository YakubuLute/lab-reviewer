export type KindType = 'critical' | 'notable' | 'concept';

export interface GuideQuestion {
  id: string;
  kind: KindType;
  ref: string;
  text: string;
  expect: string;
}

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  questions: GuideQuestion[];
}

export interface Guide {
  stack: string;
  level: string;
  gapKind: KindType;
  gapTitle: string;
  gapBody: string;
  strengths: string[];
  sections: GuideSection[];
}

export const GUIDE_DATA: Record<string, Guide> = {
  'rest-api': {
    stack: 'Node.js · Express · MongoDB',
    level: 'Junior (0–2 yrs)',
    gapKind: 'notable',
    gapTitle: 'Solid submission — the teaching moment is error handling',
    gapBody:
      'Structure, routing and response envelopes are genuinely strong. The thread to pull live is error handling: every route has its own try/catch, there is no central handler, so failure responses drift. The reasoning behind middleware execution order was also shaky in the walkthrough. Frame it as "the foundation is solid — now make failure behave like success."',
    strengths: [
      'Consistent { success, data, message } envelope',
      'Genuinely RESTful routing',
      'Clean routes / controllers / models split',
      'Documented .env.example',
      'Correct status codes throughout',
      'Steady, incremental commits',
    ],
    sections: [
      {
        id: 'err',
        title: 'Error handling (start here)',
        icon: '⚠',
        questions: [
          {
            id: 'err-null',
            kind: 'critical',
            ref: 'controllers/tasks.controller.js',
            text: 'Walk me through what happens when findById returns null — where is that handled?',
            expect:
              'Should recognise it is NOT handled — a null falls through and the code calls a property on it, throwing a 500. Strong answer names the fix: guard for null and return a 404 before touching the document.',
          },
          {
            id: 'err-central',
            kind: 'notable',
            ref: 'per-route try/catch',
            text: 'You catch errors in every route. What would one central error handler let you delete?',
            expect:
              'Every repeated try/catch block — controllers just throw (or call next(err)) and one app-level error middleware formats the response. Bonus: names a consistent error shape and status codes as the real payoff.',
          },
          {
            id: 'err-next',
            kind: 'concept',
            ref: '',
            text: 'How would you forward an error from a controller to that handler?',
            expect:
              "Call next(err) (or throw inside an async wrapper) so Express routes it to the error-handling middleware — the one with four args (err, req, res, next). Weaker answers know it exists but can't name the four-arg signature.",
          },
        ],
      },
      {
        id: 'mw',
        title: 'Middleware & request flow',
        icon: '⇄',
        questions: [
          {
            id: 'mw-order',
            kind: 'notable',
            ref: 'middleware/validate.js',
            text: 'Why does the validation middleware have to run before the route handler?',
            expect:
              'So invalid input is rejected before any business logic or DB call runs — the handler can then assume clean data. Should tie it to Express running middleware top-to-bottom and validate calling next() only when the payload passes.',
          },
          {
            id: 'mw-404',
            kind: 'concept',
            ref: 'app.js:22',
            text: 'There is no 404 catch-all. Where would it sit relative to the error handler?',
            expect:
              'After all routes but before the error handler — an unmatched request falls past every route, the catch-all makes a 404, and the error middleware (registered last) formats it.',
          },
        ],
      },
      {
        id: 'routing',
        title: 'Routing & structure',
        icon: '↧',
        questions: [
          {
            id: 'rt-patch',
            kind: 'notable',
            ref: 'routes/tasks.routes.js:18',
            text: 'One PATCH route carries logic. What belongs in the controller vs the route?',
            expect:
              "The route should only wire method + path to a controller function; all logic (lookup, update, response) lives in the controller. Should give the separation-of-concerns reason, not just 'it's cleaner'.",
          },
          {
            id: 'rt-rest',
            kind: 'concept',
            ref: '',
            text: 'What makes these routes RESTful? Name the resource and its verbs.',
            expect:
              'Tasks is the resource; GET, POST, PATCH/PUT, DELETE map to the operations, noun in the URL and verb in the HTTP method. Should avoid verbs in the path (e.g. /getTasks).',
          },
        ],
      },
      {
        id: 'reflect',
        title: 'Reflection',
        icon: '✎',
        questions: [
          {
            id: 'rf-harden',
            kind: 'concept',
            ref: '',
            text: 'If you had one more day, what would you harden first — and why that?',
            expect:
              "No single right answer — you're listening for prioritised reasoning. A strong learner names error handling (the session's headline) or input validation and justifies it by impact, not a cosmetic tweak.",
          },
        ],
      },
    ],
  },

  cicd: {
    stack: 'GitHub Actions · Docker · Node',
    level: 'Junior (0–2 yrs)',
    gapKind: 'critical',
    gapTitle: 'Tests run but do not gate the build',
    gapBody:
      'A failing test suite can still ship an image — the test job runs but the build job does not depend on it. There is also no rollback path if a bad image deploys. Everything around it (multi-stage build, secrets handling, environment-gated deploy) is production-grade, so approach it as "the pipeline is well built — now make it refuse to ship broken code."',
    strengths: [
      'Multi-stage Docker build',
      'No secrets anywhere in the repo',
      'Encrypted Actions secrets',
      'Sensible job split (lint → test → build)',
      'npm dependency caching',
      'Environment-gated deploy with approval',
    ],
    sections: [
      {
        id: 'gate',
        title: 'The test gate (start here)',
        icon: '⚠',
        questions: [
          {
            id: 'g-fail',
            kind: 'critical',
            ref: 'ci.yml:34',
            text: 'Your test job runs, but the build still succeeds when tests fail. Show me why.',
            expect:
              "Should trace it to the jobs being independent — build has no needs: on test, so they run in parallel and build never sees the result. Fix is needs: [test] so build only starts if test passes.",
          },
          {
            id: 'g-needs',
            kind: 'concept',
            ref: '',
            text: 'What does needs: between jobs change about ordering and failure?',
            expect:
              "needs: makes a job wait for the named job(s) AND only run if they succeeded — it creates the dependency edge, so a failed dependency skips the dependent job. Weaker answers think it only controls order.",
          },
          {
            id: 'g-required',
            kind: 'notable',
            ref: 'branch protection',
            text: 'How do you make a check required so red tests actually stop the pipeline?',
            expect:
              'Mark the check as required in branch-protection rules on the default branch, so a failing or absent check blocks merge. Should distinguish CI running from CI being enforced as a gate.',
          },
        ],
      },
      {
        id: 'deploy',
        title: 'Deploy & rollback',
        icon: '↥',
        questions: [
          {
            id: 'd-recover',
            kind: 'critical',
            ref: 'deploy.yml',
            text: 'If this deploy ships a broken image, what is your recovery path today?',
            expect:
              "Honest answer: there isn't one — images are tagged latest and the old one is overwritten, so there's nothing to roll back to. Recognising the gap matters more than a polished fix.",
          },
          {
            id: 'd-tag',
            kind: 'concept',
            ref: '',
            text: 'How would keeping the previous image tag enable a rollback job?',
            expect:
              'Tag images immutably (by commit SHA or version) so every deploy is addressable; a rollback job re-deploys the previous known-good tag. Should connect immutable tags to recoverability.',
          },
        ],
      },
      {
        id: 'docker',
        title: 'Docker & config',
        icon: '▤',
        questions: [
          {
            id: 'dk-latest',
            kind: 'notable',
            ref: 'Dockerfile:1',
            text: 'The base image is on latest. What breaks the day it moves?',
            expect:
              'A silent upgrade can change the runtime and break the build with no code change — builds stop being reproducible. Fix is pinning to a specific version (ideally a digest).',
          },
          {
            id: 'dk-secrets',
            kind: 'concept',
            ref: 'repo settings',
            text: 'Where do your secrets come from at runtime — walk me through it.',
            expect:
              "Stored as encrypted Actions/environment secrets, injected as env vars into the job at run time, never committed. Should confirm they aren't baked into image layers or printed to logs.",
          },
        ],
      },
      {
        id: 'docs',
        title: 'Docs & operability',
        icon: '✎',
        questions: [
          {
            id: 'dc-ops',
            kind: 'notable',
            ref: 'README.md',
            text: 'Could another engineer operate this pipeline from your README alone?',
            expect:
              "You're probing whether the docs cover how to trigger a deploy, where secrets are configured, and how to recover from failure — not just how to build locally. Strong learner points to those sections or flags they're missing.",
          },
        ],
      },
    ],
  },
};

export const LAB_TO_GUIDE: Record<string, string> = {
  'RESTful Task Tracker': 'rest-api',
  'Task Tracker - Database': 'rest-api',
  'Task Tracker with Auth': 'rest-api',
  'Media Library API': 'rest-api',
  'Testing, Deployment & Monitoring': 'cicd',
  'Full-Stack Kanban Application': 'rest-api',
};

export const LAB_SPECIALIZATION: Record<string, string> = {
  'RESTful Task Tracker': 'Backend',
  'Task Tracker - Database': 'Backend',
  'Task Tracker with Auth': 'Backend',
  'Media Library API': 'Backend',
  'Testing, Deployment & Monitoring': 'DevOps',
  'Full-Stack Kanban Application': 'Full-Stack',
};

export interface ExtraQuestion {
  id: string;
  kind: 'concept';
  ref: string;
  text: string;
}

export function compileGuideNotes(
  guide: Guide,
  learnerName: string,
  labName: string,
  guideNotes: Record<string, string>,
  guideSkipped: Record<string, boolean>,
  guideExtra: ExtraQuestion[],
): string {
  const lines: string[] = [];
  lines.push(`Guided review — ${labName} (${learnerName})`);
  lines.push('');

  for (const section of guide.sections) {
    const answered = section.questions.filter(
      (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim(),
    );
    if (answered.length === 0) continue;
    lines.push(section.title.toUpperCase());
    for (const q of answered) {
      lines.push(`— ${q.text}`);
      lines.push(`  ${guideNotes[q.id].trim()}`);
    }
    lines.push('');
  }

  const answeredExtra = guideExtra.filter(
    (q) => !guideSkipped[q.id] && (guideNotes[q.id] ?? '').trim(),
  );
  if (answeredExtra.length > 0) {
    lines.push('ADDED BY YOU');
    for (const q of answeredExtra) {
      lines.push(`— ${q.text}`);
      lines.push(`  ${guideNotes[q.id].trim()}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

# Rova

### Think it through. Go the distance.

**A math learning app that helps students work through a problem and gives teachers and families a clear next step.**

Built for **HackATL 2026** · *Designing the World After AI*

[Get started](#getting-started) · [Walk through the demo](#8-demo) · [Build spec](#17-build-spec)

---

## Why Rova?

AI made answers instant, not learning. Rova starts with a different question: **what does this student need to understand next?**

Students practice with hints and visual models. Teachers see the evidence behind a struggle, assign support, and review what happened. Families get progress in plain language and something practical to try at home.

> **Prototype status:** the coach, question suggestions, and lesson summaries are rule-based. No AI model is called, and no API key is required. Math answers are always checked by code. The sample class and starting history are **Simulated**.

## Three connected workspaces

| Workspace | What you can do |
| --- | --- |
| **Student** | Practice six grade 4 math foundations, ask for hints, explore interactive pictures, resume assigned lessons, and follow progress. |
| **Teacher** | Find learners who need support, inspect the reasons behind their status, assign small-group lessons, review conversations, and send family notes. |
| **Parent** | See your child's progress, school support, and recent wins; read teacher notes and complete short at-home activities. |

The six foundations are **place value, multiplication, division, fractions, measurement, and shapes & angles**. They include 18 built-in questions, with teacher-added questions available through the question bank.

A separate **grade 6 ratios stretch challenge** demonstrates prerequisite tracing: after two checked misses on one question, Rova suggests an equivalent-fractions refresher, then lets the student return to the original problem. Teachers see the evidence; families receive in-app updates.

Teachers also have a question bank with course-material uploads, template-based suggestions, and manual question creation. Lessons can use a random count or a hand-picked set of questions. The progress report supports filters, CSV export of the intervention log, and printing.

## Getting started

Use **Node.js 24** and npm. Node 18 cannot run the current tooling.

```bash
git clone https://github.com/suvrat23/Rova.git
cd Rova
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000), then choose **Log in**. No database service, environment file, or AI credentials are needed for a local run.

### Sample accounts

On the login page, open **Explore with a sample account** and choose a role, or enter:

| Role | Email | Demo password |
| --- | --- | --- |
| Teacher · Elena Rivera | `teacher@rova.school` | `rova2026` |
| Student · Maya Chen | `student@rova.school` | `rova2026` |
| Parent · Alex Chen | `parent@rova.school` | `rova2026` |

These are fictional demo accounts, defined in [mock-accounts.json](lib/product/mock-accounts.json). Student sign-up uses class code `MAPLE4`; parent sign-up for Maya uses family code `MAYA4`.

**Switching roles:** sign out before signing into another role in the same browser. Tabs share the session cookie. Use separate browser profiles if you want the workspaces open side by side.

<a id="8-demo"></a>

## Demo

The main story is **teacher assigns → student practices → teacher reviews → family follows up**.

1. **Teacher:** open the classroom, select Maya, and assign a fractions lesson. Each assigned learner has their own completion state.
2. **Student:** open that assignment. Ask for the answer, try a wrong answer, and request a picture to see how the coach guides the next attempt.
3. **Student:** solve each assigned question. Code checks the answers; the assignment completes only when the full set is solved.
4. **Teacher:** review the learning outcomes, lesson summary, and saved conversation, then write a family note.
5. **Parent:** read the note and progress update, complete the at-home checkpoints, and see the next activity.

For exact inputs, expected outcomes, the ratios refresher, and recovery steps, use the [full presentation script](docs/DEMO_SCRIPT.md).

**Before presenting:** rehearse the full path three times, then spend five minutes trying other inputs and moving between screens. Prepare a backup recording. Lesson completion is evidence of practice, not proof of lasting mastery.

### Start a fresh rehearsal

Accounts, practice, notes, and uploaded materials persist in `.rova/`. To keep existing work, stop the server and start it with a new data directory:

**PowerShell**

```powershell
$env:ROVA_DATA_DIR = Join-Path ([System.IO.Path]::GetTempPath()) ("rova-demo-" + [guid]::NewGuid().ToString())
npm run dev
```

**macOS / Linux**

```bash
ROVA_DATA_DIR="$(mktemp -d /tmp/rova-demo.XXXXXX)" npm run dev
```

You can also set `ROVA_DATA_DIR` in an untracked `.env.local`; see [.env.example](.env.example). There is no reset button in the current workspaces.

<a id="17-build-spec"></a>

## Build spec

**Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vitest**

The app uses the Next.js App Router. Current screens live in `components/product/`; their learning logic and data model live in `lib/product/`.

| Path | Responsibility |
| --- | --- |
| `app/` | Home, login, sign-up, role pages, and API routes |
| `components/product/` | Student, teacher, parent, and practice interfaces |
| `lib/product/curriculum.ts` | Built-in topics, questions, and hints |
| `lib/product/coaching.ts` | Deterministic coaching and lesson progression |
| `lib/math/checkAnswer.ts` | Number and fraction answer checking |
| `lib/product/rootCause.ts` | Ratios-to-fractions tracing and refresher state |
| `lib/product/progress.ts`, `why.ts`, `insights.ts` | Progress rules, explanations, and practice summaries |
| `lib/product/bank.ts` | Question bank and template-based suggestions |
| `lib/product/server.ts` | File storage, password hashing, sessions, and role visibility |
| `app/api/account/`, `app/api/learning/`, `app/api/materials/` | Account actions, learning actions, and course-material uploads |

**Data and accounts:** the server stores state in `.rova/workspace.json` and uploaded materials in `.rova/materials/`, or under `ROVA_DATA_DIR`. Writes are queued within the process and use an atomic rename. Passwords use scrypt hashing; sessions use signed, HTTP-only cookies. Parents receive their child's outcomes and notes without coaching transcripts.

**Earlier implementation:** `lib/rules/`, `lib/data/store.ts`, `lib/tutor/`, and the older role components remain in the repository. They are not connected to the current screens. In particular, their delayed re-check lifecycle must not be presented as a working part of this app.

### Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run test` | Run the Vitest suite |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run build` | Create a production build |
| `npm start` | Serve a production build |

Automated tests cover math checking, coaching, progress rules, assignments, API access, and other learning logic, alongside the earlier engine. The suite does not render the React screens; use the demo walkthrough for UI checks.

## Current limits and next steps

- **Local-first prototype:** runtime storage needs a writable, persistent filesystem. The current app is not ready for Vercel deployment; a hosted database and durable upload storage are needed before that deployment.
- **Rule-based coaching:** open-ended conversations are limited to the implemented rules. Question suggestions use number templates with material references; uploading a handbook does not turn it into an AI-generated curriculum.
- **Simulated starting data:** the 18-student class, starting scores, and seeded practice history are fictional. Confidence and status are prototype indicators, not validated learning assessments.
- **In-app communication:** family notes and updates stay inside Rova. SMS, email delivery, and a seven-day re-check in the current screens are planned.
- **Demo use:** use fictional accounts and materials. Real-school use needs further privacy, security, and account-design work. Safety flags use limited phrase matching and support teacher review; they are not emergency notifications.

The next priorities are persistent hosted storage, a reset control for the current app, and delayed follow-up checks. See [project status](STATUS.md) for the team's backlog.

## Project documentation

| Document | What it contains |
| --- | --- |
| [Project context](PROJECT_CONTEXT.md) | Current architecture, boundaries, and invariants |
| [Status](STATUS.md) | Integration progress, blockers, and next actions |
| [Decisions](DECISIONS.md) | Accepted tradeoffs and their history |
| [Integration contracts](docs/INTEGRATION_CONTRACTS.md) | Shared interfaces between workstreams |
| [Demo script](docs/DEMO_SCRIPT.md) | Presentation steps and exact practice inputs |
| [Original project brief](docs/PROJECT_BRIEF.md) | Archived pitch, research, business assumptions, and original numbered sections |

Built by **[Suvrat Jain](https://github.com/suvrat23)**, **[Mohammad](https://github.com/moalavicodes)**, and **[Madhur](https://github.com/Madhur20)** for HackATL 2026.

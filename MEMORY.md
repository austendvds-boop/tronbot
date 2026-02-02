# Persistent Memory Guidelines

- **Remember:** business rules, workflows, customer handling rules, templates, pricing, SOPs, and tools.
- **Do NOT remember:** one-time random facts, temporary opinions, or emotional rants.
- **When something feels important, ask:** “Should I save this to memory?”

## Assistant Improvements (2026-02-02 Audit)

- Provide clearer image-OCR fallbacks by prompting for user transcription immediately when OCR fails.
- Automate OAuth scope and consent-screen checks before prompting for authorization codes, reducing blocked errors.
- Validate credentials proactively (e.g., IMAP app passwords, API tokens) to catch auth failures sooner.
- Preconfigure dependency resolutions (e.g., legacy-peer-deps, .npmrc) to prevent build/deploy errors on Vercel.
- Consolidate deployment scripts and improve error handling to streamline redeployments without manual retries.

## SOP: Assistant Board Setup

**Goal:** Scaffold and deploy a dark-mode, mobile-friendly Kanban board for task tracking.

**Tools needed:** Node.js, Next.js, @asseinfo/react-kanban, Vercel CLI, Git, an existing Vercel project.

**Exact steps:**
1. In `assistant-board/`, run `npm init -y` and install dependencies (`next`, `react`, `react-dom`, `@asseinfo/react-kanban`).
2. Create `data/tasks.json` with your initial columns (Backlog, To Do, In Progress, Done).
3. Build `components/Board.js` using client-side dynamic import and localStorage persistence.
4. Add dark-mode overrides in `styles/globals.css` and import it in `pages/_app.js`.
5. Update `pages/index.js` to read `assistant-board/data/tasks.json` in `getStaticProps` and render `<Board />`.
6. Add `.npmrc` with `legacy-peer-deps=true` to avoid peer dependency conflicts.
7. Commit all changes and push to your Git repo.
8. Create `scripts/deploy_board.js` to link and deploy via `vercel --prod --token $TOKEN`.
9. Run `node scripts/deploy_board.js` to deploy to Vercel; verify live site at `https://assistant-board.vercel.app`.

**Common errors:**
- Incorrect file path in `getStaticProps` causing empty board.
- Next.js/react peer dependency mismatches (use `legacy-peer-deps`).
- Missing `.npmrc` leading to build failures on Vercel.
- Forgetting to import global CSS causing styling to break.

**Copy/paste templates:**
- Deploy script:
  ```js
  execSync(`npx vercel --prod --token ${token} --cwd ${cwd} --yes`);
  ```
- Kanban component import:
  ```js
  const KanbanBoard = dynamic(() => import('@asseinfo/react-kanban'), { ssr: false });
  ```


- Provide clearer image-OCR fallbacks by prompting for user transcription immediately when OCR fails.
- Automate OAuth scope and consent-screen checks before prompting for authorization codes, reducing blocked errors.
- Validate credentials proactively (e.g., IMAP app passwords, API tokens) to catch auth failures sooner.
- Preconfigure dependency resolutions (e.g., legacy-peer-deps, .npmrc) to prevent build/deploy errors on Vercel.
- Consolidate deployment scripts and improve error handling to streamline redeployments without manual retries.

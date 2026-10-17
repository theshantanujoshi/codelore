# UI prototype status

This page describes the browser app in this checkout. It is a React 18/Vite visual prototype of the original Codelore concept. It is separate from the [skill workflows](using-codelore.md) that perform repository analysis.

## Run locally

Prerequisites: Node.js and npm. From the repository root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a production bundle, and `npm run preview` serves that bundle. `npm install` and the interactive dev/preview servers were not rerun for this documentation update; `npm run build` was verified. The package scripts are defined in [`package.json`](../package.json).

## Current behavior

| Area | What the code does |
| --- | --- |
| Navigation | [`App.tsx`](../src/app/App.tsx) selects landing, start, import, demo, CLI install, processing, and dashboard views using URL hashes. Repository data lives in component state and is lost on reload. |
| Import and demo | [`RepoImport.tsx`](../src/app/components/RepoImport.tsx) validates a GitHub URL. Its private repository authentication button has no handler, and its inclusion checkboxes are not passed to analysis. [`DemoSelect.tsx`](../src/app/components/DemoSelect.tsx) supplies example URLs, then follows the same processing path. |
| Analysis | [`Processing.tsx`](../src/app/components/Processing.tsx) calls `POST /api/analyze`. Its clone command, steps, and progress are display text, not measured operations. The endpoint is absent, so a fresh local import or demo cannot produce a dashboard report. |
| Chat | [`AIChat.tsx`](../src/app/components/views/AIChat.tsx) calls `POST /api/chat`. Its initial greeting, confidence, and source label are hard-coded; the endpoint is absent. |
| Settings and export | [`Settings.tsx`](../src/app/components/views/Settings.tsx) keeps the key field, analysis options, theme choice, and notification toggles in component state. The JSON download works only if `repoData` already exists. PDF is disabled; the delete button has no handler. |
| CLI screen | [`CliInstall.tsx`](../src/app/components/CliInstall.tsx) displays installation instructions. This repository does not contain a Codelore CLI package, and those commands have not been verified. |

The API client is [`src/app/services/api.ts`](../src/app/services/api.ts); development proxy configuration is [`vite.config.ts`](../vite.config.ts). The proxy points to `localhost:3001`, but this repository has no backend service. Some UI copy promises OAuth, repository retention, and local-only processing; there is no implementation here to substantiate those claims. The fixture content in [`mockData.ts`](../src/app/data/mockData.ts) is presentation data, not a codebase analysis result.

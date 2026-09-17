# Health Planner

An offline-first personal health planning PWA designed for GitHub Pages. It has no application server, serverless function, hosted database, runtime AI dependency, private API key, or embedded OAuth client secret.

## Local development

```powershell
npm ci
npm test
npm run dev
```

`npm run catalog:build` regenerates the public SQLite reference catalog from the pinned USDA source archive and project-authored recipe formulations. Personal browser records are never included in `public/`, catalog data, or GitHub Pages deployment.

The deployed app uses hash navigation under `/health-planner/`, IndexedDB for private records, a static SQLite catalog in a web worker, and optional browser-authorized Google Calendar/Tasks/Drive connections.

## Google connection setup

Enable Google Drive, Calendar, and Tasks APIs for the existing public web OAuth client. Add the deployed GitHub Pages origin (for example, `https://connectwithaniruddh.github.io`) to the authorized JavaScript origins. Calendar is used for timed workout reminders; Tasks is used for dated completion checklists. The app asks for each scope only when that connection is enabled, stores access tokens only in memory, and never exports tokens with health data.

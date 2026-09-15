# Technical Specifications: Client-Side Google Services Integration for GitHub Pages SPA

This specification outlines the architecture, SDK code patterns, scope requirements, schema migration, and security best practices for integrating Google Services into a client-side Single Page Application (SPA) hosted on GitHub Pages (`github.io`) without a custom backend.

---

## 1. Google OAuth 2.0 Client-Side Authentication Setup

### Architecture Overview
In a serverless static SPA environment (GitHub Pages), client authentication relies on the **Google Identity Services (GIS) Token Model** (`https://accounts.google.com/gsi/client`) combined with the **Google API Client Library** (`gapi` - `https://apis.google.com/js/api.js`).

* **GIS (`google.accounts.oauth2`)**: Handles OAuth 2.0 user authorization, scope consent, and access token retrieval.
* **GAPI (`gapi.client`)**: Handles lightweight REST API client calls to Google APIs (Drive, Calendar, Tasks, Gmail).
* **Client Secret**: **Never exposed** in client-side applications.

### Google Cloud Console Configuration
1. **OAuth 2.0 Client ID**: Type **Web Application**.
2. **Authorized JavaScript Origins**:
   * `https://<username>.github.io`
   * `http://localhost:5173` (for local development)
3. **Authorized Redirect URIs**: Not required when using the GIS popup/token model (`initTokenClient`), but add domain if fallback code exchange is needed.
4. **API Key Restrictions**:
   * **Application Restrictions**: Set HTTP referrers to `https://<username>.github.io/*` and `http://localhost:*`.
   * **API Restrictions**: Limit to *Google Drive API*, *Google Calendar API*, *Google Tasks API*, and *Gmail API*.

---

### Scope Matrix

| API | Required Scope | Purpose |
| :--- | :--- | :--- |
| **Drive** | `https://www.googleapis.com/auth/drive.appdata` | Read/write application data folder (`appDataFolder`) |
| **Calendar**| `https://www.googleapis.com/auth/calendar.events` | Create/update meal & workout reminders |
| **Tasks** | `https://www.googleapis.com/auth/tasks` | Create/update workout & meal task items |
| **Gmail** | `https://www.googleapis.com/auth/gmail.send` | Send weekly digest & motivational quotes |

---

### SDK Initialization & Authentication Pattern

```javascript
// googleAuth.js - Dual SDK Initialization (GIS + GAPI)

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_RESTRICTED_GOOGLE_API_KEY';

// Incremental Scopes
export const SCOPES = {
  DRIVE: 'https://www.googleapis.com/auth/drive.appdata',
  CALENDAR: 'https://www.googleapis.com/auth/calendar.events',
  TASKS: 'https://www.googleapis.com/auth/tasks',
  GMAIL: 'https://www.googleapis.com/auth/gmail.send',
};

let tokenClient;
let accessToken = null;

/**
 * Loads and initializes GAPI and GIS SDKs
 */
export async function initGoogleSDKs() {
  await Promise.all([loadGapiScript(), loadGisScript()]);
  await initGapiClient();
  initTokenClient();
}

function loadGapiScript() {
  return new Promise((resolve) => {
    if (window.gapi) return resolve();
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

function loadGisScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

async function initGapiClient() {
  return new Promise((resolve) => {
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
          'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
        ],
      });
      resolve();
    });
  });
}

function initTokenClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: `${SCOPES.DRIVE} ${SCOPES.CALENDAR} ${SCOPES.TASKS} ${SCOPES.GMAIL}`,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('OAuth Token Error:', tokenResponse);
        return;
      }
      accessToken = tokenResponse.access_token;
      gapi.client.setToken({ access_token: accessToken });
      window.dispatchEvent(new CustomEvent('google-auth-success', { detail: tokenResponse }));
    },
  });
}

/**
 * Requests Access Token (Interactive popup if scope consent is needed or expired)
 */
export function requestAccessToken(prompt = '') {
  tokenClient.requestAccessToken({ prompt });
}

/**
 * Checks token availability or triggers silent background refresh
 */
export function ensureValidToken() {
  if (!accessToken) {
    requestAccessToken('none'); // silent attempt
  }
}
```

---

## 2. Google Drive API Integration (`appDataFolder`)

### Storage Strategy
Storing `health_planner_data.json` inside the Google Drive **Application Data folder** (`appDataFolder`) provides key benefits:
1. Files are isolated to this specific application.
2. The user cannot accidentally view, edit, or delete the file from the standard Google Drive UI.

---

### Drive Service Implementation Code Pattern

```javascript
// driveService.js

const DATA_FILENAME = 'health_planner_data.json';

/**
 * Finds the health planner data file ID in appDataFolder
 */
export async function findAppDataFile() {
  const response = await gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name, modifiedTime)',
    q: `name = '${DATA_FILENAME}' and trashed = false`,
  });
  
  const files = response.result.files;
  return files && files.length > 0 ? files[0] : null;
}

/**
 * Reads and parses JSON data from appDataFolder
 */
export async function readAppData(fileId) {
  const response = await gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });
  return typeof response.result === 'string' ? JSON.parse(response.result) : response.result;
}

/**
 * Creates or updates health_planner_data.json in appDataFolder
 */
export async function saveAppData(data, fileId = null) {
  const content = JSON.stringify(data, null, 2);
  const metadata = {
    name: DATA_FILENAME,
    mimeType: 'application/json',
  };

  if (!fileId) {
    metadata.parents = ['appDataFolder'];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const path = fileId
    ? `/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : '/upload/drive/v3/files?uploadType=multipart';

  const method = fileId ? 'PATCH' : 'POST';

  const response = await gapi.client.request({
    path: path,
    method: method,
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: body,
  });

  return response.result;
}
```

---

## 3. Schema Versioning & Auto-Migration System

### Schema Structure Overview
Every saved file includes `schemaVersion` and `lastUpdated` metadata attributes.

```json
{
  "schemaVersion": 3,
  "lastUpdated": "2026-09-15T08:18:43Z",
  "profile": { "name": "User", "dailyCalorieGoal": 2200 },
  "meals": [],
  "workouts": [],
  "settings": { "notificationsEnabled": true }
}
```

---

### Sequential Auto-Migration Engine

```javascript
// migrationEngine.js

export const CURRENT_SCHEMA_VERSION = 3;

/**
 * Migration definitions map version N -> N+1
 */
const migrations = {
  // Migration v1 -> v2: Transform meal calories from string to number, add default waterGoal
  1: (data) => {
    const updatedMeals = (data.meals || []).map(meal => ({
      ...meal,
      calories: Number(meal.calories || 0),
    }));
    return {
      ...data,
      schemaVersion: 2,
      waterGoalLiters: data.waterGoalLiters || 2.5,
      meals: updatedMeals,
    };
  },

  // Migration v2 -> v3: Restructure workouts array into categorized objects & add reminders config
  2: (data) => {
    const updatedWorkouts = (data.workouts || []).map(w => ({
      id: w.id || crypto.randomUUID(),
      title: w.name || w.title || 'Workout',
      durationMinutes: w.duration || 30,
      completed: !!w.completed,
    }));
    return {
      ...data,
      schemaVersion: 3,
      workouts: updatedWorkouts,
      settings: data.settings || { reminders: { calendar: true, tasks: true } },
    };
  },
};

/**
 * Main auto-migration runner
 */
export async function loadAndMigrateData(driveFileId) {
  let rawData = await readAppData(driveFileId);

  if (!rawData) {
    throw new Error('Data file is empty or corrupted');
  }

  // Handle missing version tag (assume v1)
  let dataVersion = rawData.schemaVersion || 1;
  let isMigrated = false;

  console.log(`Loaded data schema version: ${dataVersion}, Target: ${CURRENT_SCHEMA_VERSION}`);

  while (dataVersion < CURRENT_SCHEMA_VERSION) {
    const migrationFn = migrations[dataVersion];
    if (!migrationFn) {
      throw new Error(`Missing migration step for version ${dataVersion}`);
    }

    console.log(`Migrating schema from v${dataVersion} to v${dataVersion + 1}...`);
    rawData = migrationFn(rawData);
    dataVersion = rawData.schemaVersion;
    isMigrated = true;
  }

  if (isMigrated) {
    rawData.lastUpdated = new Date().toISOString();
    console.log('Migration complete. Persisting updated schema back to Google Drive...');
    await saveAppData(rawData, driveFileId);
  }

  return rawData;
}
```

---

## 4. Google Calendar API & Google Tasks API Integration

### A. Google Calendar API Integration
Used for recurring or dated meal prep reminders and workout schedules.

```javascript
// calendarService.js

/**
 * Creates a workout session event in the primary Google Calendar
 */
export async function createWorkoutEvent({ title, startTimeIso, durationMinutes, description }) {
  const startTime = new Date(startTimeIso);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const event = {
    summary: `🏋️ Health Planner: ${title}`,
    description: description || 'Scheduled workout session from Health Planner App',
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  };

  const response = await gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.result; // Returns created event with ID for reference tracking
}
```

---

### B. Google Tasks API Integration
Used for daily meal tracking and workout checklists.

```javascript
// tasksService.js

const TASKLIST_TITLE = 'Health Planner Daily Tasks';

/**
 * Gets or creates the application's dedicated Task List
 */
export async function getOrCreateHealthTaskList() {
  const listResponse = await gapi.client.tasks.tasklists.list({ maxResults: 100 });
  const taskLists = listResponse.result.items || [];
  const existing = taskLists.find(t => t.title === TASKLIST_TITLE);

  if (existing) return existing.id;

  const createResponse = await gapi.client.tasks.tasklists.insert({
    resource: { title: TASKLIST_TITLE },
  });
  return createResponse.result.id;
}

/**
 * Syncs a list of daily workout/meal items as tasks
 */
export async function syncDailyTask({ taskListId, title, dueDateIso, notes }) {
  const task = {
    title: title,
    notes: notes,
    due: new Date(dueDateIso).toISOString(), // Requires RFC 3339 timestamp
    status: 'needsAction',
  };

  const response = await gapi.client.tasks.tasks.insert({
    tasklist: taskListId,
    resource: task,
  });

  return response.result;
}
```

---

## 5. Email & Motivational Quotes Strategy (Gmail API)

### Architectural Constraint on GitHub Pages
Because GitHub Pages apps run purely client-side in the browser, background tasks **cannot** execute when the browser tab is closed. 

### Trigger Strategy Options

1. **In-App On-Load Trigger (Recommended Client-Only)**:
   * When the user opens the web app, check `lastDigestSentDate` in `health_planner_data.json`.
   * If >= 7 days have passed, build and send the weekly summary email via the Gmail API (`gmail.send`) from the user's account to themselves.
2. **GitHub Actions Workflow (Automated Serverless Cron)**:
   * A scheduled GitHub Action workflow (`.github/workflows/weekly_digest.yml`) triggers weekly, uses a stored Refresh Token in GitHub Secrets, and calls the Gmail API via a NodeJS script.

---

### Client-Side Gmail Digest Sender Code Pattern

```javascript
// gmailDigestService.js

/**
 * Constructs a MIME email message and sends it via Gmail API
 */
export async function sendWeeklyDigestEmail({ userEmail, digestContent, quote }) {
  const subject = '🍏 Your Weekly Health Planner Summary & Motivation';
  
  const emailLines = [
    `To: ${userEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `<div style="font-family: Arial, sans-serif; line-height: 1.6;">`,
    `2 Your Weekly Health Summary</h2>`,
    `<p>${digestContent}</p>`,
    `<hr />`,
    `<blockquote style="font-style: italic; color: #555;">"${quote}"</blockquote>`,
    `<p><small>Sent automatically by your Health Planner SPA on GitHub Pages</small></p>`,
    `</div>`,
  ];

  const emailRaw = emailLines.join('\r\n');

  // Base64url encode the string
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gapi.client.gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: base64EncodedEmail,
    },
  });

  return response.result;
}
```

---

## 6. Security Best Practices & Deployment Recommendations

### 1. API Key & Client ID Safety
* **OAuth Client Secret**: Never publish or bundle a Google Client Secret in front-end JS. Use the token client flow (`google.accounts.oauth2.initTokenClient`).
* **API Key Restrictions**: Restrict the key by HTTP referrer (`https://<username>.github.io/*`) and restrict its usage exclusively to Drive, Calendar, Tasks, and Gmail APIs.

### 2. Token Storage & Lifecycle
* Keep Access Tokens in memory (`accessToken` variable).
* Do **not** store raw OAuth tokens in `localStorage` to avoid XSS token theft.
* If session persistence across tab reloads is required, use `sessionStorage` or request tokens silently on initialization via `prompt: 'none'`.

### 3. Content Security Policy (CSP) Meta Tag
Include the following CSP in your `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://accounts.google.com/gsi/client https://apis.google.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;
               frame-src https://accounts.google.com; 
               connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com;">
```

### 4. Incremental Authorization
Prompt for additional scopes (e.g. `calendar` or `gmail.send`) only when the user explicitly interacts with those features in the UI, rather than asking for all permissions upfront.

# LumiHealth Frontend

This is the frontend for the LumiHealth AI healthcare platform, built with React and Vite.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

## What's Inside

The frontend currently has these main pages:

- **Dashboard** – shows a quick overview of the patient's health summary
- **Symptom Checker** – lets users type in symptoms and get AI-powered predictions
- **Report Analyzer** – upload a PDF lab report and get a plain-English breakdown
- **Appointments** – browse doctors and book a slot
- **Mentorship Bot** – an AI mental health chat assistant

## Tech Used

- React 18 + Vite
- Tailwind CSS v4 (with `@theme` for custom colors)
- React Router v6
- Axios for API calls

## Connecting to the Backend

The API base URL is set in `src/services/api.js`. By default it points to `http://localhost:8000/api/v1`. Make sure the FastAPI backend is running before you test anything that talks to the server.

## Notes

- User ID is currently hardcoded as `user_123` in `api.js` — this is a placeholder until auth is wired up.
- VS Code might show a warning on `@theme` in `index.css` — that's just a linter issue, not a real error.

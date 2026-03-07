# AuXel

Evidence-based support across the autism spectrum: AAC-style child tablet, ABA-aligned skill assessment, and caregiver dashboard. The app is designed so that **display and content adapt for people all over the spectrum** (complexity, sensory preferences, and interface type are driven by profile and skill assessment).

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the system flowchart (Tablet → Application Layer → Data Layer → Dashboard) and spectrum-wide display guidelines.

## Features

- **Child Tablet** – Communication board (needs, distress, refusal, help), ABA lesson prompts, and recognition games; complexity and theme follow the child’s profile and skill assessment.
- **Skill Assessment** – In-depth, ABA-aligned questionnaire (communication, social, adaptive, play) to map support needs and recommend tablet complexity; results editable in Configuration.
- **Caregiver Dashboard** – Overview and analytics, skill assessment and spectrum placement, configuration (profile, theme, complexity, sensory preferences), and activity logs.

## Database (SQL / PostgreSQL)

Assessments and all app data are stored in PostgreSQL when `DATABASE_URL` is set.

1. Create a database (local or e.g. [Neon](https://neon.tech) / [Supabase](https://supabase.com)).
2. Set the connection string in `.env`:
   ```bash
   cp .env.example .env
   # Edit .env: DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
3. Create tables (run once):
   ```bash
   npm run db:push
   ```
   This creates `child_profiles`, `session_logs`, `prompts`, and `skill_assessments`.

Without `DATABASE_URL`, the app runs with in-memory storage (data is lost on restart).

## Run

```bash
npm install
npm run dev
```

Open the app at the URL shown (e.g. http://localhost:5000).

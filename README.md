# Smart Task Tracker — Barebones Scaffold (Next.js + FastAPI)

**4-hour** take-home scaffold. All core features have been implemented.

- **Frontend:** Next.js (TypeScript) — Full task management UI with Smart Intake
- **Backend:** FastAPI — All routes implemented with in-memory database
- **DB:** In-memory dictionary-based store (DB-agnostic design)
- **AI:** `/api/ai/intake` — Fake deterministic adapter implemented

## Quickstart
```bash
cp .env.example .env   # optional
docker compose up --build

# Web: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

## Extras
```bash
./scripts/test.sh   # run backend tests
./scripts/clean.sh  # stop & clean
```

## Run Steps

1. **Start the application:**
   ```bash
   docker compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - Swagger API Docs: http://localhost:8000/docs

3. **Run tests:**
   ```bash
   ./scripts/test.sh
   ```

4. **Stop the application:**
   ```bash
   ./scripts/clean.sh
   ```

## Running frontend and backend separately (without Docker)

You can also run the API and web app directly on your machine.

### Backend (FastAPI)

```bash 
cd backend
# On mac
python -m venv venv
source venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Frontend (Next.js)

In another terminal:

```bash
cd frontend
npm install        # or: pnpm install / yarn
npm run dev        # starts Next.js on port 3000
```

Make sure the frontend can reach the API by setting:

```bash
export NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Then open:
- Frontend: http://localhost:3000

## Design Choices

1. **In-Memory Database**: Chose dictionary-based storage for simplicity and speed of implementation. The design is database-agnostic and can easily be swapped for SQLite or PostgreSQL without changing the API layer.

2. **Auto-Project Creation**: Frontend automatically creates a default "My Project" if no projects exist, improving UX for first-time users.

3. **Fake AI Adapter**: Implemented a deterministic keyword-based system rather than a true ML model, as specified. This provides consistent, predictable results for demonstration:
   - Extracts title from first sentence (max 50 chars)
   - Priority detection via keyword matching (High: urgent, critical, bug, etc.; Low: nice to have, optional, etc.)

4. **Status Filtering**: Implemented at the API level for efficiency, filtering happens server-side via query parameter.

5. **Inline Status Updates**: Tasks can be updated directly from the list view via dropdown, reducing clicks and improving workflow.

6. **Smart Intake Flow**: Two-step process (suggest → review → create) gives users control while leveraging AI assistance.

## TODOs / Future Enhancements

If more time were available, here are improvements I would consider:

1. **Persistence**: Replace in-memory store with SQLite or PostgreSQL for data persistence across restarts
2. **User Authentication**: Add user accounts and project ownership
3. **Task Dependencies**: Support for task relationships and dependencies
4. **Due Dates**: Add date/time fields for scheduling and deadlines
5. **Search**: Full-text search across tasks and descriptions
6. **Bulk Operations**: Select and update multiple tasks at once
7. **Real AI Integration**: Connect to actual LLM API (OpenAI, Anthropic, etc.) for more intelligent suggestions
8. **Drag & Drop**: Reorder tasks via drag-and-drop interface with files attached to description
9. **Project Management**: Better project switching UI and project-specific views
10. **Export/Import**: CSV/JSON export for backup and migration

## AI Usage Report

### Tools Used
- **Cursor AI Assistant** (Claude Sonnet 4.5) — Primary development assistant

### Process Overview
1. **Initial Analysis**: Read and understood the requirements from CANDIDATE.md and README.md
2. **Backend Implementation**: 
   - Created database layer with in-memory store (`backend/app/database.py`)
   - Implemented all FastAPI routes (`backend/app/main.py`)
   - Built fake AI intake adapter with keyword-based logic
   - Wrote comprehensive test suite (`backend/tests/test_api.py`)
3. **Frontend Implementation**:
   - Built complete React/Next.js UI with hooks (`frontend/app/page.tsx`)
   - Implemented task list, filtering, and forms
   - Integrated Smart Intake workflow
4. **Documentation**: Updated README with design choices and usage instructions

### Key Prompts Used
- "Implement backend database layer" — Created database.py with in-memory store
- "Implement FastAPI routes" — Filled in all stubbed endpoints
- "Write backend tests" — Created test_api.py with happy and error paths
- "Build Next.js UI" — Created complete frontend with all required features
- "Update README" — Added comprehensive documentation

### AI Assistance Benefits
- **Speed**: Rapid implementation of boilerplate and common patterns
- **Code Quality**: Consistent error handling and type safety
- **Best Practices**: Following FastAPI and Next.js conventions
- **Testing**: Comprehensive test coverage with edge cases

### Notes
All code was reviewed and understood before committing. The AI assistant helped with structure and implementation, but all design decisions and architectural choices were made with full understanding of the requirements and trade-offs.
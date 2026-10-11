# FitForge – Personalized Workout & Diet Planner

Full-stack app: **React (Vite) + Spring Boot 3 (Java 21) + JPA**. H2 in-memory DB for local dev, PostgreSQL in production.

**Features:** register/login (JWT + BCrypt), fitness profile, exercise library (30 seeded), workout plans (manual + rule-based "Generate starter plan"), workout logging with personal bests, diet tracking with daily totals vs targets, body-weight progress, dashboard with charts (streak, weekly workouts, calories, weight trend).

Decisions: single USER role (no trainer/admin/AI), PostgreSQL in production because Render's managed DB is PostgreSQL (the code is DB-agnostic JPA).

## Run locally
Requirements: JDK 21, Maven, Node 18+.

```bash
# terminal 1 – backend (http://localhost:8080)
cd backend
mvn spring-boot:run

# terminal 2 – frontend (http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```
Demo login (local/dev profile only): `demo@fitforge.com` / `Demo@1234`. Dev data is in-memory and resets on restart.

Run tests: `cd backend && mvn test`

## Backend environment variables
| Variable | Purpose | Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` (H2 + demo data) or `prod` (PostgreSQL) | `dev` |
| `DB_URL`, `DB_USER`, `DB_PASS` | PostgreSQL connection (prod) | – |
| `JWT_SECRET` | Signing secret, **at least 32 characters** | dev-only value |
| `FRONTEND_URL` | Allowed CORS origin(s), comma separated | `http://localhost:5173` |
| `PORT` | Server port | `8080` |

## API
All endpoints except `/api/auth/**` and `/api/health` need `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register`, `/api/auth/login` | Returns `{token,id,name,email}` |
| GET/PUT | `/api/profile` | Fitness profile |
| GET | `/api/exercises` | Exercise library |
| GET/POST | `/api/plans` | List / create plan |
| GET/DELETE | `/api/plans/{id}` | View / delete plan |
| POST | `/api/plans/generate` | Rule-based starter plan from profile |
| GET/POST | `/api/workouts` | History / log workout |
| DELETE | `/api/workouts/{id}` | Delete workout |
| GET | `/api/workouts/personal-bests` | Best weight per exercise |
| GET/POST | `/api/meals?date=YYYY-MM-DD` | List / add meals |
| DELETE | `/api/meals/{id}` | Delete meal |
| GET | `/api/meals/summary?date=YYYY-MM-DD` | Daily totals vs targets |
| GET/POST | `/api/weights` | Body-weight entries |
| DELETE | `/api/weights/{id}` | Delete entry |
| GET | `/api/dashboard?today=YYYY-MM-DD` | Dashboard data |

## Deploy (free tier)
1. **Push to GitHub** – from the project root: `git init && git add . && git commit -m "FitForge" && git branch -M main && git remote add origin <your-repo-url> && git push -u origin main`
2. **Database on Render** – New → PostgreSQL (free). Open it and note *Hostname, Port, Database, Username, Password*. Build the JDBC URL:
   `jdbc:postgresql://<hostname>:5432/<database>` (use the **Internal** hostname when the backend is also on Render; if you only have the External hostname, append `?sslmode=require`).
3. **Backend on Render** – New → Web Service → pick your repo → **Root Directory:** `backend`, **Runtime:** Docker. Add env vars:
   `SPRING_PROFILES_ACTIVE=prod`, `DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET` (random 32+ chars), `FRONTEND_URL` (temporary value `http://localhost:5173`). Deploy, then open `https://<your-service>.onrender.com/api/health`.
4. **Frontend on Vercel** – Add New Project → pick repo → **Root Directory:** `frontend` (framework: Vite). Add env var `VITE_API_URL=https://<your-service>.onrender.com/api`. Deploy.
5. **Connect them** – on Render set `FRONTEND_URL` to your Vercel URL (no trailing slash needed) and redeploy the backend.

Note: Render free services sleep after inactivity, so the first request can take ~30–60 seconds. Production has no demo user – register a new account.

*FitForge provides general guidance only, not medical advice.*

## Explore (Home & Gym workouts)
- 16 guided workouts (8 Home, 8 Gym) across Strength, HIIT, Cardio, Core and Yoga, with level filters.
- Workout detail page, then a guided **player** with timers, rep targets, rest breaks and skip/pause. Finishing a session saves it to the workout log.
- Extra endpoints: `GET /api/catalog?location=HOME|GYM&category=&level=`, `GET /api/catalog/{id}`, `POST /api/catalog/{id}/complete`.

## Smart plan, diet plans and gym look
- **Smart workout plan:** `POST /api/plans/smart` (goal, experience, body weight, days). Fat loss = 3 strength days + cardio days, higher reps, short rests. Muscle gain = split routine with heavy compound lifts first. Each lift gets a suggested starting weight estimated from body weight (estimates only, start light).
- **Diet plans:** `GET /api/diet/plans` returns a personalised Fat loss plan and Muscle gain plan (calories and macros from body weight, veg / non-veg meal ideas). The Diet page can log a meal to today's tracker or set the plan's calories and protein as your daily targets.
- **Photos:** drop your own images into `frontend/public/images/` (`hero.jpg`, `login.jpg`, `diet.jpg`, `strength.jpg`, `hiit.jpg`, `cardio.jpg`, `core.jpg`, `yoga.jpg`). Use images you own or that are licensed for use. Without them the built-in gradient and barbell artwork is shown.

## App-style interface
- Mobile-first layout with a bottom navigation (Home, Fitness, Explore, Diet, Progress), swipe-style daily story with a motivational quote, recipe cards, and a sticky "This Week Activity" bar.
- **Fitness** tab: "My Workout Plan" with a week strip, Warm Up and Workout sections, per-set rep targets (muscle-gain plans ramp reps down per set), **Swap with today** (`POST /api/plans/{id}/swap`) and **Mark today's workout done** (logs it).
- **Diet** tab: Plan (calories, macros and micronutrients for Fat loss, Muscle gain or Balanced, chosen from your profile target), Recipes (calories per recipe, `GET /api/diet/recipes?goal=`), and Tracker.
- Micronutrient targets are general adult reference ranges, not personal medical advice.

## Weekly plan updates
- Plans use body-part days (for example Monday **Chest & Triceps**, Tuesday **Back & Biceps**, Wednesday **Legs**, Thursday **Shoulders & Core**, Friday **Biceps & Triceps**). Arms are now split into Biceps and Triceps in the exercise library.
- Every smart plan includes **Week 2**: main lifts stay, accessories rotate and a small progression is added. The Fitness tab has This week / Next week with real dates.
- The warm-up changes with the muscles trained that day (for example chest and triceps days get arm circles, scapular push-ups and light overhead extensions).
- Exercise images are built-in pictogram illustrations. For real photos, set `VITE_EXERCISE_PHOTOS=true` in `frontend/.env` and add `frontend/public/images/exercises/<exercise-name>.jpg` (for example `barbell-bench-press.jpg`). Use images you own or that are licensed for use.
- Existing plans created before this update only have one week; the Next week tab then repeats that week.

# GameGuard

GameGuard is a cross-platform child-safety application for parents and guardians. It helps users discover game safety information, submit concerns about games, review their submitted reports, manage monitored games, and track children's screen time.

The project is built as a full-stack application with:

- An Expo/React Native client for iOS, Android, and web
- An Express.js REST API
- PostgreSQL for persistent data
- Prisma ORM for database access and migrations
- Background jobs for report scoring and game-score aggregation
- Optional image uploads for report evidence

## Demo

The following mobile demo shows the GameGuard user flow, including the parent dashboard, game browsing, settings, language selection, and report features.

![GameGuard mobile demo](./project%20gif.gif)

## Features

- Account registration and login
- Onboarding and parent profile configuration
- Game search and game details
- Game safety reports with categories, descriptions, platforms, dates, and screenshots
- Quick reports for urgent concerns
- My Submitted Reports history
- AI-assisted report scoring
- Trending safety alerts
- Parent/child profile management
- Child-device linking
- Monitored games
- Screen-time logging and daily limits
- English and Malay localization support
- Responsive web experience through Expo Web

## Technology

### Frontend

- React Native
- Expo SDK 58
- Expo Router
- React Native Web
- AsyncStorage
- React Navigation

### Backend

- Node.js
- Express 5
- PostgreSQL 15
- Prisma 6
- Multer for screenshot uploads
- `node-cron` for background jobs
- Google Generative AI integration for report analysis

## Project structure

```text
GameGuard/
├── GameGuard-backend/
│   ├── app/src/
│   │   ├── routes/              # REST API routes
│   │   ├── bg-process/          # Background scoring jobs
│   │   └── server.js            # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/
│   │   └── seed.js
│   ├── uploads/                 # Uploaded report screenshots
│   ├── Dockerfile
│   └── docker-compose.yml
├── GameGuard-frontend/
│   ├── app/                     # Expo Router screens
│   ├── components/
│   ├── lib/api/                 # API client functions
│   ├── assets/
│   └── config_base_url.js       # Backend URL configuration
└── README.md
```

## Prerequisites

Install the following before starting:

- Node.js 18 or newer
- npm
- Git
- PostgreSQL 15 or Docker Desktop
- Expo Go for testing on a physical mobile device, or an iOS/Android simulator

For Windows development, run the frontend from PowerShell or Command Prompt. Make sure the mobile device and development computer are on the same network when using Expo Go.

## Clone the repository

```bash
git clone https://github.com/Alyas100/GameGuard.git
cd GameGuard
```

## Backend setup

Open a terminal in `GameGuard-backend`:

```bash
cd GameGuard-backend
npm install
```

### Environment variables

Create `GameGuard-backend/.env`:

```env
DATABASE_URL="postgresql://gameguard_user:change_me@localhost:5432/gameguard_db?schema=public"
PORT=3001
```

If AI report scoring is enabled, add the API key expected by the AI service configuration. Do not commit `.env` files or API keys to GitHub.

### Start PostgreSQL with Docker

From `GameGuard-backend`:

```bash
docker compose up -d db
```

The Compose database uses:

```text
Host: localhost
Port: 5432
Database: gameguard_db
User: gameguard_user
Password: change_me
```

### Initialize the database

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

For an existing production database, use migration deployment instead:

```bash
npx prisma migrate deploy
```

### Run the backend

```bash
npm start
```

The API is available at:

```text
http://localhost:3001
```

The API routes are mounted under `/api`. For example:

```text
GET http://localhost:3001/api/reports/user/:userId
```

## Frontend setup

Open a second terminal in `GameGuard-frontend`:

```bash
cd GameGuard-frontend
npm install
```

Update [`config_base_url.js`](./GameGuard-frontend/config_base_url.js) so it points to the computer running the backend:

```js
export const BACKEND_API_URL = "http://YOUR_COMPUTER_IP:3001/api";
```

Use:

- `http://localhost:3001/api` for a browser running on the same computer
- `http://YOUR_COMPUTER_IP:3001/api` for a physical phone using Expo Go
- The appropriate host address for an Android emulator or iOS simulator

Start Expo:

```bash
npm start
```

Or start a specific target:

```bash
npm run web
npm run android
npm run ios
```

Run the frontend lint check:

```bash
npm run lint
```

## Running with Docker Compose

The backend Compose setup can start PostgreSQL and the backend together:

```bash
cd GameGuard-backend
docker compose up -d --build
```

View backend logs:

```bash
docker compose logs -f backend
```

Stop the containers:

```bash
docker compose down
```

When using Docker Compose, check the backend port configured in `docker-compose.yml` and keep the frontend API URL consistent with that port.

## Useful development commands

### Backend

```bash
npm start
npm run seed
npm run score-games
npx prisma studio
npx prisma format
npx prisma generate
```

### Frontend

```bash
npm start
npm run web
npm run android
npm run ios
npm run lint
```

## Troubleshooting

### The frontend cannot reach the backend

1. Confirm the backend is running.
2. Confirm the URL in `GameGuard-frontend/config_base_url.js`.
3. For a physical device, use the development computer's LAN IP instead of `localhost`.
4. Confirm Windows Firewall allows Node.js to receive connections.
5. Confirm the phone and computer are connected to the same network.

### “User ID not found” in My Reports

Log out and log in again so the frontend can restore the account ID in AsyncStorage. New reports are linked to the logged-in user when submitted.

### Database connection errors

Confirm that PostgreSQL is running and that `DATABASE_URL` matches the database credentials. With Docker:

```bash
docker compose ps
docker compose logs db
```

### Prisma client or schema errors

Run:

```bash
npx prisma generate
npx prisma migrate dev
```

## Security notes

- Keep `.env` files, database passwords, and AI API keys out of source control.
- The default Docker database password is intended for local development only.
- Authentication is currently implemented with the project's custom login flow. Production deployment should add a secure token/session strategy, HTTPS, stronger validation, and managed secrets.
- Uploaded screenshots are stored by the backend and should be protected appropriately before production deployment.

## Portfolio context

This project demonstrates full-stack application development across mobile, web, backend, and database layers. It includes REST API design, relational data modeling, file uploads, scheduled background processing, mobile navigation, responsive web rendering, localization, and integration between a React Native client and an Express/Prisma backend.

## License

This project is currently intended as a personal portfolio project. Add a formal license before distributing or reusing the code publicly.

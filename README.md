# Event Ticketing System — React + Node.js

A full-stack event ticketing starter project with:
- React + Vite frontend
- Node.js + Express REST API
- JWT authentication (register/login)
- Event listing, search and category filters
- Ticket booking and booking history
- Admin event create/update/delete endpoints
- JSON-file persistence (no database setup required)

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run the backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
API runs at `http://localhost:5000`.

## Run the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

## First admin account
1. Register an account through the UI.
2. In `server/data/users.json`, change that user's `"role": "user"` to `"role": "admin"`.
3. Restart the server and log out/in again.

The starter uses JSON files for easy local development. For production, replace this with a database, add rate limiting, email verification, password reset, input validation, payment-provider integration, and stronger deployment secrets.

## API overview
- `GET /api/health`
- `GET /api/events?search=&category=`
- `GET /api/events/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)
- `POST /api/bookings` (auth required)
- `GET /api/bookings/my` (auth required)
- `GET /api/bookings/:id` (owner/admin)
- `POST /api/events` (admin)
- `PUT /api/events/:id` (admin)
- `DELETE /api/events/:id` (admin)

Booking is a demo flow and does not charge money. Ticket confirmation is stored locally by the API.

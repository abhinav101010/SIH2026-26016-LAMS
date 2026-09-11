# NLAMS Backend

National Land Acquisition & Management System — Backend API

## Tech Stack

- Node.js + Express.js
- PostgreSQL + PostGIS
- Prisma ORM
- JWT Authentication
- bcrypt
- Zod Validation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup PostgreSQL with PostGIS:
   ```bash
   createdb nlams_db
   psql -d nlams_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Update DATABASE_URL and JWT_SECRET in .env
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed database:
   ```bash
   npm run seed
   ```

6. Start server:
   ```bash
   npm run dev
   ```

## Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@nlams.gov.in | admin123 | SUPER_ADMIN |
| officer@nlams.gov.in | admin123 | PROPOSAL_OFFICER |
| reviewer@nlams.gov.in | admin123 | REVIEWING_AUTHORITY |
| field@nlams.gov.in | admin123 | FIELD_OFFICER |

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Proposals
- `GET /api/proposals`
- `GET /api/proposals/:id`
- `POST /api/proposals`
- `PUT /api/proposals/:id`
- `DELETE /api/proposals/:id`
- `POST /api/proposals/:id/submit`
- `POST /api/proposals/:id/approve`
- `POST /api/proposals/:id/reject`
- `POST /api/proposals/:id/request-changes`

### Projects
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`

### Parcels
- `GET /api/parcels`
- `GET /api/parcels/:id`
- `GET /api/parcels/proposal/:proposalId`
- `GET /api/map/parcels?format=geojson`

### Dashboard
- `GET /api/dashboard/overview`
- `GET /api/dashboard/status-distribution`
- `GET /api/dashboard/state-progress`
- `GET /api/dashboard/acquisition-trends`
- `GET /api/dashboard/timeline`
- `GET /api/dashboard/recent-proposals`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### Documents
- `POST /api/documents/:proposalId/documents`
- `GET /api/documents/:proposalId/documents`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`

### Compensation
- `GET /api/compensation`
- `POST /api/compensation`
- `PUT /api/compensation/:id`

### Audit Logs (Super Admin only)
- `GET /api/audit`

## Frontend Integration

The React frontend connects via the service layer in `src/services/`.

Base URL is set via `VITE_API_URL` environment variable.

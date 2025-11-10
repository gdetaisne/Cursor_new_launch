# Environment Variables Setup

Create a `.env` file in `/backend` with the following content:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/moverz_db?sslmode=require"

# Node Environment
NODE_ENV="development"

# API Configuration
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# JWT (if needed for auth)
JWT_SECRET="your-dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

## Neon.tech Setup

1. Create a new project on [Neon.tech](https://neon.tech)
2. Database name: `moverz_db`
3. Copy the connection string (with `?sslmode=require`)
4. Replace `USER`, `PASSWORD`, and `HOST` in DATABASE_URL
5. Save to `.env`

## Required Variables

- **DATABASE_URL**: PostgreSQL connection string (Neon.tech)
- **NODE_ENV**: `development` | `production` | `test`
- **PORT**: Backend API port (default: 3001)
- **CORS_ORIGIN**: Frontend URL (default: http://localhost:5173)


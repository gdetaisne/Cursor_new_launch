# Prisma Documentation — Moverz Back Office

## 📚 Table of Contents

- [Setup](#setup)
- [Commands](#commands)
- [Workflow](#workflow)
- [Migrations](#migrations)
- [Seeding](#seeding)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL database (Neon.tech recommended)
- pnpm (or npm/yarn)

### Installation

```bash
cd backend
pnpm install
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/moverz_db?sslmode=require"
NODE_ENV="development"
```

See `ENV_SETUP.md` for detailed instructions.

---

## Commands

### Essential Commands

```bash
# Generate Prisma Client (after schema changes)
pnpm db:generate
# or
npx prisma generate

# Create a new migration (development)
pnpm db:migrate
# or
npx prisma migrate dev --name migration_name

# Apply migrations (production)
pnpm db:migrate:deploy
# or
npx prisma migrate deploy

# Seed database
pnpm db:seed
# or
npx prisma db seed

# Reset database (WARNING: deletes all data)
pnpm db:reset
# or
npx prisma migrate reset

# Open Prisma Studio (GUI)
pnpm db:studio
# or
npx prisma studio

# Test database connection
pnpm db:test
# or
tsx scripts/test-db-connection.ts

# Format schema.prisma
pnpm prisma:format
# or
npx prisma format
```

---

## Workflow

### 1. Making Schema Changes

**Step 1**: Edit `prisma/schema.prisma`

```prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
```

**Step 2**: Format schema

```bash
npx prisma format
```

**Step 3**: Create migration (development)

```bash
npx prisma migrate dev --name add_new_model
```

This will:
- Generate SQL migration file
- Apply migration to database
- Regenerate Prisma Client

**Step 4**: Commit changes

```bash
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "Add NewModel to schema"
```

### 2. Applying Schema Changes (Production)

```bash
# On production server
npx prisma migrate deploy
```

This applies all pending migrations **without** prompts.

### 3. Adding a New Field

**Example**: Add `nickname` to `Client` model

```prisma
model Client {
  id        String   @id @default(uuid())
  email     String   @unique
  firstName String
  lastName  String
  nickname  String?  // ← New field (nullable)
  // ...
}
```

```bash
npx prisma migrate dev --name add_client_nickname
```

**Important**: If adding a **required** field, you must provide a default value or make it optional first.

### 4. Updating Zod Schemas

After schema changes, update corresponding Zod schemas:

```typescript
// src/schemas/client.schema.ts
export const createClientSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional(), // ← Add validation
});
```

---

## Migrations

### Migration Files

Located in `prisma/migrations/`:

```
migrations/
├── 20251110_init_schema/
│   ├── migration.sql
│   └── README.md (auto-generated)
├── 20251115_add_client_nickname/
│   └── migration.sql
```

### Migration File Structure

```sql
-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
```

### Manual Migration (Advanced)

If you need to create a migration manually:

```bash
# Create empty migration
npx prisma migrate dev --create-only --name manual_fix

# Edit the generated SQL file
code prisma/migrations/YYYYMMDD_manual_fix/migration.sql

# Apply migration
npx prisma migrate dev
```

### Rollback Migration

Prisma does **not** support automatic rollback. To rollback:

1. **Option A**: Reset database (WARNING: deletes all data)

```bash
npx prisma migrate reset
```

2. **Option B**: Manually write down migration

Create a new migration that reverses the changes:

```bash
npx prisma migrate dev --create-only --name revert_xyz
```

Edit the SQL file to reverse the previous migration.

---

## Seeding

### Default Seed

Run the seed script defined in `prisma/seed.ts`:

```bash
npx prisma db seed
```

### Seed Data

Current seed creates:
- 5 Movers (Bordeaux, Paris, Lyon, Marseille, Toulouse)
- ~15 Pricing Grids
- 5 Users (1 admin, 2 operators, 2 mover owners)
- 3 Clients + Folders
- ~10 Quotes (various statuses)
- 1 Top3 Selection
- 1 Booking + Payment

### Custom Seed

Modify `prisma/seed.ts` to add/remove data.

### Seed in Production

**⚠️ NEVER run `npx prisma db seed` in production!**

Use data import scripts or admin interface instead.

---

## Best Practices

### 1. Always Generate Client After Schema Changes

```bash
npx prisma generate
```

TypeScript will not recognize new fields until client is regenerated.

### 2. Soft Delete Pattern

Use `deletedAt` field instead of actual deletion:

```typescript
// BAD
await prisma.client.delete({ where: { id } });

// GOOD
await prisma.client.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Query non-deleted records
await prisma.client.findMany({
  where: { deletedAt: null },
});
```

### 3. Use Transactions for Related Changes

```typescript
await prisma.$transaction(async (tx) => {
  const folder = await tx.folder.update({ ... });
  const quote = await tx.quote.create({ ... });
  await tx.booking.create({ ... });
});
```

### 4. Connection Pooling

Neon.tech recommends **max 10 connections**:

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### 5. Use Prisma Studio for Debugging

```bash
npx prisma studio
```

Opens GUI at `http://localhost:5555` to view/edit data.

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check DATABASE_URL in `.env`

```bash
# Test connection
tsx scripts/test-db-connection.ts
```

### Error: "Migration failed"

**Solution 1**: Check migration SQL syntax

```bash
cat prisma/migrations/latest/migration.sql
```

**Solution 2**: Reset database (dev only)

```bash
npx prisma migrate reset
```

### Error: "Type mismatch" in TypeScript

**Solution**: Regenerate Prisma Client

```bash
npx prisma generate
```

Then restart TypeScript server in VS Code:
- `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### Error: "Unique constraint violation"

**Example**: Creating duplicate email

**Solution**: Handle error in application code:

```typescript
try {
  await prisma.client.create({ data: { email, ... } });
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('Email already exists');
  }
  throw error;
}
```

Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference

### Error: "Too many connections"

**Solution**: Use Prisma Client singleton (see `src/db/client.ts`)

### Slow Queries

**Solution 1**: Check indexes

```bash
npx prisma studio
```

Go to table → Check indexes tab

**Solution 2**: Use `EXPLAIN ANALYZE`

```typescript
const result = await prisma.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM "Quote"
  WHERE "folderId" = ${folderId}
  ORDER BY "scoreTotal" DESC
  LIMIT 3
`;
console.log(result);
```

Look for "Index Scan" (good) vs "Seq Scan" (slow).

---

## Useful Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon.tech Docs](https://neon.tech/docs)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

## Quick Reference

| Action | Command |
|--------|---------|
| Generate client | `npx prisma generate` |
| Create migration | `npx prisma migrate dev` |
| Apply migrations (prod) | `npx prisma migrate deploy` |
| Seed database | `npx prisma db seed` |
| Reset database | `npx prisma migrate reset` |
| Open GUI | `npx prisma studio` |
| Format schema | `npx prisma format` |
| Test connection | `tsx scripts/test-db-connection.ts` |


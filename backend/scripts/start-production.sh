#!/bin/bash
set -e

echo "🚀 Starting production deployment..."

# Run migrations and wait for completion
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Verify migrations completed
echo "✅ Migrations completed successfully"

# Seed database (uses upsert, safe to run multiple times)
echo "🌱 Seeding database with initial data..."
npx prisma db seed || echo "⚠️  Seeding skipped or failed (database may already be seeded)"

# Start the application
echo "🚀 Starting application..."
exec npm run start:prod

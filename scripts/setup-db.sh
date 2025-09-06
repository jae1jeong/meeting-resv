#!/bin/bash

echo "🚀 Setting up database for GroupMeet..."

# Check if .env.development.local exists
if [ ! -f .env.development.local ]; then
    echo "❌ .env.development.local not found!"
    echo "Please run: vercel env pull .env.development.local"
    exit 1
fi

# Load environment variables
export $(cat .env.development.local | grep -v '^#' | xargs)

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "🔄 Pushing schema to database..."
npx prisma db push

# Run migrations (optional, for production)
# echo "🔄 Running migrations..."
# npx prisma migrate deploy

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✅ Database setup complete!"
echo ""
echo "You can now:"
echo "  - View your database: npx prisma studio"
echo "  - Run the app: npm run dev"
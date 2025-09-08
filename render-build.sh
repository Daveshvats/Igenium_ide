#!/bin/bash

# Render build script for IdeaRpit
echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Setup database (only if DATABASE_URL is available)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️ Setting up database..."
    npx prisma db push
    echo "🌱 Seeding database..."
    npm run db:seed
else
    echo "⚠️ DATABASE_URL not found, skipping database setup"
fi

echo "✅ Build completed successfully!"
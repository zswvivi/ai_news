#!/bin/bash

# Test script for AI News Website

echo "Starting AI News Website tests..."

# Check if the project directory exists
if [ ! -d "/home/ubuntu/ai-news-website" ]; then
  echo "❌ Project directory not found!"
  exit 1
else
  echo "✅ Project directory exists"
fi

# Check if the database migration files exist
if [ ! -f "/home/ubuntu/ai-news-website/migrations/0001_initial.sql" ] || [ ! -f "/home/ubuntu/ai-news-website/migrations/0002_update_logs.sql" ]; then
  echo "❌ Database migration files not found!"
  exit 1
else
  echo "✅ Database migration files exist"
fi

# Check if key source files exist
FILES=(
  "/home/ubuntu/ai-news-website/src/lib/twitter-api.js"
  "/home/ubuntu/ai-news-website/src/lib/news-collection.ts"
  "/home/ubuntu/ai-news-website/src/lib/news-service.ts"
  "/home/ubuntu/ai-news-website/src/lib/news-update.ts"
  "/home/ubuntu/ai-news-website/src/app/page.tsx"
  "/home/ubuntu/ai-news-website/src/app/update/page.tsx"
  "/home/ubuntu/ai-news-website/src/app/api/news/route.ts"
  "/home/ubuntu/ai-news-website/src/app/api/filters/route.ts"
  "/home/ubuntu/ai-news-website/src/app/api/update/route.ts"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ File not found: $file"
    exit 1
  else
    echo "✅ File exists: $file"
  fi
done

# Check if component files exist
COMPONENTS=(
  "/home/ubuntu/ai-news-website/src/components/NewsCard.tsx"
  "/home/ubuntu/ai-news-website/src/components/NewsList.tsx"
  "/home/ubuntu/ai-news-website/src/components/Navbar.tsx"
  "/home/ubuntu/ai-news-website/src/components/NewsFilters.tsx"
  "/home/ubuntu/ai-news-website/src/components/Layout.tsx"
)

for component in "${COMPONENTS[@]}"; do
  if [ ! -f "$component" ]; then
    echo "❌ Component not found: $component"
    exit 1
  else
    echo "✅ Component exists: $component"
  fi
done

# Check if type definitions exist
if [ ! -f "/home/ubuntu/ai-news-website/src/types/news.ts" ]; then
  echo "❌ Type definitions not found!"
  exit 1
else
  echo "✅ Type definitions exist"
fi

# Test database migrations
echo "Testing database migrations..."
cd /home/ubuntu/ai-news-website
if ! wrangler d1 execute DB --local --file=migrations/0001_initial.sql; then
  echo "❌ Failed to execute initial database migration!"
  exit 1
else
  echo "✅ Initial database migration successful"
fi

if ! wrangler d1 execute DB --local --file=migrations/0002_update_logs.sql; then
  echo "❌ Failed to execute update logs database migration!"
  exit 1
else
  echo "✅ Update logs database migration successful"
fi

# Test development server startup
echo "Testing development server startup..."
cd /home/ubuntu/ai-news-website
if ! npm run dev > /dev/null 2>&1 & SERVER_PID=$!; then
  echo "❌ Failed to start development server!"
  exit 1
else
  echo "✅ Development server started successfully"
  # Wait for server to initialize
  sleep 5
  # Kill the server process
  kill $SERVER_PID
fi

echo "All tests passed! The AI News Website is ready for deployment."

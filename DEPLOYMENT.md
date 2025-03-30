# AI News Website - Deployment Instructions

This document provides instructions for deploying the AI News Website that collects, updates, and displays the latest news about AI agents.

## Prerequisites

- Node.js 16.x or later
- npm or yarn package manager
- A hosting platform that supports Next.js applications (Vercel, Netlify, AWS, etc.)
- Access to Twitter API (for news collection)

## Project Structure

The project follows a standard Next.js structure with the following key directories:

- `/src/app` - Next.js pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and services
- `/src/types` - TypeScript type definitions
- `/migrations` - Database migration files

## Installation Steps

1. **Install Dependencies**

```bash
npm install
# or
yarn install
```

2. **Fix Missing Dependencies**

If you encounter dependency issues during build, install these packages:

```bash
npm install autoprefixer postcss tailwindcss @types/node @types/react @types/react-dom
# or
yarn add autoprefixer postcss tailwindcss @types/node @types/react @types/react-dom
```

3. **Set Up Environment Variables**

Create a `.env.local` file in the root directory with the following variables:

```
# Database connection
DB_CONNECTION_STRING=your_database_connection_string

# Twitter API credentials (if using your own Twitter API)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

4. **Initialize Database**

Run the database migrations to set up the required tables:

```bash
npx wrangler d1 execute DB --local --file=migrations/0001_initial.sql
npx wrangler d1 execute DB --local --file=migrations/0002_update_logs.sql
```

5. **Build the Application**

```bash
npm run build
# or
yarn build
```

6. **Start the Application**

```bash
npm start
# or
yarn start
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy the application

### Option 2: Deploy to Netlify

1. Push your code to a GitHub repository
2. Connect your repository to Netlify
3. Configure build settings and environment variables
4. Deploy the application

### Option 3: Deploy to a Custom Server

1. Build the application: `npm run build`
2. Transfer the `.next` folder, `public` folder, `package.json`, and `next.config.js` to your server
3. Install dependencies on the server: `npm install --production`
4. Start the application: `npm start`

## Post-Deployment Steps

1. **Initialize News Collection**

After deployment, visit the `/update` page to trigger the initial news collection from Twitter.

2. **Set Up Scheduled Updates**

Configure a cron job or scheduled task to hit the update API endpoint regularly:

```
# Example cron job (every 6 hours)
0 */6 * * * curl -X POST https://your-domain.com/api/update -H "Content-Type: application/json" -d '{"type":"twitter_search"}'
```

## Troubleshooting

- **Build Errors**: If you encounter build errors related to missing dependencies, make sure to install all required packages.
- **Database Connection**: Verify that your database connection string is correct and the database is accessible.
- **API Rate Limits**: Be aware of Twitter API rate limits when configuring update frequency.

## Maintenance

- Regularly check the `/update` page to monitor update logs
- Consider adding more Twitter accounts to the news collection service for broader coverage
- Update search queries in the news collection service to refine the content focus

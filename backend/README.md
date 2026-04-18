# ZP School Backend

A comprehensive Node.js + Express + TypeScript backend built for the ZP School Website.

## Tech Stack
- **Framework**: Express.js with TypeScript
- **Database**: MySQL using Prisma ORM
- **Authentication**: Firebase Authentication
- **Validation**: Zod
- **Deployment**: Vercel (Serverless Functions)

## Prerequisites
1. Node.js 18+
2. MySQL locally or a cloud database (like PlanetScale)
3. A Firebase project with Authentication enabled, and a generated Service Account Key.

## Setup Instructions

### 1. Database Setup
Create a MySQL database locally named `zp_school` or create one on a cloud provider.

### 2. Environment Variables
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp .env.example .env
```
Fill in the following variables:
- `DATABASE_URL`: Your MySQL connection string.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Your Firebase service account credentials.

### 3. Install Dependencies
```bash
npm install
```

### 4. Prisma Migrations and Seed
Push the schema to your database and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```
Seed the database with default data (dummy students, demo admin/teacher accounts):
```bash
npm run seed
```

### 5. Start the Server Locally
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

## Deployment to Vercel

1. Install the Vercel CLI or connect your Git repository to Vercel.
2. In the Vercel dashboard, make sure to set the **Root Directory** to `backend`.
3. Add all your environment variables under Settings > Environment Variables in Vercel. Note: Make sure that `FIREBASE_PRIVATE_KEY` has its newlines properly formatted (Vercel automatically handles escaping if you paste the exact string).
4. Vercel will automatically detect `vercel.json` and deploy `api/index.ts` as a serverless function.

## API Documentation

The Postman collection containing example requests is located at `docs/Postman_Collection.json` (to run the APIs, replace the Bearer Token with a valid Firebase ID token).

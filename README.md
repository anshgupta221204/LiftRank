# LiftRank

LiftRank is a gym performance and competition platform that allows users to track exercises, log personal records (PRs), view rankings within their gym, compete in private groups, and check progress statistics.

## Project Structure

```text
LiftRank/
│
├── frontend/             # React + Vite application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route page views
│   │   ├── context/      # React Context (authentication, user data)
│   │   ├── services/     # API service configuration (Axios)
│   │   ├── utils/        # Utility helpers
│   │   ├── App.jsx       # App layout & routing definition
│   │   ├── main.jsx      # Vite entrypoint
│   │   └── index.css     # CSS with Tailwind styling
│   └── package.json
│
├── backend/              # Node.js + Express application
│   ├── controllers/      # Route logic handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express API endpoints
│   ├── middleware/       # JWT auth & validation middlewares
│   ├── config/           # Database & server configs
│   ├── utils/            # Helper scripts and constants
│   ├── server.js         # Backend entrypoint
│   └── package.json
│
├── .gitignore
└── README.md
```

## Setup & Running Instructions

### Prerequisites
- Node.js installed locally
- A MongoDB Atlas account/URI

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the template:
   ```text
   MONGO_URI=your_mongodb_atlas_uri_here
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```
4. Start the backend:
   - Development mode (with nodemon): `npm run dev`
   - Production mode: `npm start`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at the URL displayed in the terminal (usually `http://localhost:5173`).

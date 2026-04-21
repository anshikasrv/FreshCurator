# FreshCurator (Antigravity Project)

FreshCurator is a full-stack, AI-integrated delivery and management platform. It features a modern multi-folder architecture, secure Google OAuth authentication, and real-time communication.

## 📁 Project Structure

This repository is organized into five main modules:
* **frontend/**: Next.js 14 application (React, TypeScript, Tailwind CSS).
* **backend/**: Node.js/Express API (MongoDB, Socket.io, Gemini AI).
* **ui/**: Shared UI components and design assets.
* **export/**: Production build artifacts and exports.
* **scratch/**: Development drafts and technical notes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js (Google Provider & Credentials)
- **State**: Redux Toolkit
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons

### Backend
- **Environment**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **AI**: Google Generative AI (Gemini API)
- **Real-time**: Socket.io
- **Communication**: Nodemailer

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Cloud Console Project (for OAuth 2.0)

### Installation

1. **Clone the Repo:**
   ```bash
   git clone <your-repo-url>
   cd freshcurator
2.Backend Setup:
  npm install
    # Create a .env file with:
    # MONGO_URI, JWT_SECRET, GOOGLE_API_KEY
    npm run dev
3.Frontend Setup:
    cd ../frontend
npm install
# Create a .env.local file with:
# NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run dev
5. ``bash
   git clone <your-repo-url>
   cd freshcurator

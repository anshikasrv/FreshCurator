# FreshCurator 

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
- Node.js (v20.19.0 or newer; required by the installed Mongoose 9 release)
- MongoDB Atlas Account
- Google Cloud Console Project (for OAuth 2.0)

### Local setup

Install dependencies separately in `backend/` and `frontend/`, then run `npm run dev` in each directory. The backend loads `backend/.env`; Next.js loads `frontend/.env.local`.

Backend variables:

- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: long random signing secret used for API sessions and as the OTP HMAC fallback. Set `OTP_SECRET` separately for a dedicated OTP signing key.
- `EMAIL` and `PASS`: Gmail sender account and Gmail app password for login and delivery email. The sender must be permitted to send mail.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: server-side Razorpay test/live credentials; both are required for online checkout.
- `GEMINI_API_KEY`: Google AI Studio API key. Optional `GEMINI_MODEL` overrides the default `gemini-3.8-flash` model.
- `PORT`: optional API port (defaults to 4000).
- `FRONTEND_URL`: optional frontend origin allowed by backend CORS (defaults include local development and the configured production origin).

Frontend variables:

- `NEXTAUTH_SECRET`: long random NextAuth signing secret. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required for Google sign-in.
- `BACKEND_URL` (server-only) or `NEXT_PUBLIC_API_URL`: backend base URL, without `/api`.
- `NEXT_PUBLIC_SOCKET_SERVER`: optional Socket.IO/backend URL; defaults to `NEXT_PUBLIC_API_URL` or `http://localhost:4000`.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: public Razorpay key ID matching the backend key pair; never put the key secret here.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_PRESET`: Cloudinary cloud name and an unsigned image upload preset restricted to images and a suitable size limit.

Email sending, payment processing, Google sign-in, AI replies, and Cloudinary uploads require valid provider configuration and cannot be confirmed from code alone. Use provider test credentials and test accounts for local verification.




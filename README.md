<div align="center">

<img src="public/logo.png" alt="InterviewAIQ Logo" width="80" height="80" />

# InterviewAIQ

### The Future of Interview Preparation, Powered by AI

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vapi AI](https://img.shields.io/badge/Vapi_AI-7C3AED?style=for-the-badge&logo=ai&logoColor=white)](https://vapi.ai/)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**[🌐 Live Demo](https://interview-aiq.vercel.app) · [🐛 Report Bug](https://github.com/himanshisonkusale/InterviewAIQ/issues) · [✨ Request Feature](https://github.com/himanshisonkusale/InterviewAIQ/issues)**

![InterviewAIQ Banner](public/Candidate_interviewing_AI_assistant.mp4)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Firebase — Database Structure](#-firebase--database-structure)
- [How It Works](#-how-it-works)
- [Live Demo](#-live-demo)
- [Acknowledgements](#-acknowledgements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🚀 About the Project

**InterviewAIQ** is a next-generation AI-powered mock interview platform that simulates real interview experiences. It combines voice AI, live webcam sessions, and deep performance analytics to help candidates prepare smarter and interview with confidence.

Whether you're a frontend developer targeting a React role or a backend engineer interviewing for Python positions — InterviewAIQ generates tailored questions, conducts a real-time voice interview, and delivers a comprehensive performance report the moment your session ends.

> *"Practice Smart. Land the Job."*

---

## ✨ Features

### 🎙️ Voice-Powered AI Interview
Real-time voice conversations powered by **Vapi AI**. The AI interviewer listens, responds, and adapts — exactly like a human interviewer would.

### 📹 Live Webcam Session
Your webcam feed replaces a static avatar during interviews, complete with a **REC indicator**, **live interview timer**, and **mic level visualizer** — building real muscle memory for video interviews.

### 🧠 Groq AI Feedback Engine
After every session, your full transcript is analyzed by **Groq AI**, generating an instant, detailed performance report at lightning speed.

### 📊 5-Category Performance Scoring
Every interview is scored across five core pillars:
- **Communication Skills** — Clarity, structure, and articulation
- **Technical Knowledge** — Depth and accuracy of answers
- **Problem Solving** — Analytical thinking and approach
- **Cultural & Role Fit** — Alignment with role expectations
- **Confidence & Clarity** — Delivery and self-assurance

### 🎯 Role & Stack Customization
Choose your target role, experience level (Junior / Mid / Senior), interview type (Technical / Behavioral / Mixed), and tech stack. Every question is generated specifically for you.

### 🔄 Retake Simulation
Retake any interview directly from the feedback page to track improvement over time.

### 🌐 3D Landing Page
Cinematic landing page featuring **Spline 3D** scenes, **Framer Motion** animations, and a product video — giving InterviewAIQ a premium SaaS feel.

### 🔐 Secure Authentication
Email/password authentication via **Firebase Auth** with server-side session cookies for secure, persistent login.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, tailwindcss-animate |
| **UI Components** | shadcn/ui, Radix UI, Lucide React |
| **Animations** | Framer Motion |
| **3D Graphics** | Spline (@splinetool/react-spline) |
| **Voice AI** | Vapi AI (@vapi-ai/web v2.5) |
| **AI / LLM** | Groq API (@ai-sdk/groq) |
| **Video Calls** | Daily.co (@daily-co/daily-js) |
| **Auth & Database** | Firebase v11 (Auth + Firestore) |
| **Backend** | Firebase Admin SDK, Next.js API Routes |
| **Forms** | React Hook Form + Zod validation |
| **Date Handling** | Day.js |
| **Notifications** | Sonner |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
InterviewAIQ/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout (Mona Sans font, dark theme)
│   ├── globals.css                       # Global styles & CSS variables
│   ├── (auth)/
│   │   ├── sign-in/page.tsx              # Sign in page
│   │   ├── sign-up/page.tsx              # Sign up page
│   │   └── layout.tsx                    # Auth layout
│   ├── (root)/
│   │   ├── dashboard/page.tsx            # User dashboard
│   │   ├── interview/
│   │   │   ├── page.tsx                  # Create new interview
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Live interview session
│   │   │       └── feedback/page.tsx     # Performance report
│   │   └── layout.tsx                    # Root layout with navbar
│   └── api/
│       └── vapi/generate/route.ts        # Groq question generation API
│
├── components/
│   ├── Agent.tsx                         # Vapi voice call + webcam + visualizer
│   ├── AuthForm.tsx                      # Shared sign-in/sign-up form
│   ├── InterviewCard.tsx                 # Dashboard interview cards
│   ├── DisplayTechIcons.tsx              # Tech stack icon renderer
│   └── ui/                              # shadcn/ui components
│
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts                # Auth server actions
│   │   └── general.action.ts             # Interview & feedback Firestore actions
│   ├── utils.ts                          # cn(), getTechLogos(), helpers
│   └── vapi.sdk.ts                       # Vapi client instance
│
├── firebase/
│   ├── client.ts                         # Firebase client SDK
│   └── admin.ts                          # Firebase Admin SDK
│
├── constants/index.ts                    # Vapi config, tech mappings, covers
├── types/vapi.d.ts                       # Vapi message types
└── public/                               # Static assets, robot.png, avatars
```

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher
- **npm** or **yarn**
- A **Firebase** project (Firestore + Authentication enabled)
- A **Vapi AI** account
- A **Groq** API key

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/himanshisonkusale/InterviewAIQ.git
cd InterviewAIQ
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in all required values (see [Environment Variables](#-environment-variables) below).

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ── Firebase Client ──────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ── Firebase Admin ───────────────────────────────
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ── Vapi AI ──────────────────────────────────────
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# ── Groq AI ──────────────────────────────────────
GROQ_API_KEY=
```

> ⚠️ **Never commit your `.env.local` file.** It is already included in `.gitignore`.

---

## 🔥 Firebase — Database Structure

InterviewAIQ uses **Firebase Auth** for authentication and **Cloud Firestore** as the database. All data is stored in 2 collections:

**`interviews`** — stores each interview session
```
id, userId, role, level, type, techstack[], questions[], finalized, createdAt
```

**`feedback`** — stores AI-generated report for each interview
```
id, interviewId, userId, totalScore, finalAssessment,
strengths[], areasForImprovement[], createdAt,
categoryScores[{ name, score, comment }]
```

The 5 `categoryScores` are: **Communication Skills**, **Technical Knowledge**, **Problem Solving**, **Cultural & Role Fit**, **Confidence & Clarity**.

---

```
1. SIGN UP / SIGN IN
   └── Firebase Auth → Session cookie set server-side

2. DASHBOARD
   └── View your past interviews + available interviews to take

3. CREATE INTERVIEW
   └── Choose role, level, type, tech stack
   └── Vapi Assistant calls Groq → generates tailored questions
   └── Interview saved to Firestore

4. LIVE SESSION  (/interview/[id])
   └── Agent.tsx initializes Vapi voice call
   └── Webcam feed goes live with REC indicator + timer + mic visualizer
   └── Real-time transcript collected as you speak

5. FEEDBACK GENERATION  (/interview/[id]/feedback)
   └── Full transcript sent to Groq AI
   └── AI returns: totalScore, 5 categoryScores, strengths,
       areasForImprovement, finalAssessment
   └── Saved to Firestore → Performance Report rendered

6. RETAKE
   └── "Retake Simulation" button → reuse same interview questions
```

---

## 🌐 Live Demo

> Try the fully deployed app here → **[interview-aiq.vercel.app](https://interview-aiq.vercel.app)**

| Page | URL |
|---|---|
| 🏠 Landing Page | [/](https://interview-aiq.vercel.app/) |
| 🔐 Sign Up | [/sign-up](https://interview-aiq.vercel.app/sign-up) |
| 🔑 Sign In | [/sign-in](https://interview-aiq.vercel.app/sign-in) |
| 📊 Dashboard | [/dashboard](https://interview-aiq.vercel.app/dashboard) |
| 🎤 Start Interview | [/interview](https://interview-aiq.vercel.app/interview) |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

Please make sure your code follows the existing TypeScript + ESLint conventions.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

<div align="center">

**Himanshi Sonkusale**

[![GitHub](https://img.shields.io/badge/GitHub-himanshisonkusale-181717?style=for-the-badge&logo=github)](https://github.com/himanshisonkusale)
[![Live Site](https://img.shields.io/badge/Live_Site-interview--aiq.vercel.app-00F2FE?style=for-the-badge&logo=vercel&logoColor=black)](https://interview-aiq.vercel.app)

*Designed & Built with ❤️ by Himanshi*

</div>
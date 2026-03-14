# Kinetik — Digital Agency Platform

A full-stack, production-ready web platform for Kinetik Digital Agency. Built with React + Three.js on the frontend and Node.js + MongoDB on the backend.

---

## 🚀 Features

### Public Website
- **Cinematic 3D Hero** — Three.js particle field + icosahedron + Bloom post-processing
- **GSAP ScrollTrigger Animations** — Stagger reveals, clip-path, counter animations
- **Lenis Smooth Scroll** — Butter-smooth scroll integrated with GSAP
- **Real-time Chat Widget** — Socket.IO visitor-to-admin chat
- **6-section Homepage** — Services, Projects, Stats, Blog, Contact
- **Full Blog** — Debounced search, category filter, pagination
- **Projects** — Filterable grid with Framer Motion layout animations
- **404 Page** — Three.js animated wireframe

### Admin Dashboard
- **JWT Authentication** — Secure login/logout
- **Dashboard** — Recharts bar + pie charts, stat cards, live inquiry counter
- **Manage Projects** — Full CRUD with image upload (Cloudinary)
- **Manage Blogs** — Full CRUD + **Gemini AI content generation**
- **Manage Partners** — Logo grid CRUD
- **Contact Inquiries** — Real-time Socket.IO table + slide-in detail drawer

---

## 📁 Project Structure

```
Kinetik website/
├── client/          # React + Vite frontend
└── server/          # Node.js + Express backend
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key
- Gmail account (for Nodemailer)

### 2. Server Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kinetik
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
```

Start the server:
```bash
npm run dev
```

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API calls to the server.

---

## 👤 Create Admin Account

With the server running, make a one-time POST request:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@kinetik.agency", "password": "your_password"}'
```

Then login at: `http://localhost:5173/admin/login`

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login |
| GET | `/api/auth/me` | ✅ | Get admin profile |
| GET | `/api/projects` | — | List projects |
| POST | `/api/projects` | ✅ | Create project |
| PUT | `/api/projects/:id` | ✅ | Update project |
| DELETE | `/api/projects/:id` | ✅ | Delete project |
| GET | `/api/blogs` | — | List blogs |
| POST | `/api/blogs/generate` | ✅ | AI generate blog |
| GET | `/api/partners` | — | List partners |
| POST | `/api/contacts` | — | Submit contact form |
| GET | `/api/contacts` | ✅ | List inquiries |
| GET | `/api/contacts/stats/overview` | ✅ | Dashboard stats |

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Three.js, @react-three/fiber, GSAP, Framer Motion, Lenis, Tailwind CSS, React Query, Socket.IO client

**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.IO, JWT, Multer + Cloudinary, Nodemailer, Google Gemini API

---

## 🎨 Design System

- **Primary BG:** `#060608`
- **Accent Violet:** `#6C63FF`
- **Accent Cyan:** `#00D4FF`
- **Fonts:** Space Grotesk (headings), Inter (body)
- **Cards:** Glass morphism with `backdrop-filter: blur(20px)`

---

## 📄 License

MIT — Built with ❤️ by Kinetik

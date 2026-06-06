# VehiclePartsMS — Frontend

A modern, role-based web client for the **Vehicle Parts Selling & Inventory Management System**.
Built with React 19 + Vite and a custom Tailwind design system, it serves three portals —
**Admin**, **Staff**, and **Customer** — and includes a built-in, role-aware **AI assistant**.

> This is the frontend only. It talks to the separate **VehiclePartsMS .NET API** over REST.

---

## ✨ Features

### Admin
- Dashboard with KPIs, **inventory-health donut** & overview charts
- Parts inventory (CRUD, image upload, table/grid views, category autocomplete)
- Vendors, Staff (with profile detail), Purchase Invoices
- Financial Reports (daily / monthly / yearly)
- Customer Reviews overview (average rating, breakdown)

### Staff
- Dashboard with appointment & part-request charts
- Customer management (register, search, full detail panel)
- Sales & invoicing (loyalty discount, email receipts, **mark credit → paid**)
- Appointments management (confirm / complete / cancel)
- Part-request handling (mark available / unavailable → emails the customer)
- Customer reports & editable staff profile

### Customer
- Profile dashboard (avatar & vehicle photos, stats, activity charts)
- Browse parts catalog (image cards) and request parts (prefilled from catalog)
- Book / edit / cancel service appointments
- Submit, edit & track part requests
- Leave reviews, view purchase & service history

### Everyone
- 🤖 **AI assistant** — floating chat, role-aware: customers get portal help &
  can book/cancel appointments and submit requests via tools; staff/admin can
  ask about live stock, credit, appointments, etc.
- Light/dark mode, responsive layout, change-password, secure JWT auth

---

## 🧰 Tech Stack

| Area | Choice |
|------|--------|
| Framework | **React 19** |
| Build tool | **Vite 8** |
| Styling | **Tailwind CSS v4** (custom design-system primitives) |
| Routing | **React Router 7** |
| HTTP | **Axios** (JWT interceptor, multipart-aware) |
| Icons | **lucide-react** |
| Charts | Dependency-free inline **SVG** components |

No UI kit, no chart library — the design system and charts are hand-built and
fully themeable.

---

## 📂 Project Structure

```
src/
├── api/            # Axios instance + per-resource API clients
├── components/
│   ├── ui/         # Design-system primitives (Card, Button, Modal, Charts…)
│   └── layout/     # Config-driven Sidebar + DashboardLayout (3 roles)
├── context/        # Auth & Theme providers
├── hooks/          # useAuth, useCustomerProfile
├── pages/
│   ├── auth/       # Login, Register
│   ├── admin/      # Admin portal pages
│   ├── staff/      # Staff portal pages
│   └── customer/   # Customer portal pages
├── routes/         # Router + protected routes
└── lib/ · utils/   # cn() helper, formatters
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- The **VehiclePartsMS .NET API** running locally on `http://localhost:5147`
  (the dev server proxies `/api` and `/images` to it — see `vite.config.js`)

### Install & run

```bash
npm install
npm run dev          # http://localhost:5173
```

### Build for production

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (HMR) |
| `npm run build` | Production build |
| `npm run preview` | Preview the built app |
| `npm run lint` | Run ESLint |

---

## 🔌 Backend Connection

`vite.config.js` proxies API and uploaded media to the .NET backend:

```js
server: { proxy: {
  '/api':    { target: 'http://localhost:5147' },
  '/images': { target: 'http://localhost:5147' },
} }
```

Auth is JWT-based: the token is stored in `localStorage` and attached to every
request by the Axios interceptor. A `401` clears the session and redirects to login.

> **AI assistant:** all AI calls are proxied through the backend (`POST /api/chat`).
> The API key lives **only** on the server (never in the browser). The provider
> (Groq / Gemini) is configured server-side.

---

## 👥 Roles

| Role | Landing | Access |
|------|---------|--------|
| Admin | `/admin/dashboard` | Inventory, vendors, staff, purchases, reports, reviews |
| Staff | `/staff/dashboard` | Customers, sales, appointments, part requests |
| Customer | `/customer/dashboard` | Profile, catalog, appointments, requests, reviews |

Routes are guarded by role; unauthorized access is redirected.

---

## 📝 Notes

- Academic project — Vehicle Parts Selling & Inventory Management System.
- The backend API is maintained in its own repository.

---


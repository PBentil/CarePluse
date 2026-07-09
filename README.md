> The complete digital healthcare SaaS platform for hospitals across Ghana and Africa.

CarePulse replaces paper-based patient intake with a connected digital system — covering patient registration, doctor consultations, lab tests, prescriptions, payments, and drug delivery. Built as a multi-tenant SaaS where hospitals subscribe and get their own isolated portal.

---

## Live Demo

**Demo hospital slug:** `demo-hospital`

| Role | URL | Email | Password |
|------|-----|-------|----------|
| Admin | `/demo-hospital/admin/login` | admin@demohospital.com | admin123 |
| Doctor | `/demo-hospital/doctor/login` | dr.mensah@demohospital.com | doctor123 |
| Nurse | `/demo-hospital/admin/login` | nurse@demohospital.com | staff123 |
| Receptionist | `/demo-hospital/admin/login` | reception@demohospital.com | staff123 |
| Pharmacist | `/demo-hospital/admin/login` | pharmacy@demohospital.com | staff123 |
| Patient | `/demo-hospital/patient/login` | kofi@example.com | OTP via email |
| Super Admin | `/superadmin/login` | admin@carepulse.app | superadmin123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, React Hook Form, Zod |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom cookie-based auth (bcrypt), OTP for patients |
| Video | Daily.co |
| Payments | Paystack (Mobile Money + Card) |
| Notifications | Twilio (SMS) + Gmail (Email) |
| File uploads | Cloudinary |
| Deployment | Vercel (recommended) |

---

## Features

### Patient Journey
1. **Register** — patient fills intake form, selects primary doctor
2. **Book appointment** — picks doctor, date, and available time slot
3. **Video consultation** — secure HD video via Daily.co
4. **Lab tests** — doctor orders tests, patient uploads results or receives from lab
5. **Digital prescription** — itemised drug list from hospital catalogue
6. **Pay online** — Mobile Money or card via Paystack
7. **Drug delivery** — Packed → On the way → Delivered with SMS/email at each stage

### Portals
- **Super Admin** (`/superadmin`) — platform-wide management, hospitals, subscriptions, analytics
- **Hospital Admin** (`/[slug]/admin`) — full hospital management
- **Staff** (`/[slug]/admin` → role-based) — nurse, receptionist, pharmacist dashboards
- **Doctor** (`/[slug]/doctor`) — patients, appointments, video, notes, lab tests, prescriptions
- **Patient** (`/[slug]/patient`) — register, book, video, lab tests, pay, track

### SaaS
- Multi-tenant — each hospital fully isolated by `hospitalId`
- Slug-based routing — `carepulse.com/[hospital]/admin`
- Subscription plans — Starter (GH₵500), Growth (GH₵1500), Enterprise (GH₵4000)
- 14-day free trial on registration
- Super admin can activate, suspend, and monitor all hospitals

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Accounts: Daily.co, Paystack, Twilio, Gmail, Cloudinary

### Installation

```bash
git clone https://github.com/your-username/carepulse
cd carepulse
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/carepulse"

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

DAILY_API_KEY=your_daily_api_key
NEXT_PUBLIC_DAILY_DOMAIN=your_subdomain

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYSTACK_SECRET_KEY=sk_live_xxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
npx prisma migrate dev
node prisma/seed.js
```

### Run

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure
app/
[slug]/
admin/          # Hospital admin + staff portal
doctor/         # Doctor portal
patient/        # Patient portal
superadmin/       # CarePulse super admin
register/         # Hospital self-registration
pricing/          # Pricing page
features/         # Features page
api/
[slug]/
admin/        # Hospital admin API routes
doctor/       # Doctor API routes
patient/      # Patient API routes
superadmin/     # Super admin API routes
auth/           # Authentication routes
hospitals/      # Hospital registration API
components/
hospital/
admin-sidebar   # Hospital admin sidebar
doctor/         # Doctor portal components
patient/        # Patient portal components
staff/          # Staff portal components
superadmin/       # Super admin components
admin/            # Shared admin UI components
lib/
auth.ts           # Auth helpers (slug-aware)
daily.ts          # Daily.co video rooms
cloudinary.ts     # File uploads
notification.ts   # SMS + Email
plans.ts          # Subscription plan config
slug.ts           # Slug generation
prisma/
schema.prisma     # Database schema
seed.js           # Demo data seed

---

## Subscription Plans

| Plan | Price | Clinics | Doctors |
|------|-------|---------|---------|
| Starter | GH₵ 500/mo | 1 | Up to 5 |
| Growth | GH₵ 1,500/mo | 5 | Up to 25 |
| Enterprise | GH₵ 4,000/mo | Unlimited | Unlimited |

---

## Roadmap

- [ ] Push notifications
- [ ] Prescription PDF download
- [ ] Mobile app (React Native)
- [ ] Multi-language support (English, Twi, French)
- [ ] EHR integration
- [ ] Insurance claims processing
- [ ] Telemedicine scheduling with AI

---

## Made in Ghana 🇬🇭

Built with love to improve healthcare delivery across Africa.
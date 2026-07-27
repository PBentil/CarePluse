# CarePulse

> The complete digital healthcare SaaS platform for hospitals across Ghana and Africa.

CarePulse replaces paper-based hospital management with a connected digital system — covering patient registration, doctor consultations, lab tests, prescriptions, payments, and drug delivery. Built as a multi-tenant SaaS where hospitals subscribe and get their own isolated portal at `carepulse.com/[hospital]`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, React Hook Form, Zod |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom cookie-based auth (bcrypt), OTP for patients |
| Video | Jitsi Meet (free, no API key) |
| Payments | Paystack (Mobile Money + Card) |
| Notifications | Twilio (SMS) + Gmail (Email) |
| Push notifications | Web Push API + VAPID |
| File uploads | Cloudinary |
| Deployment | Vercel + Neon (PostgreSQL) |

---

## Features

### Patient Journey
1. **Register** — 2-step intake form, selects primary doctor
2. **OTP login** — passwordless, code via email + SMS
3. **Book appointment** — picks doctor, date, available time slot (no double booking)
4. **Video consultation** — free HD video via Jitsi Meet
5. **Lab tests** — doctor orders tests, patient self-uploads results or receives from lab
6. **Digital prescription** — itemised drug list from hospital catalogue with prices
7. **Pay online** — Mobile Money (MTN, Vodafone) or card via Paystack
8. **Drug delivery** — Packed → On the way → Delivered with push + SMS + email at each stage
9. **Cancel appointment** — patient can cancel pending/confirmed appointments
10. **Download prescription** — printable PDF prescription
11. **Download receipt** — printable invoice after delivery

### Doctor Portal
- Dashboard with today's appointments and stats
- Assigned patients with full medical history
- Confirm, reject, reschedule appointments
- Write consultation notes and diagnosis
- Order lab tests from catalogue
- Issue digital prescriptions from drug catalogue
- Set weekly availability (days + time slots)
- Mark appointments as completed
- Change password

### Hospital Admin Portal
- Full dashboard with charts — appointments per month, status breakdown, top doctors
- Manage patients, doctors, staff
- Add nurses, receptionists, pharmacists with role-based access
- Monitor lab tests, prescriptions, orders
- Manage drug catalogue with pricing
- Update delivery status

### Staff Portals (role-based)
- **Nurse** — patients, appointments, lab tests
- **Receptionist** — patients, appointments
- **Pharmacist** — prescriptions, drug catalogue, orders

### SaaS & Platform
- Multi-tenant — each hospital fully isolated by `hospitalId`
- Slug-based routing — `carepulse.com/[hospital]`
- Hospital landing page — one URL for all portals
- Subscription plans — Starter, Growth, Enterprise
- 14-day free trial on registration
- Subscription enforcement — expired hospitals blocked
- Trial expiry banner — shows when 3 days left
- Super admin — platform overview, hospitals, subscriptions, analytics, settings

### Infrastructure
- Push notifications — bell icon, browser Web Push
- SMS via Twilio at every key event
- Email via Gmail with HTML templates
- File uploads via Cloudinary (lab results, ID documents)
- Mobile responsive — hamburger menu on mobile
- Cache control — no back button access after logout
- Auth guard — client-side cookie check on all portals
- Appointment reminders — SMS + email 24hrs before via cron

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Accounts: Paystack, Twilio, Gmail, Cloudinary

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

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYSTACK_SECRET_KEY=sk_live_xxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@carepulse.app

CRON_SECRET=your_random_secret

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

## Demo Seed

Running `node prisma/seed.js` creates a fully populated demo hospital with:

- ✅ Hospital: **Demo Hospital** at `/demo-hospital`
- ✅ 2 doctors with availability set (Mon–Fri, 9am–5pm)
- ✅ 3 staff members (nurse, receptionist, pharmacist)
- ✅ 1 demo patient
- ✅ 8 common drugs in the catalogue
- ✅ Super admin account

---

## Project Structure

app/
[slug]/
admin/ # Hospital admin + staff portal
doctor/ # Doctor portal
patient/ # Patient portal
staff/ # Staff role dashboards
superadmin/ # CarePulse super admin
register/ # Hospital self-registration
pricing/ # Pricing page
features/ # Features page
call/[roomName]/ # Jitsi video call page
api/
[slug]/
admin/ # Hospital admin API routes
doctor/ # Doctor API routes
patient/ # Patient API routes
public/ # Public API routes (no auth)
superadmin/ # Super admin API routes
auth/ # Authentication routes
hospitals/ # Hospital registration API
push/ # Push notification routes
cron/ # Cron job routes
components/
hospital/
admin-sidebar # Hospital admin sidebar
doctor/ # Doctor portal components
patient/ # Patient portal components
staff/ # Staff portal components
superadmin/ # Super admin components
admin/ # Shared admin UI components
hooks/
use-push-notifications.ts # Web push hook
use-auth-guard.ts # Auth guard hook
lib/
auth.ts # Auth helpers (slug-aware)
video.ts # Jitsi video room helper
cloudinary.ts # File uploads
notification.ts # SMS + Email
push.ts # Web push notifications
plans.ts # Subscription plan config
slug.ts # Slug generation
prisma/
schema.prisma # Database schema
seed.js # Demo data seed
public/
sw.js # Service worker for push notifications
favicon.svg # CarePulse favicon


---

## Subscription Plans

| Plan | Price | Clinics | Doctors | Features |
|------|-------|---------|---------|----------|
| Starter | GH₵ 500/mo | 1 | Up to 5 | All core features |
| Growth | GH₵ 1,500/mo | 5 | Up to 25 | All features + priority support |
| Enterprise | GH₵ 4,000/mo | Unlimited | Unlimited | All features + dedicated support |

All plans include a 14-day free trial.

---

## Deployment

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Create hosted database
Recommended: [Neon](https://neon.tech) (free serverless PostgreSQL)

```bash
# After creating Neon database, update DATABASE_URL in Vercel env vars
# Then run migrations
npx prisma migrate deploy
node prisma/seed.js
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Add all environment variables
4. Deploy

### 4. Post-deployment
```bash
# Set NEXT_PUBLIC_APP_URL to your Vercel URL
NEXT_PUBLIC_APP_URL=https://carepulse.vercel.app

# Configure cron job in vercel.json (already included)
# Runs daily at 8am UTC — sends appointment reminders
```

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support (English, Twi, French)
- [ ] EHR integration
- [ ] Insurance claims processing
- [ ] Telemedicine scheduling with AI
- [ ] Clinic branch management
- [ ] Bulk patient import
- [ ] WhatsApp notifications

---

## Made in Ghana 🇬🇭

Built with ❤️ to improve healthcare delivery across Africa.

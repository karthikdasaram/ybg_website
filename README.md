# Yash Body Grow Gym - Management System

A full-stack Gym Management System built from your SRS: Node.js/Express backend, MongoDB database, and a plain HTML/CSS/JavaScript frontend. Three roles: **Admin** (full control), **Trainer** (manages their assigned members), and **Member** (self-service). Visitors can browse plans, trainers, and gallery, and submit enquiries/testimonials without logging in.

This build now covers the **full SRS feature set**:
- Authentication (register, login, logout, change password, forgot/reset password) for Admin, Trainer, and Member roles
- Dashboard (admin stats: members, revenue, attendance, pending payments)
- Membership Plans (CRUD + activate/deactivate)
- Member Management (CRUD, search, filter, assign plan/trainer)
- Trainer Management (CRUD, optional login account creation)
- Trainer Portal (separate login — manage their own members, plans, schedule)
- Attendance (mark/edit/view, per-member history)
- Payments (record/update/delete, history, auto receipt numbers)
- Workout Plans (admin or trainer creates/assigns; member views)
- Diet Plans (admin or trainer creates/assigns; member views)
- Progress Tracking (weight, BMI auto-calculated, body measurements)
- Trainer Schedule (weekly session slots, optionally tied to a member)
- Gallery (URL-based images/videos — admin manages, public page displays)
- Testimonials (members submit, admin approves before they appear publicly)
- Contact/Enquiries (public form saves to DB, admin manages status)
- Notifications (admin announcements + live "reminders due" view for expiring memberships / pending payments)
- Reports (revenue by month, membership breakdown, attendance summary, payment summary, trainer load)
- Public website (home, plans, trainers, gallery, contact)

**Not included** (would need extra infrastructure beyond this codebase): actual file upload storage for the gallery (it's URL-based — paste a link to an already-hosted image/video), automatic email/SMS sending for reminders (the admin sees a live "due" list to act on), QR-code attendance, online payment gateway integration, a mobile app, and AI-based recommendations. These were listed as "Future Enhancements" in your SRS and are natural next steps once the core system is live.

---

## 1. Project Structure

```
gym-management/
├── backend/                 # Node.js + Express + MongoDB API
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Business logic per module (16 modules)
│   ├── middleware/          # JWT auth, role guard, error handler
│   ├── models/               # Mongoose schemas (14 models)
│   ├── routes/               # Express routers (16 route files)
│   ├── utils/seedAdmin.js    # Creates the first admin account
│   ├── server.js             # App entry point
│   ├── package.json
│   └── .env.example          # Copy to .env and fill in
│
└── frontend/                 # Plain HTML/CSS/JS
    ├── index.html, plans.html, trainers.html, gallery.html, contact.html   # Public site
    ├── css/style.css
    ├── js/api.js              # API + auth helper (used by every page)
    ├── js/admin.js            # Page guards (admin/trainer/member) + modal helpers
    └── pages/
        ├── login.html, register.html, settings.html
        ├── admin/     # dashboard, members, trainers, plans, attendance, payments,
        │               # workouts, diets, progress, schedule, gallery, testimonials,
        │               # messages, notifications, reports
        ├── trainer/   # dashboard, members, workouts, diets, progress, schedule
        └── member/    # dashboard, attendance, payments, workouts, diets, progress,
                        # notifications, feedback
```

---

## 2. Backend Setup

**Requirements:** Node.js 18+ and a MongoDB Atlas connection string.

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in `MONGO_URI`, `JWT_SECRET`, and the admin seed credentials — see comments in `.env.example`.

Create the first admin account:
```bash
npm run seed
```
Log in with these credentials, then change the password from Settings.

Start the server:
```bash
npm run dev     # auto-restarts on changes (uses nodemon)
# or
npm start
```

Verify it's alive: `http://localhost:5000/api/health`.

**Creating trainer logins:** trainers don't self-register. From the admin Trainers page, check "Create a login account for this trainer" when adding a new trainer and set a password — that trainer can then log in at the same login page and lands on the Trainer Portal automatically based on their role.

---

## 3. Frontend Setup

Static HTML/CSS/JS — no build step. Calls the API at `http://localhost:5000/api` (see `API_BASE_URL` in `frontend/js/api.js`).

Serve it over HTTP (not `file://`) to avoid CORS issues — e.g.:
```bash
cd frontend
python3 -m http.server 5500
```
Then visit `http://localhost:5500`. Keep the backend running in a separate terminal.

---

## 4. Using the App

- **Visitors**: browse home, plans, trainers, gallery; submit an enquiry via Contact; register as a member.
- **Admin**: full control across all sidebar sections — start by adding plans → trainers → members, then explore workouts/diets/progress/schedule/gallery/testimonials/messages/notifications/reports.
- **Trainer**: logs in with the account an admin created for them, sees only their assigned members, and manages workout plans, diet plans, progress entries, and their own weekly schedule for those members.
- **Member**: self-registers, views their profile/membership/attendance/payments (read-only), views workout & diet plans assigned to them, tracks their own progress history, reads notifications, and can leave feedback (goes to admin for approval before appearing publicly).

---

## 5. API Reference (quick overview)

All routes are prefixed with `/api`. Protected routes require header `Authorization: Bearer <token>`.

| Module | Method & Path | Access |
|---|---|---|
| Auth | POST `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | Public |
| Auth | GET `/auth/me`, PUT `/auth/change-password` | Logged-in |
| Dashboard | GET `/dashboard/stats` | Admin |
| Members | CRUD `/members`, POST `/members/:id/assign-plan` | Admin |
| Members | GET `/members/me` | Member |
| Trainers | GET `/trainers`, GET `/trainers/:id` | Public |
| Trainers | POST/PUT/DELETE `/trainers` | Admin |
| Trainers | GET `/trainers/me/profile`, GET `/trainers/me/members` | Trainer |
| Plans | GET `/plans`, GET `/plans/:id` | Public |
| Plans | POST/PUT/DELETE `/plans`, PATCH `/plans/:id/toggle` | Admin |
| Attendance | POST/GET `/attendance`, PUT `/attendance/:id` | Admin |
| Attendance | GET `/attendance/me` | Member |
| Payments | POST/GET `/payments`, PUT/DELETE `/payments/:id` | Admin |
| Payments | GET `/payments/me` | Member |
| Workouts | GET/POST `/workouts`, PUT/DELETE `/workouts/:id` | Admin, Trainer (own members only) |
| Workouts | GET `/workouts/me` | Member |
| Diets | GET/POST `/diets`, PUT/DELETE `/diets/:id` | Admin, Trainer (own members only) |
| Diets | GET `/diets/me` | Member |
| Progress | GET/POST `/progress`, DELETE `/progress/:id` | Admin, Trainer (own members only) |
| Progress | GET `/progress/me` | Member |
| Schedules | GET/POST/PUT/DELETE `/schedules` | Admin, Trainer (own schedule) |
| Gallery | GET `/gallery` | Public |
| Gallery | POST/DELETE `/gallery` | Admin |
| Testimonials | GET `/testimonials` | Public (approved only) |
| Testimonials | GET `/testimonials/all`, PATCH `/testimonials/:id/approve`, DELETE | Admin |
| Testimonials | POST `/testimonials` | Member |
| Contact | POST `/contact` | Public |
| Contact | GET/PUT/DELETE `/contact` | Admin |
| Notifications | GET `/notifications/me` | Member |
| Notifications | GET `/notifications`, POST, DELETE, GET `/notifications/reminders` | Admin |
| Reports | GET `/reports/revenue`, `/reports/membership`, `/reports/attendance`, `/reports/payments`, `/reports/trainers` | Admin |

---

## 6. Security Notes

- Passwords hashed with bcrypt; JWT-based auth with role-based access control (`protect` + `authorize(...)` middleware).
- Trainer-scoped endpoints (workouts/diets/progress/schedule) double-check server-side that a trainer can only touch their own assigned members — this isn't just hidden in the UI.
- Mongoose schema validation on all writes; CORS enabled (tighten before production).
- Before going live: change `JWT_SECRET`, change the seeded admin password immediately, consider rate-limiting `/auth` routes.

## 7. Deploying

Backend: set the same `.env` variables in your host's environment, run `npm start`. Frontend: deploy the `frontend/` folder as static files and update `API_BASE_URL` in `frontend/js/api.js` to your deployed backend URL.

---

## 8. Natural Next Steps

If you want to push further past this build:
1. Real file upload for the gallery (e.g. via Cloudinary or S3) instead of pasting URLs
2. Actual email/SMS sending for membership & payment reminders (currently a live "due" list for admin)
3. QR-code check-in for attendance
4. Online payment gateway integration (Stripe/Razorpay) instead of manually recorded payments
5. Exportable reports (CSV/PDF) instead of in-browser summaries
6. A dedicated mobile app or PWA wrapper
# Hand Picked
  
Hand Picked (HDPick) `/ˌhan(d)ˈpɪkt/` is a modern web application for creating and downloading customised Folder Icon, Polaroid Photo Frame, and other premium assets.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)

## Features

### Core Features
- **Icon Generator**: Create custom folder icons with various colors and styles
- **Multi-Library Support**: 5000+ icons from Lucide, Font Awesome, Heroicons, Unicons, and Grommet Icons
- **Bundles**: Curated collections of folder icons (Gaming, Finance, Office, etc.)
- **Blog & Pages**: Built-in CMS with rich text editor for content management

### User Features
- **Authentication**: Email/Password, Magic Links, and Google Sign-in via Firebase
- **Subscription Plans**: Monthly, Annual, and Lifetime access via Stripe
- **User Profiles**: Manage account, view billing history, download invoices

### Admin Features
- **Dashboard**: Manage users, bundles, operating systems, and site settings
- **Monetization**: Sync plans with Stripe, manage ads and tracking codes
- **Content Management**: Blog posts, static pages, hero slider, categories, and tags

### Security Features
- **Content Security Policy (CSP)**: Whitelisted domains for analytics, ads, and embeds
- **Rate Limiting**: Protection against brute-force attacks on auth endpoints
- **HTML Sanitization**: XSS protection with iframe source restrictions
- **Security Headers**: X-Frame-Options, XSS-Protection, HSTS (production)

---

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Firebase project ([Create one here](https://console.firebase.google.com/))
- Stripe account ([Sign up here](https://dashboard.stripe.com/register))

### 1. Clone & Install

```bash
git clone https://github.com/shariati/OS-Folder-Icons.git
cd OS-Folder-Icons
npm install
```

### 2. Configure Environment

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables) below).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Firebase Configuration

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API Key | [Firebase Console](https://console.firebase.google.com/) → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage Bucket | Firebase Console → Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | Project Settings → Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Project Settings → General |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Service Account JSON | [See Firebase Admin Setup](#firebase-admin-setup) |

> **Firebase Docs**: [Get started with Firebase](https://firebase.google.com/docs/web/setup)

### Stripe Configuration

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable Key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → API Keys |
| `STRIPE_SECRET_KEY` | Secret Key | Same as above (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook Signing Secret | [See Stripe Webhook Setup](#stripe-webhook-setup) |

> **Stripe Docs**: [Stripe API Keys](https://stripe.com/docs/keys)

### Other Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `NEXT_PUBLIC_APP_ENV` | Environment mode | `local`, `test`, `production` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the app | `http://localhost:3000` |
| `STAGING_USER` | Staging basic auth username | Any string |
| `STAGING_PASSWORD` | Staging basic auth password | Any string |

---

## Setup Guides

### Firebase Admin Setup

The Firebase Admin SDK is required for server-side authentication.

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click **Generate new private key**
3. Download the JSON file
4. Set `FIREBASE_SERVICE_ACCOUNT_KEY` as the **entire JSON contents** (minified on one line)

```bash
# Example (the JSON should be on one line)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project",...}
```

> **Firebase Admin Docs**: [Add the Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Stripe Webhook Setup

Webhooks are required to sync subscription status after payments.

**For Local Development:**
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy the webhook signing secret (starts with `whsec_`)
4. Set `STRIPE_WEBHOOK_SECRET` in `.env.local`

**For Production (Vercel):**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy the signing secret and add to Vercel environment variables

> **Stripe Webhook Docs**: [Webhooks overview](https://stripe.com/docs/webhooks)

### Firebase Auth Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Authentication → Sign-in method
2. Enable the following providers:
   - **Email/Password** (with Email link/Magic link enabled)
   - **Google**
3. Add your domains to **Authorized domains**:
   - `localhost`
   - `yourdomain.com`
   - `*.vercel.app` (for preview deployments)

> **Firebase Auth Docs**: [Get started with Firebase Authentication](https://firebase.google.com/docs/auth/web/start)

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Add environment variables in Project Settings → Environment Variables
4. Deploy!

> **Vercel Docs**: [Deploying Next.js](https://vercel.com/docs/frameworks/nextjs)

### Environment-Specific Setup

| Environment | `NEXT_PUBLIC_APP_ENV` | Domain | Notes |
|-------------|----------------------|--------|-------|
| Development | `local` | localhost:3000 | Hot reload, debug logging |
| Staging | `test` | test.yourdomain.com | Basic auth, noindex headers |
| Production | `production` | yourdomain.com | HSTS, full security headers |

### Staging Environment

The staging environment (`test` mode) automatically:
- Requires Basic Authentication (set `STAGING_USER` and `STAGING_PASSWORD`)
- Adds `X-Robots-Tag: noindex, nofollow` headers
- Blocks search engine indexing

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints (protected)
│   │   ├── auth/          # Authentication
│   │   ├── stripe/        # Stripe webhooks & checkout
│   │   └── upload/        # File uploads
│   ├── admin/             # Admin dashboard
│   ├── blog/              # Blog pages
│   ├── bundles/           # Bundle details
│   ├── create/            # Icon generator
│   ├── login/             # Login page
│   └── profile/           # User profile
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   ├── editor/            # Rich text editor
│   └── ui/                # Shared UI components
├── contexts/              # React contexts (Auth, Theme)
├── lib/                   # Utilities
│   ├── db/                # Database adapters
│   ├── firebase/          # Firebase client & admin
│   ├── security/          # CSP config, rate limiting
│   └── storage/           # File storage adapters
└── types/                 # TypeScript types
```

---

## Security

This application implements enterprise-grade security:

| Feature | Implementation |
|---------|----------------|
| **Authentication** | Firebase Auth with token verification |
| **Authorization** | Role-based access control (admin claims) |
| **CSP** | Strict Content Security Policy |
| **Rate Limiting** | In-memory rate limiting on auth endpoints |
| **XSS Protection** | HTML sanitization with `sanitize-html` |
| **CSRF** | SameSite cookies, token verification |
| **Security Headers** | X-Frame-Options, X-XSS-Protection, HSTS |

---

## License

**Source Available** - This project is NOT open source.

**Public Repository**: [GitHub](https://github.com/shariati/OS-Folder-Icons) (Source Available for transparency and education).

### Allowed (Free)
- ✅ Personal and educational use
- ✅ Studying and modifying the code locally
- ✅ Contributing improvements

### Restricted (Requires License)
- ❌ Commercial use
- ❌ Deploying for business purposes
- ❌ Redistributing for profit

For commercial licensing, start a discussion:
[Commercial Use Requests](https://github.com/shariati/OS-Folder-Icons/discussions/155) or [Email](mailto:hello@hdpick.com)

### Restricted Assets
Certain media files in this repository (specifically in `public/backgrounds/`) are licensed **exclusively** for the official `hdpick.com` deployment.
- These files are **NOT** covered by the general license.
- You may **NOT** redistribute, modify, or use these assets in any other project without purchasing a separate license from the original creator.
- See [licenses/README.md](licenses/README.md) for details.

---

### Legal Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
---

## Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Project Links
- **Live Site**: [hdpick.com](https://hdpick.com)
- **GitHub**: [OS-Folder-Icons](https://github.com/shariati/OS-Folder-Icons)
- **Discussions**: [Q&A](https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a)

### Connect
- **LinkedIn**: [Amin Shariati](https://www.linkedin.com/in/aminshariati)
- **Medium**: [@shariati](https://medium.com/@shariati)

---

## Legacy Python Code

The old Python code has been removed. Access it from:
[Release 2.1.0](https://github.com/shariati/setupmymac/releases/tag/2.1.0)


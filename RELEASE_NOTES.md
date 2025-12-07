# Release Notes - Hand Picked v3.0.0

**Release Date:** December 7, 2025  
**Base Commit:** `f977bb4` (December 1, 2025)

---

## 🎉 What's New

This major release represents a complete rewrite of the application from Python to Next.js 16, introducing a modern web platform for creating and managing custom folder icons, photo frames, and premium digital assets.

---

## ✨ Features

### Core Platform

#### Icon Generator
- Multi-library icon support (Lucide, Font Awesome, Heroicons, Unicons, Grommet Icons)
- Custom color picker with folder color options
- App icon background shape and color customization
- Simple mode for quick icon creation
- Download gating for free-tier users with signup prompts

#### Content Management System
- **Blog System**: Full-featured blog with rich text editor, categories, tags, and SEO
- **Static Pages**: Create and manage custom pages (Terms, Privacy, etc.)
- **Hero Slider**: Configurable homepage carousel with admin controls
- **Bundles**: Curated icon collections with search and filtering

#### Rich Text Editor
- TipTap-based WYSIWYG editor
- YouTube video embedding with bubble menu controls
- Image upload with alignment options
- Link editing with title and text customization
- Emoji picker and mention support
- Slash commands for quick insertions
- Typography plugin integration

---

### Authentication & Users

#### Multi-Provider Auth (Firebase)
- Email/Password authentication with email verification
- Magic Link (passwordless) sign-in
- Google Sign-in
- Account linking for multiple providers

#### User Management
- Profile editing with avatar upload
- Password change functionality
- Account deletion with subscription checks
- Admin role-based access control

#### Email Verification Flow
- Activation email on signup
- Resend verification capability
- Admin visibility of pending activations
- Checkout restrictions for unverified accounts

---

### Monetization (Stripe)

#### Subscription Plans
- Monthly and Annual subscriptions
- Lifetime one-time purchase option
- Limited quantity plans with availability tracking
- Sold count tracking and UI filtering

#### Stripe Integration
- Webhook handling for subscription events
- Customer portal integration
- Invoice fetching and PDF downloads
- Automatic subscription sync via API
- Product/price creation from admin panel
- Stripe product synchronization with status modal

#### Billing Features
- Transaction history (subscriptions vs one-time payments)
- Renewal date tracking with progress UI
- Subscription cancellation flow
- Customer ID fallback by email

---

### Admin Dashboard

#### User Management
- List, search, and filter users
- View user details and subscription status
- Manage roles (free, pro, lifetime, admin)
- Password reset initiation
- Account enable/disable controls

#### Content Management
- Blog post editor with draft/publish workflow
- Page management with search and pagination
- Category and tag management with autocomplete
- Hero slider configuration
- Bundle management

#### Site Configuration
- Site identity (name, logo, favicon)
- SEO settings (meta descriptions, OpenGraph)
- Tracking codes (Google Analytics, Microsoft Clarity, AdSense)
- Social media links
- Favicon auto-generation from single source image

#### Monetization Management
- Plan CRUD operations
- Stripe sync with product import
- Ad settings configuration
- Marketing feature display

---

### Security

#### Authentication & Authorization
- Firebase Admin SDK token verification
- Custom admin claims checking
- Rate limiting on auth endpoints (10 req/min)
- Forced ID token refresh for admin requests

#### Content Security
- Comprehensive CSP with whitelisted domains
- HTML sanitization (sanitize-html library)
- Iframe source restrictions (YouTube, Vimeo only)
- XSS protection headers

#### Security Headers (via proxy.ts)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production)
- Content Security Policy

#### Logging
- Pino logger for server-side (structured JSON in production)
- Console logger for client-side (development only)
- No sensitive data in logs

---

### UI/UX Improvements

#### Design
- Glassmorphic/neumorphic UI design
- Video backgrounds on login/signup pages
- Toast notifications (replacing native alerts)
- Responsive mobile-first design

#### Navigation
- Authenticated user dropdown in navbar
- Admin sidebar with organized sections
- Footer component on all public pages

#### Performance
- IndexedDB for generator state persistence
- Lazy loading for heavy components
- Image optimization via Next.js

---

### Developer Experience

#### Architecture
- Next.js 16 App Router
- Firebase (Auth, Firestore, Storage)
- Stripe for payments
- TypeScript throughout

#### Database Abstraction
- Firebase Admin adapter for server-side
- Firestore adapter for client-side
- Local JSON adapter for development

#### Storage Abstraction
- Firebase Storage adapter
- Local filesystem adapter
- UUID-based unique filenames

---

## 🔧 Technical Changes

- Complete migration from Python to Next.js
- Removal of legacy Python codebase
- Vercel Analytics integration
- Staging environment with basic auth
- Environment-based configuration
- Renamed middleware to proxy for Next.js 16 compatibility

---

## 📚 Documentation

- Comprehensive README with setup guides
- Firebase Admin SDK setup instructions
- Stripe webhook configuration guide
- Environment variables reference
- Project structure overview
- Links to official documentation (Firebase, Stripe, Vercel)

---

## 🐛 Bug Fixes

- Fixed Stripe subscription `current_period_end` access
- Fixed admin batching logic
- Fixed user list initialization
- Fixed Firebase admin app initialization checks
- Set default login mode to password

---

## ⚠️ Breaking Changes

- Complete platform rewrite (Python → Next.js)
- New environment variables required
- Firebase project required for authentication
- Stripe account required for monetization

---

## 📦 Dependencies Added

- Next.js 16
- Firebase (Auth, Firestore, Storage, Admin)
- Stripe
- TipTap (rich text editor)
- sanitize-html
- pino / pino-pretty (logging)
- @tailwindcss/typography

---

## 🔗 Links

- **Live Site**: [hdpick.com](https://hdpick.com)
- **Repository**: [GitHub](https://github.com/shariati/OS-Folder-Icons)
- **Documentation**: See README.md

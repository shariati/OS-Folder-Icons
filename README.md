# OS Folder Icons

Custom OS Folder Icons is a web application designed to help users customize their digital workspace with premium, handcrafted folder icons for macOS, Windows, and Linux.

## Features

- **Icon Generator**: Create custom folder icons with various colors and styles.
- **Multi-Library Support**: Choose icons from Lucide, Font Awesome, Heroicons, Unicons, and Grommet Icons.
- **Bundles**: Browse and download curated collections of folder icons (Gaming, Finance, Office, etc.).
- **Admin Panel**: Manage categories, tags, bundles, and the hero slider.
- **Responsive Design**: Modern, glassmorphic UI that works on all devices.

## Project Structure

```
src/
├── app/                # Next.js App Router pages and API routes
│   ├── api/            # Backend API routes (admin, upload, etc.)
│   ├── bundles/        # Bundle details pages
│   ├── create/         # Icon generator page
│   └── page.tsx        # Home page
├── components/         # Reusable React components
│   ├── AdminDashboard  # Admin panel components
│   ├── HeroSlider      # Home page hero slider
│   └── ...
├── data/               # JSON database (db.json)
├── lib/                # Utility functions and types
└── ...
```

## Configuration & Environment

To run this project, you need to configure environment variables.

1.  **Create Environment File**:
    Copy the `env.example` file to a new file named `.env.local` in the root directory.

    ```bash
    cp env.example .env.local
    ```

2.  **Configure Variables**:
    Open `.env.local` and fill in the values.

    | Variable | Description | Where to find |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_APP_ENV` | The environment mode (`local`, `test`, `production`). | Set to `local` for development. |
    | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key. | Firebase Console > Project Settings. |
    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain. | Firebase Console > Project Settings. |
    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID. | Firebase Console > Project Settings. |
    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket. | Firebase Console > Storage. |
    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID. | Firebase Console > Project Settings. |
    | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID. | Firebase Console > Project Settings. |

    > **Note**: Firebase configuration is required for authentication and storage features. If you don't have a Firebase project, create one at [console.firebase.google.com](https://console.firebase.google.com/).

## Running the Project

### 1. Development Mode
Run the application in development mode with hot-reloading.

```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### 2. Local Production Mode
To test the production build locally:

1.  Build the application:
    ```bash
    npm run build
    # or
    yarn build
    ```

2.  Start the production server:
    ```bash
    npm run start
    # or
    yarn start
    ```
Open [http://localhost:3000](http://localhost:3000) to view the optimized application.

### 3. Production Deployment
This is a Next.js application, which can be easily deployed to Vercel, Netlify, or any Node.js hosting.

**Vercel (Recommended):**
1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Add the environment variables (from your `.env.local`) in the Vercel project settings.
4.  Deploy.

**Manual Deployment:**
1.  Configure environment variables on your server.
2.  Run `npm run build`.
3.  Run `npm run start` (use a process manager like PM2 for persistence).

## Licensing & Legal

**This project is "Source Available" software.** It is NOT "Open Source" in the strict OSI definition because it contains restrictions on commercial use.

### 1. Personal & Educational Use (Free)
You are free to:
- Read, study, and modify the source code.
- Run the application on your local machine for personal use.
- Use the code for educational purposes.

### 2. Commercial Use (Restricted)
**Commercial use is STRICTLY PROHIBITED without a license.**
If you intend to use this source code (or any modified version of it) for a commercial product, service, or business:
- You **MUST** obtain written consent from the author (Amin Shariati).
- You **MUST** pay a monthly royalty fee.
- Please raise your interest by starting a discussion in the **"💰 Commercial Use Requests"** category:
  [https://github.com/shariati/OS-Folder-Icons/discussions/155](https://github.com/shariati/OS-Folder-Icons/discussions/155)

### 3. Restricted Assets
Certain media files in this repository (specifically in `public/backgrounds/`) are licensed **exclusively** for the official `hdpick.com` deployment.
- These files are **NOT** covered by the general license.
- You may **NOT** redistribute, modify, or use these assets in any other project without purchasing a separate license from the original creator.
- See [licenses/README.md](licenses/README.md) for details.

## Deployment

This project is designed to be deployed on **Vercel**.

### Prerequisites
- A Vercel account.
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### Environment Variables
You need to configure the following Environment Variables in your Vercel Project Settings for both **Production** and **Preview** (Staging) environments.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_APP_ENV` | Environment: `production`, `test` (staging), or `local` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Client Email (for server-side) |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Private Key (for server-side) |
| `STAGING_USER` | Username for Staging Basic Auth (e.g., `admin`) |
| `STAGING_PASSWORD` | Password for Staging Basic Auth |

### Staging Environment Setup
To set up the Staging environment (`test.hdpick.com`) with Basic Authentication and SEO blocking:

1.  **Connect Domain**: In Vercel, go to **Settings > Domains**.
    - Add `test.hdpick.com`.
    - Assign it to your staging branch (e.g., `staging` or `develop`).
2.  **Configure Env Vars**: 
    -   Ensure `STAGING_USER` and `STAGING_PASSWORD` are set for the **Preview** environment.
    -   Set `NEXT_PUBLIC_APP_ENV` to `test`.
3.  **Deploy**: Push to your staging branch. Vercel will deploy to `test.hdpick.com`. The middleware will automatically detect the hostname and apply Basic Auth and `noindex` headers.

### Production Environment Setup
To set up the Production environment (`www.hdpick.com`):

1.  **Connect Domain**: In Vercel, go to **Settings > Domains**.
    - Add `www.hdpick.com`.
    - Assign it to your main branch (e.g., `main`).
2.  **Configure Env Vars**: Set `NEXT_PUBLIC_APP_ENV` to `production`.
3.  **Deploy**: Push to your main branch. Vercel will deploy to `www.hdpick.com`. The middleware will allow public access and indexing.
- **Official Deployment**: [hdpick.com](https://hdpick.com) (Commercial, Ad-supported).
- **Public Repository**: [GitHub](https://github.com/shariati/OS-Folder-Icons) (Source Available for transparency and education).

### Legal Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

## Connect

- **LinkedIn**: [Amin Shariati](https://www.linkedin.com/in/aminshariati)
- **GitHub**: [OS-Folder-Icons](https://github.com/shariati/OS-Folder-Icons)
- **Discussions**: [GitHub Discussions](https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a)
- **Medium**: [@shariati](https://medium.com/@shariati)

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

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

### 4. Deployment
- **Official Deployment**: [hdpick.com](https://hdpick.com) (Commercial, Ad-supported).
- **Public Repository**: [GitHub](https://github.com/shariati/OS-Folder-Icons) (Source Available for transparency and education).

### Legal Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

## Connect

- **LinkedIn**: [Amin Shariati](https://www.linkedin.com/in/aminshariati)
- **GitHub**: [OS-Folder-Icons](https://github.com/shariati/OS-Folder-Icons)
- **Discussions**: [GitHub Discussions](https://github.com/shariati/OS-Folder-Icons/discussions/categories/q-a)
- **Medium**: [@shariati](https://medium.com/@shariati)

# OS Folder Icons

Custom OS Folder Icons is a web application designed to help users customize their digital workspace with premium, handcrafted folder icons for macOS, Windows, and Linux.

## Features

- **Icon Generator**: Create custom folder icons with various colors and styles.
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

## Licensing

This project is open-source, but **not all elements are free for unrestricted distribution**.

### Code License
The source code is available for use, modification, and distribution, provided that you:
1.  **Give Credit**: You must credit **Amin Shariati** as the original author and link back to the [original repository](https://github.com/shariati/OS-Folder-Icons).
2.  **Contribute Back**: Improvements and bug fixes are encouraged via pull requests.

### Asset Exclusions
**Important**: Certain assets, such as video backgrounds in `public/backgrounds/video/`, are **EXCLUDED** from the open-source license. These assets are licensed exclusively for this repository and **cannot be redistributed** without purchasing a separate license.

Please read the full [LICENSE.md](LICENSE.md) file for detailed terms and conditions before using or forking this project.

## Connect

- **LinkedIn**: [Amin Shariati](https://www.linkedin.com/in/aminshariati)
- **GitHub**: [OS-Folder-Icons](https://github.com/shariati/OS-Folder-Icons)
- **Medium**: [@shariati](https://medium.com/@shariati)

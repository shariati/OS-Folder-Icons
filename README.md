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

This project is open-source and available under the [MIT License](LICENSE). You are free to use, modify, and distribute this software.

## Connect

- **LinkedIn**: [Amin Shariati](https://www.linkedin.com/in/aminshariati)
- **GitHub**: [OS-Folder-Icons](https://github.com/shariati/OS-Folder-Icons)
- **Medium**: [@shariati](https://medium.com/@shariati)

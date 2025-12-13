import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/layout/Footer';
import { getPages } from '@/lib/db';
import { sanitizeHtmlWithLinks } from '@/lib/sanitize';

// Reserved slugs that should not be matched by this dynamic route
const RESERVED_SLUGS = [
  'blog',
  'admin',
  'login',
  'signup',
  'profile',
  'create',
  'photo-frame',
  'privacy',
  'terms',
  'bundles',
  'api',
];

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Check for reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return {};
  }

  const pages = await getPages();
  const page = pages.find((p) => p.slug === slug);

  if (!page || page.status !== 'published') {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || '',
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || '',
      type: 'website',
      images: page.coverImage ? [{ url: page.coverImage }] : [],
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Check for reserved slugs - let Next.js handle those routes
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  const pages = await getPages();

  const page = pages.find((p) => p.slug === slug);

  if (!page || page.status !== 'published') {
    notFound();
  }

  const sanitizedContent = sanitizeHtmlWithLinks(page.content);

  return (
    <>
      <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
        {/* Page Header */}
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl dark:text-white">
            {page.title}
          </h1>
        </div>

        {/* Cover Image */}
        {page.coverImage && (
          <div className="mx-auto mb-12 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative h-[400px] w-full overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={page.coverImage}
                alt={page.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Page Content */}
        <article className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>
      </div>
      <Footer />
    </>
  );
}

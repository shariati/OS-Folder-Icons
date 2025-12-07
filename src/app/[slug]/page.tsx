import { getPages } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { sanitizeHtmlWithLinks } from '@/lib/sanitize';

// Reserved slugs that should not be matched by this dynamic route
const RESERVED_SLUGS = [
  'blog', 'admin', 'login', 'signup', 'profile', 
  'create', 'photo-frame', 'privacy', 'terms', 
  'bundles', 'api'
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
  const page = pages.find(p => p.slug === slug);

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
  
  // Debug logging
  console.log('[DEBUG /[slug]] Requested slug:', slug);
  console.log('[DEBUG /[slug]] Total pages fetched:', pages.length);
  console.log('[DEBUG /[slug]] All slugs:', pages.map(p => p.slug));
  
  const page = pages.find(p => p.slug === slug);
  
  console.log('[DEBUG /[slug]] Found page:', page ? { id: page.id, title: page.title, status: page.status, slug: page.slug } : 'NOT FOUND');

  if (!page || page.status !== 'published') {
    console.log('[DEBUG /[slug]] Returning 404 - reason:', !page ? 'page not found' : `status is ${page.status}`);
    notFound();
  }

  const sanitizedContent = sanitizeHtmlWithLinks(page.content);

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {page.title}
        </h1>
      </div>

      {/* Cover Image */}
      {page.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl">
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
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-blue-600 dark:prose-code:text-blue-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800
            prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
            prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>
    </div>
  );
}

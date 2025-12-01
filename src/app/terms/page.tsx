import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export default async function TermsPage() {
  const termsPath = path.join(process.cwd(), 'TERMS.md');
  const content = fs.readFileSync(termsPath, 'utf8');

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl neu-flat">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}

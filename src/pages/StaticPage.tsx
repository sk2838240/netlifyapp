import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Content } from '../../types';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        setPage(res.data);
        if (res.data?.metadata?.seo) {
          const seo = res.data.metadata.seo;
          if (seo.meta_title) document.title = seo.meta_title;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (!page) return <div className="py-20 text-center"><h2>Page not found</h2></div>;

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-8 text-center">{page.metadata?.seo?.h1 || page.title}</h1>
          {page.image && <img src={page.image} alt={page.title} className="w-full rounded-xl mb-8 shadow-lg" />}
          <div
            className="prose max-w-none"
            style={{ fontSize: 'var(--paragraph-size)', lineHeight: 'var(--paragraph-line-height)' }}
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </motion.div>
      </div>
    </div>
  );
}

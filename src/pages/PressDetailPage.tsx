import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Content } from '../../types';

export default function PressDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${slug}`)
      .then((r) => r.json())
      .then((res) => setItem(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (!item) return <div className="py-20 text-center"><h2>Not found</h2><Link to="/press" className="mt-4 inline-block" style={{ color: 'var(--primary-color)' }}>Back to Press</Link></div>;

  return (
    <article className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/press" className="inline-flex items-center gap-2 mb-8 text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Press
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs flex items-center gap-1" style={{ opacity: 0.5 }}>
              <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="mb-6">{item.metadata?.seo?.h1 || item.title}</h1>
          {item.image && <img src={item.image} alt={item.title} className="w-full rounded-xl mb-8 shadow-lg" />}
          <div className="prose max-w-none" style={{ fontSize: 'var(--paragraph-size)' }} dangerouslySetInnerHTML={{ __html: item.body }} />
        </motion.div>
      </div>
    </article>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import { Content } from '../../types';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        setBlog(res.data);
        if (res.data?.metadata?.seo) {
          const seo = res.data.metadata.seo;
          if (seo.meta_title) document.title = seo.meta_title;
          if (seo.meta_description) {
            let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
            if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
            meta.content = seo.meta_description;
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (!blog) return <div className="py-20 text-center"><h2>Post not found</h2><Link to="/blog" className="mt-4 inline-block" style={{ color: 'var(--primary-color)' }}>Back to Blog</Link></div>;

  return (
    <article className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 mb-8 text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            {blog.categories?.map((cat) => (
              <span key={cat} className="text-xs font-semibold px-2 py-1 rounded text-white" style={{ background: 'var(--primary-color)' }}>
                {cat}
              </span>
            ))}
            <span className="text-xs flex items-center gap-1" style={{ opacity: 0.5 }}>
              <Calendar className="w-3 h-3" />
              {new Date(blog.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="mb-6">{blog.metadata?.seo?.h1 || blog.title}</h1>

          {blog.image && (
            <img src={blog.image} alt={blog.title} className="w-full rounded-xl mb-8 shadow-lg" style={{ borderRadius: 'var(--border-radius)' }} />
          )}

          <div
            className="prose max-w-none"
            style={{ fontSize: 'var(--paragraph-size)', lineHeight: 'var(--paragraph-line-height)' }}
            dangerouslySetInnerHTML={{ __html: blog.body }}
          />

          {blog.tags?.length > 0 && (
            <div className="mt-12 pt-8 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
              <Tag className="w-4 h-4" style={{ opacity: 0.5 }} />
              {blog.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: '#f3f4f6', color: 'var(--text-color)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </article>
  );
}

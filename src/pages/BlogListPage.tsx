import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Content } from '../../types';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?type=blog')
      .then((r) => r.json())
      .then((res) => setBlogs((res.data || []).filter((c: Content) => c.status === 'published')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="mb-4">Blog</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ opacity: 0.7 }}>
            Insights, updates, and stories from our team.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ opacity: 0.5 }}>No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blog/${blog.slug}`} className="card block group h-full">
                  {blog.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {blog.categories?.[0] && (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{ background: 'var(--primary-color)', color: 'white', opacity: 0.9 }}
                        >
                          {blog.categories[0]}
                        </span>
                      )}
                      <span className="text-xs flex items-center gap-1" style={{ opacity: 0.5 }}>
                        <Calendar className="w-3 h-3" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-sm mb-4" style={{ opacity: 0.7 }}>
                        {blog.excerpt}
                      </p>
                    )}
                    <span
                      className="text-sm font-medium inline-flex items-center gap-1"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar } from 'lucide-react';
import { Content } from '../types';

export default function PressListPage() {
  const [press, setPress] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content?type=press')
      .then((r) => r.json())
      .then((res) => setPress((res.data || []).filter((c: Content) => c.status === 'published')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="mb-4">Press & Media</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ opacity: 0.7 }}>Latest news and media coverage.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>
        ) : press.length === 0 ? (
          <div className="text-center py-16"><p style={{ opacity: 0.5 }}>No press releases yet.</p></div>
        ) : (
          <div className="space-y-6">
            {press.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link
                  to={item.metadata?.external_url || `/press/${item.slug}`}
                  target={item.metadata?.external_url ? '_blank' : undefined}
                  className="card block p-6 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs flex items-center gap-1" style={{ opacity: 0.5 }}>
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.metadata?.external_url && <ExternalLink className="w-3 h-3" style={{ opacity: 0.5 }} />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      {item.excerpt && <p className="text-sm" style={{ opacity: 0.7 }}>{item.excerpt}</p>}
                    </div>
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

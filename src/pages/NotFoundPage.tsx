import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="text-8xl sm:text-9xl font-black mb-4 gradient-text select-none">404</div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Page Not Found</h2>
        <p className="text-lg mb-10 max-w-md mx-auto" style={{ opacity: 0.6 }}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/blog" className="btn-outline">
            <ArrowLeft className="w-4 h-4" /> Browse Blog
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header with locale toggle space */}
      <header className="flex items-center justify-end p-6">
        <a href="/" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          ← Back to website
        </a>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[552px]"
        >
          {/* Logo and Title - Strapi exact */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded shadow-sm flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[32px] font-bold text-neutral-800">Welcome!</h1>
            <p className="text-sm text-neutral-500 mt-1">Log in to your CMS admin panel</p>
          </div>

          {/* Login Card - Strapi exact */}
          <div className="bg-white rounded shadow-sm border border-neutral-300 p-8 sm:p-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger-100 border border-danger-200 text-danger-600 text-sm font-medium rounded p-3 mb-6 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-danger-600 rounded-full flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Email <span className="text-danger-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 transition-all"
                  placeholder="kai@doe.com"
                  required
                  autoFocus
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Password <span className="text-danger-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-white border border-neutral-300 rounded text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button - Strapi exact style */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-400">
              Demo credentials:{' '}
              <code className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-600">admin@cms.local</code>
              {' / '}
              <code className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-600">admin123</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
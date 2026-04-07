import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f6f6f9] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-end p-6">
        <a href="/" className="text-[13px] font-medium text-[#4945ff] hover:text-[#3d3adb] transition-colors">
          ← Back to website
        </a>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[552px]"
        >
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 bg-[#4945ff] rounded-[8px] flex items-center justify-center mb-4 shadow-[0_1px_4px_rgba(73,69,255,0.3)]">
              <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-[28px] font-bold text-[#32324d]">Welcome!</h1>
            <p className="text-sm text-[#666687] mt-1">Log in to your CMS admin panel</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[4px] shadow-[0_1px_4px_rgba(33,33,52,0.1)] border border-[#dcdce4] p-8 sm:p-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#fcecea] border border-[#f5c0b8] text-[#d02b20] text-[13px] font-medium rounded-[4px] p-3 mb-6 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-[#d02b20] rounded-full flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#32324d] mb-1.5">
                  Email <span className="text-[#d02b20]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#dcdce4] rounded-[4px] text-sm text-[#32324d] placeholder-[#a5a5ba] focus:outline-none focus:border-[#4945ff] focus:ring-2 focus:ring-[#4945ff]/10 transition-all"
                    placeholder="admin@cms.local"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#32324d] mb-1.5">
                  Password <span className="text-[#d02b20]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-white border border-[#dcdce4] rounded-[4px] text-sm text-[#32324d] placeholder-[#a5a5ba] focus:outline-none focus:border-[#4945ff] focus:ring-2 focus:ring-[#4945ff]/10 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#a5a5ba] hover:text-[#666687] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#4945ff] hover:bg-[#3d3adb] text-white text-sm font-semibold rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <p className="text-[11px] text-[#a5a5ba]">
              Demo credentials:{' '}
              <code className="font-mono bg-[#eaeaef] px-1.5 py-0.5 rounded-[2px] text-[#32324d]">admin@cms.local</code>
              {' / '}
              <code className="font-mono bg-[#eaeaef] px-1.5 py-0.5 rounded-[2px] text-[#32324d]">admin123</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

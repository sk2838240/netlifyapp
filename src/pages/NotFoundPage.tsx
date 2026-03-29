import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="mb-8" style={{ opacity: 0.6 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}

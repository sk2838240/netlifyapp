import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Search, Plus } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Tab {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export default function PageHeader({ 
  title, 
  subtitle,
  description, 
  breadcrumbs, 
  actions,
  actionLabel,
  onAction,
  searchValue,
  onSearchChange,
  tabs,
  activeTab,
  onTabChange
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-gray-500">{subtitle}</p>
            )}
            {description && (
              <p className="mt-1 text-gray-500">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        {(searchValue !== undefined || tabs) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {searchValue !== undefined && onSearchChange && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            {tabs && onTabChange && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

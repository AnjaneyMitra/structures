import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentDuplicateIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface CodeTemplate {
  id: number;
  user_id: number;
  username: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string | null;
  is_public: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  usage_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

const CodeTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchLanguages();
  }, [selectedLanguage]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...(selectedLanguage && { language: selectedLanguage }),
        limit: '20'
      });

      const response = await fetch(`/api/snippets/templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/snippets/languages/popular');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.map((item: any) => item.language));
      }
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  };

  const copyToClipboard = async (code: string, templateId: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(templateId);
      
      // Track usage
      const token = localStorage.getItem('token');
      await fetch(`/api/snippets/${templateId}/use`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update usage count in UI
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, usage_count: template.usage_count + 1 }
          : template
      ));

      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-500',
      python: 'bg-blue-500',
      java: 'bg-red-500',
      cpp: 'bg-purple-500',
      typescript: 'bg-blue-600',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500',
    };
    return colors[language.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Code Templates</h1>
            <p className="text-muted-foreground">
              Ready-to-use algorithm templates and common patterns
            </p>
          </div>
          <Link
            to="/snippets"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            View All Snippets
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-card border border-border rounded-lg p-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Filter by language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {template.title}
                      </h3>
                      {template.is_featured && (
                        <SparklesIcon className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    
                    {template.description && (
                      <p className="text-muted-foreground mb-3">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getLanguageColor(template.language)}`}>
                        {template.language}
                      </span>
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>{template.usage_count} uses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{template.view_count} views</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(template.code, template.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copiedId === template.id
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    {copiedId === template.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-6 bg-muted/30">
                <div className="relative">
                  <pre className="text-sm text-foreground overflow-x-auto max-h-64 font-mono bg-background border border-border rounded-lg p-4">
                    <code>{template.code}</code>
                  </pre>
                  
                  {/* Fade overlay for long code */}
                  {template.code.length > 500 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-lg"></div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 flex items-center justify-between border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{template.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTimeAgo(template.created_at)}</span>
                  </div>
                </div>

                <Link
                  to={`/snippets/${template.id}`}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedLanguage 
                ? `No templates available for ${selectedLanguage}.`
                : 'No code templates are available yet.'
              }
            </p>
            <Link
              to="/snippets/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Template
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-4">Error loading templates</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={fetchTemplates}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeTemplatesPage;
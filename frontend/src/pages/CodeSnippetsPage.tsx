import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackendStatusBanner from '../components/BackendStatusBanner';
import apiClient from '../utils/apiClient';
import { 
  CodeBracketIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Enhanced error handling for API responses - ensures proper JSON handling
interface CodeSnippet {
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
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

const CodeSnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'public' | 'my'>('public');
  const [languages, setLanguages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
    fetchLanguages();
    fetchCategories();
  }, [viewMode, selectedLanguage, selectedCategory, sortBy]);

  const fetchSnippets = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedLanguage && { language: selectedLanguage }),
        ...(selectedCategory && { category: selectedCategory }),
        sort_by: sortBy,
        sort_order: 'desc',
        limit: '20'
      });

      const endpoint = viewMode === 'my' ? '/api/snippets/my' : '/api/snippets/public';
      const response = await apiClient.get(`${endpoint}?${params}`);

      setSnippets(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await apiClient.get('/api/snippets/languages/popular');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setLanguages(response.data.map((item: any) => item.language));
      } else {
        console.warn('Languages API returned empty array, using fallback');
        setLanguages(['python', 'javascript', 'java', 'cpp', 'typescript']);
      }
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      // Fallback to common languages if API fails
      setLanguages(['python', 'javascript', 'java', 'cpp', 'typescript']);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/snippets/categories');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCategories(response.data.map((item: any) => item.category));
      } else {
        console.warn('Categories API returned empty array, using fallback');
        setCategories(['template', 'utility', 'algorithm']);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback to common categories if API fails
      setCategories(['template', 'utility', 'algorithm']);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSnippets();
      return;
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedLanguage && { language: selectedLanguage }),
        ...(selectedCategory && { category: selectedCategory }),
        public_only: viewMode === 'public' ? 'true' : 'false'
      });

      const response = await apiClient.get(`/api/snippets/search?${params}`);
      setSnippets(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const toggleLike = async (snippetId: number) => {
    try {
      const response = await apiClient.post(`/api/snippets/${snippetId}/like`);
      const result = response.data;
      setSnippets(snippets.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, is_liked: result.is_liked, like_count: result.like_count }
          : snippet
      ));
    } catch (err) {
      console.error('Failed to toggle like:', err);
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
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
        <BackendStatusBanner />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Code Snippets</h1>
            <p className="text-muted-foreground">
              Discover, share, and reuse code snippets from the community
            </p>
          </div>
          <button
            onClick={() => navigate('/snippets/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Snippet
          </button>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setViewMode('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'public'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Public Snippets
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'my'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              My Snippets
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
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

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="created_at">Newest</option>
              <option value="updated_at">Recently Updated</option>
              <option value="like_count">Most Liked</option>
              <option value="view_count">Most Viewed</option>
              <option value="usage_count">Most Used</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <Link
                    to={`/snippets/${snippet.id}`}
                    className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {snippet.title}
                  </Link>
                  {snippet.is_featured && (
                    <SparklesIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 ml-2" />
                  )}
                </div>
                
                {snippet.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {snippet.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getLanguageColor(snippet.language)}`}>
                    {snippet.language}
                  </span>
                  {snippet.tags && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TagIcon className="h-3 w-3" />
                      <span className="truncate">{snippet.tags}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-4 bg-muted/30">
                <pre className="text-xs text-foreground overflow-hidden line-clamp-4 font-mono">
                  <code>{snippet.code}</code>
                </pre>
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{snippet.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{snippet.view_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(snippet.created_at)}
                  </span>
                  {viewMode === 'public' && (
                    <button
                      onClick={() => toggleLike(snippet.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      {snippet.is_liked ? (
                        <HeartSolidIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                      <span>{snippet.like_count}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {snippets.length === 0 && !loading && (
          <div className="text-center py-12">
            <CodeBracketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {viewMode === 'my' ? 'No snippets yet' : 'No snippets found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {viewMode === 'my' 
                ? 'Create your first code snippet to get started.'
                : 'Try adjusting your search criteria or create a new snippet.'
              }
            </p>
            <button
              onClick={() => navigate('/snippets/new')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Snippet
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-4">Error loading snippets</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={fetchSnippets}
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

export default CodeSnippetsPage;
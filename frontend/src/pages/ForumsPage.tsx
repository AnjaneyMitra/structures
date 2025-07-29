import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackendStatusBanner from '../components/BackendStatusBanner';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  order: number;
  thread_count: number;
  latest_thread: {
    id: number;
    title: string;
    author: string;
    updated_at: string;
  } | null;
  created_at: string;
}

const ForumsPage: React.FC = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/forums/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch categories';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}. Make sure the backend server is running.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">Error loading forums</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <BackendStatusBanner />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Discussion Forums</h1>
            <p className="text-muted-foreground">
              Connect with the community, ask questions, and share knowledge
            </p>
          </div>
          <button
            onClick={() => navigate('/forums/new-thread')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Thread
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/forums/category/${category.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span>{category.thread_count} threads</span>
                    </div>
                  </div>
                </div>

                {/* Latest Thread */}
                {category.latest_thread && (
                  <div className="ml-6 text-right min-w-0 flex-shrink-0">
                    <div className="text-sm font-medium text-foreground mb-1 truncate max-w-48">
                      {category.latest_thread.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserIcon className="h-3 w-3" />
                      <span>{category.latest_thread.author}</span>
                      <ClockIcon className="h-3 w-3 ml-2" />
                      <span>{formatTimeAgo(category.latest_thread.updated_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
            <p className="text-muted-foreground">
              Forum categories will appear here once they're created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumsPage;
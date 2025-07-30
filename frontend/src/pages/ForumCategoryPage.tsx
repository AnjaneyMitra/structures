import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { MapPinIcon, LockClosedIcon } from '@heroicons/react/24/solid';

interface ForumThread {
  id: number;
  category_id: number;
  problem_id: number | null;
  author_id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
  };
  category: {
    id: number;
    name: string;
  };
  problem: {
    id: number;
    title: string;
  } | null;
}

interface CategoryData {
  threads: ForumThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  category: {
    id: number;
    name: string;
    description: string;
  };
}

const ForumCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('updated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (categoryId) {
      fetchThreads();
    }
  }, [categoryId, sortBy, sortOrder, page]);

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/forums/categories/${categoryId}/threads?page=${page}&sort=${sortBy}&order=${sortOrder}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch threads';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } else {
          console.warn('Forums threads API returned non-JSON response');
          errorMessage = `HTTP ${response.status}: ${response.statusText}. Make sure the backend server is running.`;
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        setData(result);
      } else {
        console.warn('Forums threads API returned non-JSON response');
        setData(null);
      }
    } catch (err) {
      console.error('Forums threads fetch error:', err);
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

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">Error loading threads</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={fetchThreads}
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/forums')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{data.category.name}</h1>
            <p className="text-muted-foreground">{data.category.description}</p>
          </div>
          <button
            onClick={() => navigate(`/forums/category/${categoryId}/new-thread`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Thread
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
          <span className="text-sm font-medium text-foreground">Sort by:</span>
          <div className="flex gap-2">
            {[
              { key: 'updated', label: 'Last Updated' },
              { key: 'created', label: 'Created' },
              { key: 'replies', label: 'Replies' },
              { key: 'views', label: 'Views' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                  sortBy === option.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {option.label}
                {sortBy === option.key && (
                  sortOrder === 'desc' ? 
                    <ChevronDownIcon className="h-3 w-3" /> : 
                    <ChevronUpIcon className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-2">
          {data.threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/forums/thread/${thread.id}`}
              className="block bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Thread Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.is_pinned && (
                      <MapPinIcon className="h-4 w-4 text-primary" />
                    )}
                    {thread.is_locked && (
                      <LockClosedIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {thread.title}
                    </h3>
                  </div>
                  
                  {thread.problem && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Related to: <span className="text-primary">{thread.problem.title}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{thread.author.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatTimeAgo(thread.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{thread.reply_count}</div>
                    <div className="text-xs">replies</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{thread.view_count}</div>
                    <div className="text-xs">views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs">{formatTimeAgo(thread.updated_at)}</div>
                    <div className="text-xs">last activity</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(data.pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.pages}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {data.threads.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No threads yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion in this category.
            </p>
            <button
              onClick={() => navigate(`/forums/category/${categoryId}/new-thread`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create First Thread
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumCategoryPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  HeartIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

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

interface Comment {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const SnippetDetailPage: React.FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>();
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const navigate = useNavigate();
  const { username: currentUsername } = useAuth();

  useEffect(() => {
    if (snippetId) {
      fetchSnippet();
      fetchComments();
    }
  }, [snippetId]);

  const fetchSnippet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/snippets/${snippetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch snippet');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setSnippet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/snippets/${snippetId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error('Comments API error:', response.status, response.statusText);
        // Only try to parse as JSON if it's actually JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const copyToClipboard = async () => {
    if (!snippet) return;
    
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      
      // Track usage
      const token = localStorage.getItem('token');
      await fetch(`/api/snippets/${snippet.id}/use`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleLike = async () => {
    if (!snippet) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/snippets/${snippet.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSnippet({
          ...snippet,
          is_liked: result.is_liked,
          like_count: result.like_count
        });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !snippet) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/snippets/${snippet.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteSnippet = async () => {
    if (!snippet || !window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/snippets/${snippet.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/snippets');
      }
    } catch (err) {
      console.error('Failed to delete snippet:', err);
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">Error loading snippet</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={() => navigate('/snippets')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Snippets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUsername === snippet.username;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/snippets')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-muted-foreground mt-2">{snippet.description}</p>
            )}
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/snippets/${snippet.id}/edit`)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Edit snippet"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={deleteSnippet}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete snippet"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>{snippet.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>{formatTimeAgo(snippet.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            <span>{snippet.view_count} views</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getLanguageColor(snippet.language)}`}>
            {snippet.language}
          </span>
          {snippet.tags && (
            <div className="flex items-center gap-1">
              <TagIcon className="h-4 w-4" />
              <span>{snippet.tags}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          
          {!isOwner && (
            <button
              onClick={toggleLike}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
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

        {/* Code */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{snippet.language}</span>
              <button
                onClick={copyToClipboard}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm text-foreground font-mono">
              <code>{snippet.code}</code>
            </pre>
          </div>
        </div>

        {/* Comments Section */}
        {snippet.is_public && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{comment.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetDetailPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ClockIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PinIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

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

interface ForumReply {
  id: number;
  thread_id: number;
  author_id: number;
  content: string;
  parent_id: number | null;
  is_solution: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
  };
  user_vote: string | null;
}

interface ThreadData {
  thread: ForumThread;
  replies: ForumReply[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ForumThreadPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [data, setData] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId, page]);

  const fetchThread = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forums/threads/${threadId}?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async () => {
    if (!newReply.trim() || !data) return;

    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forums/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReply }),
      });

      if (response.ok) {
        setNewReply('');
        fetchThread(); // Refresh to show new reply
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const voteReply = async (replyId: number, voteType: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forums/replies/${replyId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update the reply in the UI
        if (data) {
          const updatedReplies = data.replies.map(reply => 
            reply.id === replyId 
              ? { ...reply, upvotes: result.upvotes, downvotes: result.downvotes }
              : reply
          );
          setData({ ...data, replies: updatedReplies });
        }
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const markSolution = async (replyId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forums/replies/${replyId}/solution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchThread(); // Refresh to show solution status
      }
    } catch (err) {
      console.error('Failed to mark solution:', err);
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-muted rounded-lg mb-6"></div>
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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">Error loading thread</div>
            <div className="text-muted-foreground mb-6">{error}</div>
            <button
              onClick={() => navigate('/forums')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Forums
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isThreadAuthor = user?.username === data.thread.author.username;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/forums/category/${data.thread.category_id}`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {data.thread.is_pinned && (
                <PinIcon className="h-5 w-5 text-primary" />
              )}
              {data.thread.is_locked && (
                <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
              )}
              <h1 className="text-3xl font-bold text-foreground">{data.thread.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                to={`/forums/category/${data.thread.category_id}`}
                className="hover:text-primary transition-colors"
              >
                {data.thread.category.name}
              </Link>
              {data.thread.problem && (
                <>
                  <span>•</span>
                  <Link
                    to={`/problems/${data.thread.problem.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {data.thread.problem.title}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Original Post */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                {data.thread.author.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-foreground">{data.thread.author.username}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(data.thread.created_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{data.thread.view_count} views</span>
              <span>{data.thread.reply_count} replies</span>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="whitespace-pre-wrap">{data.thread.content}</p>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          {data.replies.map((reply) => (
            <div key={reply.id} className={`bg-card border rounded-lg p-6 ${
              reply.is_solution ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {reply.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {reply.author.username}
                      {reply.is_solution && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" title="Solution" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(reply.created_at)}
                    </div>
                  </div>
                </div>
                
                {isThreadAuthor && !reply.is_solution && (
                  <button
                    onClick={() => markSolution(reply.id)}
                    className="text-sm text-green-600 hover:text-green-700 transition-colors"
                  >
                    Mark as Solution
                  </button>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none text-foreground mb-4">
                <p className="whitespace-pre-wrap">{reply.content}</p>
              </div>
              
              {/* Vote buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => voteReply(reply.id, 'up')}
                    className={`p-1 rounded transition-colors ${
                      reply.user_vote === 'up' 
                        ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                        : 'text-muted-foreground hover:text-green-600'
                    }`}
                  >
                    <HandThumbUpIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">{reply.upvotes}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => voteReply(reply.id, 'down')}
                    className={`p-1 rounded transition-colors ${
                      reply.user_vote === 'down' 
                        ? 'text-red-600 bg-red-100 dark:bg-red-900/20' 
                        : 'text-muted-foreground hover:text-red-600'
                    }`}
                  >
                    <HandThumbDownIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">{reply.downvotes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
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

        {/* Reply Form */}
        {!data.thread.is_locked && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Reply</h3>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={submitReply}
                disabled={!newReply.trim() || submittingReply}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        )}

        {data.thread.is_locked && (
          <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
            <LockClosedIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">This thread is locked and cannot accept new replies.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumThreadPage;
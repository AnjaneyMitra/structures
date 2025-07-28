import React, { useState, useEffect } from 'react';
import {
  CodeBracketIcon,
  PlusIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import apiClient from '../utils/apiClient';

interface CodeSnippet {
  id: number;
  user_id: number;
  username: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags?: string;
  is_public: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
}

interface SnippetFormData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string;
  is_public: boolean;
}

const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql'
];

const SimpleSnippetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [viewingSnippet, setViewingSnippet] = useState<CodeSnippet | null>(null);

  const [formData, setFormData] = useState<SnippetFormData>({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: '',
    is_public: false
  });

  const tabs = [
    { key: 'public', label: 'Public Snippets', icon: CodeBracketIcon },
    { key: 'my', label: 'My Snippets', icon: UserIcon },
    { key: 'create', label: 'Create Snippet', icon: PlusIcon }
  ];

  useEffect(() => {
    fetchSnippets();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = activeTab === 1 ? '/api/snippets/my' : '/api/snippets';
      const response = await apiClient.get(endpoint);
      setSnippets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      setError('Title and code are required');
      return;
    }

    try {
      await apiClient.post('/api/snippets', formData);
      setSuccess('Snippet created successfully!');
      resetForm();
      setActiveTab(0);
      fetchSnippets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create snippet');
    }
  };

  const handleDeleteSnippet = async (snippetId: number) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      await apiClient.delete(`/api/snippets/${snippetId}`);
      setSuccess('Snippet deleted successfully!');
      fetchSnippets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete snippet');
    }
  };

  const handleViewSnippet = async (snippet: CodeSnippet) => {
    try {
      const response = await apiClient.get(`/api/snippets/${snippet.id}`);
      setViewingSnippet(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load snippet');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      language: 'javascript',
      tags: '',
      is_public: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2 flex items-center">
            <CodeBracketIcon className="h-8 w-8 mr-3 text-primary" />
            Code Snippets
          </h1>
          <p className="text-muted-foreground">
            Share and discover useful code snippets from the community
          </p>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
            <button 
              onClick={() => setSuccess(null)}
              className="float-right text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-destructive hover:text-destructive/80"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border">
            <div className="flex">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(index);
                      setViewingSnippet(null);
                    }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === index
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Public Snippets Tab */}
            {activeTab === 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Public Snippets</h3>
                  <p className="text-sm text-muted-foreground">Browse code snippets shared by the community</p>
                </div>
                
                {snippets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CodeBracketIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No public snippets yet</p>
                    <p className="text-sm">Be the first to share a code snippet!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {snippets.map((snippet) => (
                      <SnippetCard 
                        key={snippet.id} 
                        snippet={snippet} 
                        onView={handleViewSnippet}
                        onDelete={handleDeleteSnippet}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Snippets Tab */}
            {activeTab === 1 && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">My Snippets</h3>
                    <p className="text-sm text-muted-foreground">Manage your personal code snippets</p>
                  </div>
                  <button
                    onClick={() => setActiveTab(2)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Create Snippet</span>
                  </button>
                </div>
                
                {snippets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CodeBracketIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No snippets created yet</p>
                    <p className="text-sm">Create your first code snippet to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {snippets.map((snippet) => (
                      <SnippetCard 
                        key={snippet.id} 
                        snippet={snippet} 
                        onView={handleViewSnippet}
                        onDelete={handleDeleteSnippet}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Snippet Tab */}
            {activeTab === 2 && (
              <CreateSnippetForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateSnippet}
                onCancel={() => {
                  resetForm();
                  setActiveTab(0);
                }}
              />
            )}
          </div>
        </div>

        {/* View Snippet Modal */}
        {viewingSnippet && (
          <ViewSnippetModal 
            snippet={viewingSnippet} 
            onClose={() => setViewingSnippet(null)} 
          />
        )}
      </div>
    </div>
  );
};

// Snippet Card Component
interface SnippetCardProps {
  snippet: CodeSnippet;
  onView: (snippet: CodeSnippet) => void;
  onDelete: (id: number) => void;
  showActions: boolean;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onView, onDelete, showActions }) => {
  const parseTags = (tags?: string) => {
    return tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  };

  const truncateCode = (code: string, maxLength: number = 100) => {
    return code.length > maxLength ? code.substring(0, maxLength) + '...' : code;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-card-foreground truncate flex-1 mr-2">
          {snippet.title}
        </h4>
        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md whitespace-nowrap">
          {snippet.language}
        </span>
      </div>

      {snippet.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {snippet.description}
        </p>
      )}

      <div className="bg-muted/50 rounded-md p-3 mb-3 font-mono text-sm overflow-hidden">
        <pre className="whitespace-pre-wrap break-words text-xs">
          {truncateCode(snippet.code)}
        </pre>
      </div>

      {parseTags(snippet.tags).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {parseTags(snippet.tags).slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
        <div className="flex items-center space-x-1">
          <UserIcon className="h-3 w-3" />
          <span>{snippet.username}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CalendarIcon className="h-3 w-3" />
          <span>{formatDate(snippet.created_at)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <EyeIcon className="h-3 w-3" />
            <span>{snippet.view_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HeartIcon className="h-3 w-3" />
            <span>{snippet.like_count}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(snippet)}
            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors"
          >
            View
          </button>
          {showActions && (
            <button
              onClick={() => onDelete(snippet.id)}
              className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-md hover:bg-destructive/20 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Snippet Form Component
interface CreateSnippetFormProps {
  formData: SnippetFormData;
  setFormData: React.Dispatch<React.SetStateAction<SnippetFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CreateSnippetForm: React.FC<CreateSnippetFormProps> = ({ formData, setFormData, onSubmit, onCancel }) => {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Create New Snippet</h3>
        <p className="text-sm text-muted-foreground">Share a useful code snippet with the community</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter snippet title"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {PROGRAMMING_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this snippet does..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Code *
          </label>
          <textarea
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Paste your code here..."
            rows={12}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="react, hooks, typescript"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Visibility
            </label>
            <select
              value={formData.is_public ? 'public' : 'private'}
              onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.value === 'public' }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Snippet
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-border text-card-foreground rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// View Snippet Modal Component
interface ViewSnippetModalProps {
  snippet: CodeSnippet;
  onClose: () => void;
}

const ViewSnippetModal: React.FC<ViewSnippetModalProps> = ({ snippet, onClose }) => {
  const parseTags = (tags?: string) => {
    return tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-card-foreground mb-2">{snippet.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-4 w-4" />
                  <span>{snippet.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(snippet.created_at)}</span>
                </div>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                  {snippet.language}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-card-foreground text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {snippet.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{snippet.description}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-medium text-card-foreground mb-2">Code</h3>
            <div className="bg-muted/50 rounded-md p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{snippet.code}</pre>
            </div>
          </div>

          {parseTags(snippet.tags).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {parseTags(snippet.tags).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{snippet.view_count} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-4 w-4" />
              <span>{snippet.like_count} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSnippetsPage;
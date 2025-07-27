import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import apiClient from '../utils/apiClient';

interface Bookmark {
  id: number;
  user_id: number;
  problem_id: number;
  created_at: string;
  problem: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    sample_input?: string;
    sample_output?: string;
  };
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  bookmarkedProblemIds: Set<number>;
  isBookmarked: (problemId: number) => boolean;
  toggleBookmark: (problemId: number) => Promise<void>;
  refreshBookmarks: () => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedProblemIds, setBookmarkedProblemIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshBookmarks = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get('/api/bookmarks');
      
      setBookmarks(response.data);
      setBookmarkedProblemIds(new Set(response.data.map((b: Bookmark) => b.problem_id)));
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (problemId: number): boolean => {
    return bookmarkedProblemIds.has(problemId);
  };

  const toggleBookmark = async (problemId: number): Promise<void> => {
    if (!isAuthenticated) return;

    const wasBookmarked = isBookmarked(problemId);
    
    // Optimistic update
    if (wasBookmarked) {
      setBookmarkedProblemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(problemId);
        return newSet;
      });
      setBookmarks(prev => prev.filter(b => b.problem_id !== problemId));
    } else {
      setBookmarkedProblemIds(prev => new Set(prev).add(problemId));
    }

    try {
      if (wasBookmarked) {
        await apiClient.delete(`/api/bookmarks/${problemId}`);
      } else {
        await apiClient.post(`/api/bookmarks/${problemId}`, {});
        // Refresh to get the full bookmark data with problem details
        await refreshBookmarks();
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Revert optimistic update on error
      if (wasBookmarked) {
        setBookmarkedProblemIds(prev => new Set(prev).add(problemId));
      } else {
        setBookmarkedProblemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(problemId);
          return newSet;
        });
      }
    }
  };

  // Load bookmarks when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      refreshBookmarks();
    } else {
      setBookmarks([]);
      setBookmarkedProblemIds(new Set());
    }
  }, [isAuthenticated]);

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      bookmarkedProblemIds,
      isBookmarked,
      toggleBookmark,
      refreshBookmarks,
      loading
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';
import { BookmarkButton } from '../components/BookmarkButton';
import { useBookmarks } from '../context/BookmarkContext';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';
import { ShortcutConfig } from '../hooks/useKeyboardShortcuts';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  created_at?: string;
  popularity?: number;
}

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortOption = 'popularity' | 'newest' | 'difficulty';
type BookmarkFilter = 'all' | 'bookmarked' | 'not-bookmarked';

const TailwindProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [bookmarkFilter, setBookmarkFilter] = useState<BookmarkFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isBookmarked } = useBookmarks();
  const { registerShortcuts, unregisterShortcuts } = useKeyboardShortcutsContext();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('https://structures-production.up.railway.app/api/problems/');
        setProblems(res.data);
      } catch (err) {
        setError('Failed to load problems.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Register keyboard shortcuts for this page
  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      {
        key: '/',
        ctrlKey: true,
        description: 'Focus search input',
        category: 'Navigation',
        action: () => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      },
      {
        key: 'e',
        ctrlKey: true,
        description: 'Filter Easy problems',
        category: 'Filters',
        action: () => setDifficultyFilter('Easy')
      },
      {
        key: 'm',
        ctrlKey: true,
        description: 'Filter Medium problems',
        category: 'Filters',
        action: () => setDifficultyFilter('Medium')
      },
      {
        key: 'h',
        ctrlKey: true,
        description: 'Filter Hard problems',
        category: 'Filters',
        action: () => setDifficultyFilter('Hard')
      },
      {
        key: 'a',
        ctrlKey: true,
        description: 'Show All problems',
        category: 'Filters',
        action: () => setDifficultyFilter('All')
      },
      {
        key: 'b',
        ctrlKey: true,
        description: 'Toggle bookmarked filter',
        category: 'Filters',
        action: () => {
          setBookmarkFilter(current => 
            current === 'bookmarked' ? 'all' : 'bookmarked'
          );
        }
      },
      {
        key: 'c',
        ctrlKey: true,
        description: 'Clear all filters',
        category: 'Filters',
        action: () => {
          setSearch('');
          setDifficultyFilter('All');
          setBookmarkFilter('all');
        }
      },
      {
        key: '1',
        altKey: true,
        description: 'Sort by popularity',
        category: 'Sorting',
        action: () => setSortBy('popularity')
      },
      {
        key: '2',
        altKey: true,
        description: 'Sort by newest',
        category: 'Sorting',
        action: () => setSortBy('newest')
      },
      {
        key: '3',
        altKey: true,
        description: 'Sort by difficulty',
        category: 'Sorting',
        action: () => setSortBy('difficulty')
      }
    ];

    registerShortcuts(shortcuts);

    return () => {
      unregisterShortcuts();
    };
  }, [registerShortcuts, unregisterShortcuts, setDifficultyFilter, setBookmarkFilter, setSearch, setSortBy]);

  const filteredProblems = problems
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      const matchesBookmark = bookmarkFilter === 'all' || 
        (bookmarkFilter === 'bookmarked' && isBookmarked(p.id)) ||
        (bookmarkFilter === 'not-bookmarked' && !isBookmarked(p.id));
      return matchesSearch && matchesDifficulty && matchesBookmark;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'newest':
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">Problems</h1>
            <div className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">?</kbd> for keyboard shortcuts
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search problems... (Ctrl+/ to focus)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Difficulty Filter */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Difficulty:</p>
              <div className="flex gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
                      difficultyFilter === difficulty
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-card-foreground border-border hover:border-primary'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookmark Filter */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Bookmarks:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setBookmarkFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
                    bookmarkFilter === 'all'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-card-foreground border-border hover:border-primary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setBookmarkFilter('bookmarked')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
                    bookmarkFilter === 'bookmarked'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-card-foreground border-border hover:border-primary'
                  }`}
                >
                  Bookmarked
                </button>
                <button
                  onClick={() => setBookmarkFilter('not-bookmarked')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
                    bookmarkFilter === 'not-bookmarked'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-card-foreground border-border hover:border-primary'
                  }`}
                >
                  Not Bookmarked
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Sort by:</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
            {difficultyFilter !== 'All' && ` (${difficultyFilter} difficulty)`}
            {bookmarkFilter === 'bookmarked' && ' (bookmarked)'}
            {bookmarkFilter === 'not-bookmarked' && ' (not bookmarked)'}
          </p>
        </div>

        {/* Problems List - LeetCode Style */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted/30 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 flex-1">
                <div className="w-12 text-center">
                  <span className="text-sm font-medium text-muted-foreground">#</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground">Title</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 flex-shrink-0">
                <div className="hidden sm:block min-w-[80px] text-center">
                  <span className="text-sm font-medium text-muted-foreground">Acceptance</span>
                </div>
                <div className="min-w-[80px] text-center">
                  <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
                </div>
                <div className="w-12 text-center">
                  <span className="text-sm font-medium text-muted-foreground">Save</span>
                </div>
              </div>
            </div>
          </div>

          {/* Problems List */}
          <div className="divide-y divide-border">
            {filteredProblems.map((problem, index) => (
              <div
                key={problem.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-card/50 transition-all duration-200 group cursor-pointer"
                onClick={() => navigate(`/problems/${problem.id}`)}
              >
                {/* Left Side: Number + Title */}
                <div className="flex items-center space-x-6 flex-1 min-w-0">
                  {/* Problem Number */}
                  <div className="w-12 text-center flex-shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                  </div>
                  
                  {/* Problem Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
                      {problem.title}
                    </h3>
                  </div>
                </div>
                
                {/* Right Side: Acceptance Rate + Difficulty */}
                <div className="flex items-center space-x-6 flex-shrink-0">
                  {/* Acceptance Rate */}
                  <div className="hidden sm:block text-center min-w-[80px]">
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 30 + 40)}.{Math.floor(Math.random() * 10)}%
                    </span>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="min-w-[80px] text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : problem.difficulty === 'Medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  {/* Bookmark Button */}
                  <div className="w-12 text-center">
                    <BookmarkButton problemId={problem.id} size="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {filteredProblems.length === 0 && !loading && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No problems found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? `No problems match "${search}"` : 'No problems match your current filters'}
              {difficultyFilter !== 'All' && ` for ${difficultyFilter} difficulty`}
              {bookmarkFilter === 'bookmarked' && ' in your bookmarks'}
              {bookmarkFilter === 'not-bookmarked' && ' that are not bookmarked'}
            </p>
            {(search || difficultyFilter !== 'All' || bookmarkFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearch('');
                  setDifficultyFilter('All');
                  setBookmarkFilter('all');
                }}
                className="px-4 py-2 border border-primary text-primary bg-transparent rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TailwindProblemsPage;

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';
import { BookmarkButton } from '../components/BookmarkButton';
import { useBookmarks } from '../context/BookmarkContext';
import { useKeyboardShortcutsContext } from '../contexts/KeyboardShortcutsContext';
import { ShortcutConfig } from '../hooks/useKeyboardShortcuts';
import TrendingBadge from '../components/TrendingBadge';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  created_at?: string;
  popularity?: number;
  view_count: number;
  solve_count: number;
  attempt_count: number;
  acceptance_rate?: number;
}

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortOption = 'popular' | 'trending' | 'newest' | 'difficulty' | 'bookmarked';

const TailwindProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
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
        let url = 'https://structures-production.up.railway.app/api/problems/';
        
        // Use specific endpoints for popular and trending
        if (sortBy === 'popular') {
          url = 'https://structures-production.up.railway.app/api/problems/popular/list';
        } else if (sortBy === 'trending') {
          url = 'https://structures-production.up.railway.app/api/problems/trending/list';
        }
        
        const res = await axios.get(url);
        setProblems(res.data);
      } catch (err) {
        setError('Failed to load problems.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [sortBy]); // Re-fetch when sort changes

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
        key: 'c',
        ctrlKey: true,
        description: 'Clear all filters',
        category: 'Filters',
        action: () => {
          setSearch('');
          setDifficultyFilter('All');
        }
      },
      {
        key: '1',
        altKey: true,
        description: 'Sort by popular',
        category: 'Sorting',
        action: () => setSortBy('popular')
      },
      {
        key: '2',
        altKey: true,
        description: 'Sort by trending',
        category: 'Sorting',
        action: () => setSortBy('trending')
      },
      {
        key: '3',
        altKey: true,
        description: 'Sort by newest',
        category: 'Sorting',
        action: () => setSortBy('newest')
      },
      {
        key: '4',
        altKey: true,
        description: 'Sort by difficulty',
        category: 'Sorting',
        action: () => setSortBy('difficulty')
      },
      {
        key: '5',
        altKey: true,
        description: 'Sort bookmarked first',
        category: 'Sorting',
        action: () => setSortBy('bookmarked')
      }
    ];

    registerShortcuts(shortcuts);

    return () => {
      unregisterShortcuts();
    };
  }, [registerShortcuts, unregisterShortcuts, setDifficultyFilter, setSearch, setSortBy]);

  const filteredProblems = problems
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'trending':
          // For trending, we prioritize recent activity (view_count for now)
          // In a real implementation, you could weight recent views more heavily
          return (b.view_count || 0) - (a.view_count || 0);
        case 'newest':
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
        case 'bookmarked':
          const aBookmarked = isBookmarked(a.id);
          const bBookmarked = isBookmarked(b.id);
          if (aBookmarked && !bBookmarked) return -1;
          if (!aBookmarked && bBookmarked) return 1;
          return 0;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center sm:text-left">Problems</h1>
            <div className="group relative self-center sm:self-auto">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs group-hover:bg-card">?</kbd>
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50">
                <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[280px] sm:min-w-[300px]">
                  <h3 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Focus search</span>
                      <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+/</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Filter Easy/Medium/Hard/All</span>
                      <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+E/M/H/A</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Clear filters</span>
                      <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+C</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Sort by Popular/Trending/Newest/Difficulty/Bookmarked</span>
                      <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Alt+1/2/3/4/5</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative max-w-full sm:max-w-2xl mx-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search problems... (Ctrl+/ to focus)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Difficulty Filter */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Filter by Difficulty:</p>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors duration-200 ${
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

            {/* Sort Dropdown */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Sort by:</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground text-sm sm:text-base"
              >
                <option value="popular">Popular</option>
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="difficulty">Difficulty</option>
                <option value="bookmarked">Bookmarked First</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-muted-foreground">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
            {difficultyFilter !== 'All' && ` (${difficultyFilter} difficulty)`}
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
                  
                  {/* Problem Title with Trending Badge */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <h3 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors duration-200 truncate">
                      {problem.title}
                    </h3>
                    {sortBy === 'trending' && (
                      <TrendingBadge trending={true} />
                    )}
                  </div>
                </div>
                
                {/* Right Side: View Count + Difficulty */}
                <div className="flex items-center space-x-6 flex-shrink-0">
                  {/* Acceptance Rate */}
                  <div className="hidden sm:block text-center min-w-[80px]">
                    <span className={`text-sm font-medium ${
                      problem.acceptance_rate !== undefined 
                        ? problem.acceptance_rate >= 70 
                          ? 'text-green-600 dark:text-green-400'
                          : problem.acceptance_rate >= 40
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}>
                      {problem.acceptance_rate !== undefined ? `${problem.acceptance_rate}%` : 'N/A'}
                    </span>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="min-w-[80px] text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : problem.difficulty === 'Medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
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
            </p>
            {(search || difficultyFilter !== 'All') && (
              <button 
                onClick={() => {
                  setSearch('');
                  setDifficultyFilter('All');
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

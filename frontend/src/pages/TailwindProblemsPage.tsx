import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  created_at?: string;
  popularity?: number;
}

type DifficultyFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortOption = 'popularity' | 'newest' | 'difficulty';

const difficultyStyles = {
  Easy: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  Hard: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
};

const TailwindProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [searchParams] = useSearchParams();

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

  const filteredProblems = problems
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-6">Problems</h1>
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
              <input
                type="text"
                placeholder="Search problems... (e.g. 'Linked List', 'Binary Tree')"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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
                        : 'bg-card text-card-foreground border-gray-200 hover:border-primary'
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
                className="px-4 py-2 bg-card border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <div key={problem.id} className="bg-card rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-card-foreground flex-1 pr-3">
                  {problem.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyStyles[problem.difficulty as keyof typeof difficultyStyles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {problem.difficulty}
                </span>
              </div>
              <Link
                to={`/problems/${problem.id}`}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
              >
                Solve
              </Link>
            </div>
          ))}
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

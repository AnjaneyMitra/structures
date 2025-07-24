import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { BookmarkButton } from '../components/BookmarkButton';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'success';
    case 'medium': return 'warning';
    case 'hard': return 'error';
    default: return 'default';
  }
};

export const BookmarkedProblemsPage: React.FC = () => {
  const { bookmarks, loading } = useBookmarks();

  if (loading) {
    return (
      <Box className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </Box>
    );
  }

  return (
    <Box className="p-8">
      <Typography variant="h4" className="mb-6 font-bold">
        Bookmarked Problems
      </Typography>
      
      {bookmarks.length === 0 ? (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary" className="mb-4">
            No bookmarked problems yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start bookmarking problems to build your personal collection!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bookmarks.map((bookmark) => (
            <Grid item xs={12} md={6} lg={4} key={bookmark.id}>
              <Card 
                className="h-full hover:shadow-lg transition-shadow duration-200"
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent className="p-6">
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" className="mb-3">
                    <Typography 
                      variant="h6" 
                      component={Link}
                      to={`/problems/${bookmark.problem.id}`}
                      className="font-semibold text-decoration-none hover:text-primary transition-colors"
                      sx={{ color: 'text.primary' }}
                    >
                      {bookmark.problem.title}
                    </Typography>
                    <BookmarkButton problemId={bookmark.problem.id} size="small" />
                  </Stack>
                  
                  <Chip
                    label={bookmark.problem.difficulty}
                    color={getDifficultyColor(bookmark.problem.difficulty) as any}
                    size="small"
                    className="mb-3"
                  />
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    className="line-clamp-3"
                  >
                    {bookmark.problem.description}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    className="mt-3 block"
                  >
                    Bookmarked on {new Date(bookmark.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
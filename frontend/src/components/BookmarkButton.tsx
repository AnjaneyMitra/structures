import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import { useBookmarks } from '../context/BookmarkContext';

interface BookmarkButtonProps {
  problemId: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  problemId, 
  size = 'medium',
  className = ''
}) => {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  const bookmarked = isBookmarked(problemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark(problemId);
  };

  return (
    <Tooltip title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}>
      <IconButton
        onClick={handleClick}
        disabled={loading}
        size={size}
        className={className}
        sx={{
          color: bookmarked ? 'warning.main' : 'text.secondary',
          '&:hover': {
            color: 'warning.main',
            backgroundColor: 'rgba(255, 193, 7, 0.04)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {bookmarked ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
    </Tooltip>
  );
};
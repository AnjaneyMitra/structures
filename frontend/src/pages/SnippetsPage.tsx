import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Pagination,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Code as CodeIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

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
    is_featured: boolean;
    view_count: number;
    like_count: number;
    is_liked: boolean;
    created_at: string;
    updated_at: string;
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
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'html',
    'css', 'sql', 'bash', 'powershell', 'json', 'yaml', 'xml'
];

const SnippetsPage: React.FC = () => {
    const { username, isAuthenticated } = useAuth();
    const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedTags, setSelectedTags] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
    
    // Form data
    const [formData, setFormData] = useState<SnippetFormData>({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        tags: '',
        is_public: false
    });

    const fetchSnippets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                skip: ((page - 1) * 12).toString(),
                limit: '12',
                sort_by: sortBy,
                sort_order: sortOrder,
                public_only: currentTab === 0 ? 'true' : 'false'
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedLanguage) params.append('language', selectedLanguage);
            if (selectedTags) params.append('tags', selectedTags);

            const endpoint = currentTab === 1 ? '/api/snippets/my' : '/api/snippets';
            const response = await apiClient.get(`${endpoint}?${params}`);
            
            setSnippets(response.data);
            // For simplicity, assuming 12 items per page
            setTotalPages(Math.ceil(response.data.length / 12) || 1);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch snippets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnippets();
    }, [currentTab, page, searchTerm, selectedLanguage, selectedTags, sortBy, sortOrder]);

    const handleCreateSnippet = async () => {
        try {
            await apiClient.post('/api/snippets', formData);
            setCreateDialogOpen(false);
            resetForm();
            fetchSnippets();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create snippet');
        }
    };

    const handleUpdateSnippet = async () => {
        if (!selectedSnippet) return;
        
        try {
            await apiClient.put(`/api/snippets/${selectedSnippet.id}`, formData);
            setEditDialogOpen(false);
            resetForm();
            fetchSnippets();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update snippet');
        }
    };

    const handleDeleteSnippet = async (snippetId: number) => {
        if (!window.confirm('Are you sure you want to delete this snippet?')) return;
        
        try {
            await apiClient.delete(`/api/snippets/${snippetId}`);
            fetchSnippets();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to delete snippet');
        }
    };

    const handleToggleLike = async (snippetId: number) => {
        try {
            const response = await apiClient.post(`/api/snippets/${snippetId}/like`);
            
            // Update the snippet in the list
            setSnippets(prev => prev.map(snippet => 
                snippet.id === snippetId 
                    ? { 
                        ...snippet, 
                        is_liked: response.data.is_liked,
                        like_count: response.data.like_count 
                    }
                    : snippet
            ));
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to toggle like');
        }
    };

    const handleViewSnippet = async (snippet: CodeSnippet) => {
        try {
            const response = await apiClient.get(`/api/snippets/${snippet.id}`);
            setSelectedSnippet(response.data);
            setViewDialogOpen(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load snippet');
        }
    };

    const handleEditSnippet = (snippet: CodeSnippet) => {
        setSelectedSnippet(snippet);
        setFormData({
            title: snippet.title,
            description: snippet.description || '',
            code: snippet.code,
            language: snippet.language,
            tags: snippet.tags || '',
            is_public: snippet.is_public
        });
        setEditDialogOpen(true);
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
        setSelectedSnippet(null);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateCode = (code: string, maxLength: number = 200) => {
        return code.length > maxLength ? code.substring(0, maxLength) + '...' : code;
    };

    const parseTags = (tags?: string) => {
        return tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    <CodeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                    Code Snippets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Share and discover useful code snippets from the community
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label="Public Snippets" />
                    {isAuthenticated && <Tab label="My Snippets" />}
                </Tabs>
            </Box>

            {/* Filters and Actions */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Search snippets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Language</InputLabel>
                            <Select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                label="Language"
                            >
                                <MenuItem value="">All Languages</MenuItem>
                                {PROGRAMMING_LANGUAGES.map(lang => (
                                    <MenuItem key={lang} value={lang}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            placeholder="Tags (comma-separated)"
                            value={selectedTags}
                            onChange={(e) => setSelectedTags(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="created_at">Date Created</MenuItem>
                                <MenuItem value="updated_at">Date Updated</MenuItem>
                                <MenuItem value="like_count">Likes</MenuItem>
                                <MenuItem value="view_count">Views</MenuItem>
                                <MenuItem value="title">Title</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={sortOrder === 'desc' ? 'contained' : 'outlined'}
                                onClick={() => setSortOrder('desc')}
                                size="small"
                            >
                                Desc
                            </Button>
                            <Button
                                variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
                                onClick={() => setSortOrder('asc')}
                                size="small"
                            >
                                Asc
                            </Button>
                            {isAuthenticated && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateDialogOpen(true)}
                                    sx={{ ml: 'auto' }}
                                >
                                    Create Snippet
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Snippets Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>Loading snippets...</Typography>
                </Box>
            ) : snippets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No snippets found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {currentTab === 1 ? 'Create your first snippet!' : 'Be the first to share a snippet!'}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {snippets.map((snippet) => (
                            <Grid item xs={12} md={6} lg={4} key={snippet.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" component="h3" noWrap>
                                                {snippet.title}
                                            </Typography>
                                            <Chip 
                                                label={snippet.language} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </Box>
                                        
                                        {snippet.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {snippet.description.length > 100 
                                                    ? snippet.description.substring(0, 100) + '...'
                                                    : snippet.description
                                                }
                                            </Typography>
                                        )}

                                        <Box sx={{ 
                                            bgcolor: 'grey.100', 
                                            borderRadius: 1, 
                                            p: 1, 
                                            mb: 2,
                                            maxHeight: 150,
                                            overflow: 'hidden'
                                        }}>
                                            <SyntaxHighlighter
                                                language={snippet.language}
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    fontSize: '12px',
                                                    background: 'transparent'
                                                }}
                                            >
                                                {truncateCode(snippet.code)}
                                            </SyntaxHighlighter>
                                        </Box>

                                        {parseTags(snippet.tags).length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                {parseTags(snippet.tags).slice(0, 3).map((tag, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag}
                                                        size="small"
                                                        sx={{ mr: 0.5, mb: 0.5 }}
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                by {snippet.username} • {formatDate(snippet.created_at)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="caption">{snippet.view_count}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="caption">{snippet.like_count}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => handleViewSnippet(snippet)}
                                        >
                                            View
                                        </Button>
                                        
                                        {isAuthenticated && snippet.username !== username && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleLike(snippet.id)}
                                                color={snippet.is_liked ? 'error' : 'default'}
                                            >
                                                {snippet.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            </IconButton>
                                        )}
                                        
                                        {isAuthenticated && snippet.username === username && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditSnippet(snippet)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteSnippet(snippet.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Create/Edit Dialog */}
            <Dialog 
                open={createDialogOpen || editDialogOpen} 
                onClose={() => {
                    setCreateDialogOpen(false);
                    setEditDialogOpen(false);
                    resetForm();
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {createDialogOpen ? 'Create New Snippet' : 'Edit Snippet'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Language</InputLabel>
                                    <Select
                                        value={formData.language}
                                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                                        label="Language"
                                    >
                                        {PROGRAMMING_LANGUAGES.map(lang => (
                                            <MenuItem key={lang} value={lang}>
                                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Code"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    multiline
                                    rows={12}
                                    required
                                    sx={{ fontFamily: 'monospace' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Tags (comma-separated)"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="react, hooks, typescript"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Visibility</InputLabel>
                                    <Select
                                        value={formData.is_public ? 'public' : 'private'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.value === 'public' }))}
                                        label="Visibility"
                                    >
                                        <MenuItem value="private">Private</MenuItem>
                                        <MenuItem value="public">Public</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setCreateDialogOpen(false);
                        setEditDialogOpen(false);
                        resetForm();
                    }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={createDialogOpen ? handleCreateSnippet : handleUpdateSnippet}
                        variant="contained"
                        disabled={!formData.title || !formData.code}
                    >
                        {createDialogOpen ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => {
                    setViewDialogOpen(false);
                    setSelectedSnippet(null);
                }}
                maxWidth="lg"
                fullWidth
            >
                {selectedSnippet && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">{selectedSnippet.title}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={selectedSnippet.language} color="primary" size="small" />
                                    {selectedSnippet.is_public && (
                                        <IconButton size="small">
                                            <ShareIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    by {selectedSnippet.username} • {formatDate(selectedSnippet.created_at)}
                                    {selectedSnippet.updated_at !== selectedSnippet.created_at && 
                                        ` • Updated ${formatDate(selectedSnippet.updated_at)}`
                                    }
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="caption">{selectedSnippet.view_count} views</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="caption">{selectedSnippet.like_count} likes</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {selectedSnippet.description && (
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {selectedSnippet.description}
                                </Typography>
                            )}

                            {parseTags(selectedSnippet.tags).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    {parseTags(selectedSnippet.tags).map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            )}

                            <Box sx={{ 
                                bgcolor: 'grey.900', 
                                borderRadius: 1, 
                                overflow: 'auto',
                                maxHeight: '60vh'
                            }}>
                                <SyntaxHighlighter
                                    language={selectedSnippet.language}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '16px'
                                    }}
                                >
                                    {selectedSnippet.code}
                                </SyntaxHighlighter>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            {isAuthenticated && selectedSnippet.username !== username && (
                                <Button
                                    startIcon={selectedSnippet.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    onClick={() => handleToggleLike(selectedSnippet.id)}
                                    color={selectedSnippet.is_liked ? 'error' : 'primary'}
                                >
                                    {selectedSnippet.is_liked ? 'Unlike' : 'Like'}
                                </Button>
                            )}
                            <Button onClick={() => {
                                setViewDialogOpen(false);
                                setSelectedSnippet(null);
                            }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default SnippetsPage;
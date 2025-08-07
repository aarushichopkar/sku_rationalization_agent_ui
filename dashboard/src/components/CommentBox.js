import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const CommentBox = ({ selectedRow, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Reset comment when a new row is selected
    setComment('');
    setError('');
  }, [selectedRow]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment before submitting');
      return;
    }
    
    setLoading(true);
    try {
      const response = await onSubmit(comment);
      setComment('');
      setError('');
      setAlert({ 
        open: true, 
        message: response.text || 'Comment submitted successfully!', 
        severity: 'success' 
      });
    } catch (err) {
      setAlert({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="relative">
      <Typography variant="h6" gutterBottom>
        Note
      </Typography>
      
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Add a Comment"
        multiline
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
        fullWidth
        margin="normal"
        placeholder="Enter your comments here..."
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mt: 2
      }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? null : <SendIcon />}
          onClick={handleSubmit}
          disabled={loading}
          size="large"
          sx={{ 
            minWidth: '200px',
            py: 1
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Submit Review'
          )}
        </Button>
      </Box>
      
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            borderRadius: 1,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
      

    </Box>
  );
};

export default CommentBox;

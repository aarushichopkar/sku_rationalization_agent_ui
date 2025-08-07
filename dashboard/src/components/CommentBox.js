import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const CommentBox = ({ selectedRow, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Reset comment when a new row is selected
    setComment('');
    setError('');
  }, [selectedRow]);

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError('Please enter a comment before submitting');
      return;
    }
    
    onSubmit(comment);
    setComment('');
    setError('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Note
      </Typography>
      
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
          startIcon={<SendIcon />}
  
          onClick={() => handleSubmit()}
          size="large"
          sx={{ 
            minWidth: '200px',
            py: 1
          }}
        >
          Submit Review
        </Button>
      </Box>
    </Box>
  );
};

export default CommentBox;

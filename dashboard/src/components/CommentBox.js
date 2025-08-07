import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LaunchIcon from "@mui/icons-material/Launch";

const CommentBox = ({ selectedRow, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const viewButtonRef = useRef(null);

  useEffect(() => {
    // Reset comment when a new row is selected
    setComment("");
    setError("");
    setShowViewButton(false);
  }, [selectedRow]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Please enter a comment before submitting");
      return;
    }

    setLoading(true);
    try {
      const response = await onSubmit(comment);
      setComment("");
      setError("");
      
      // Store the current table data in localStorage to be accessed by the new tab
      const currentData = JSON.parse(
        localStorage.getItem("dashboardData") || "[]"
      );
      
      // If we have a selected row, store it separately in localStorage
      if (selectedRow) {
        localStorage.setItem("selectedDashboardRow", JSON.stringify(selectedRow));
      }
      
      // Show success message and enable view button
      setAlert({
        open: true,
        message: response.text || "Comment submitted successfully!",
        severity: "success",
      });
      
      // Show the View Dashboard button
      setShowViewButton(true);
      
      // Focus on the view button after a short delay
      setTimeout(() => {
        if (viewButtonRef.current) {
          viewButtonRef.current.focus();
        }
      }, 500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 2,
          gap: 2
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? null : <SendIcon />}
          onClick={handleSubmit}
          disabled={loading || showViewButton}
          size="large"
          sx={{
            minWidth: "200px",
            py: 1,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit Review"
          )}
        </Button>
        
        {showViewButton && (
          <Button
            ref={viewButtonRef}
            variant="contained"
            color="primary"
            startIcon={<LaunchIcon />}
            onClick={() => window.open("/dashboard-view", "_blank")}
            size="large"
            sx={{
              minWidth: "200px",
              py: 1,
              mt: 1
            }}
          >
            View Dashboard
          </Button>
        )}
      </Box>

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
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

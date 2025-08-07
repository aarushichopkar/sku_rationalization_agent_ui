import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Button,
} from "@mui/material";
import DataTable from "./DataTable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import CommentBox from "./CommentBox";

const DashboardView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selected, setSelected] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Load data from localStorage when component mounts
    const loadData = () => {
      try {
        const storedData = localStorage.getItem("dashboardData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers for DataTable functionality
  const handleRowSelect = (row) => {
    setSelectedRow(row);
  };

  const handleDeleteRow = (id) => {
    const updatedData = data.map((item) => {
      if (item.id === id) {
        return { ...item, status: "Discontinued" };
      }
      return item;
    });
    setData(updatedData);

    // Update localStorage with the new data
    localStorage.setItem("dashboardData", JSON.stringify(updatedData));

    if (selectedRow && selectedRow.id === id) {
      setSelectedRow(null);
    }
  };

  const handleDeleteMultiple = (ids) => {
    const updatedData = data.map((item) => {
      if (ids.includes(item.id)) {
        return { ...item, status: "Discontinued" };
      }
      return item;
    });
    setData(updatedData);

    // Update localStorage with the new data
    localStorage.setItem("dashboardData", JSON.stringify(updatedData));

    if (selectedRow && ids.includes(selectedRow.id)) {
      setSelectedRow(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Space Dashboard View
        </Typography>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading data...
          </Typography>
        </Box>
      ) : data.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 4,
            overflow: "auto",
          }}
        ></Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 4,
              overflow: "auto",
            }}
          >
            <DataTable
              data={data}
              onRowSelect={handleRowSelect}
              onDeleteRow={handleDeleteRow}
              onDeleteMultiple={handleDeleteMultiple}
              showFilters={false}
              selected={selected}
              setSelected={setSelected}
            />
          </Paper>

          {/* Comment Box */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
            }}
          >
            <CommentBox selectedRow={selectedRow} />
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default DashboardView;

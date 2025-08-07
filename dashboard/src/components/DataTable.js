import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Checkbox,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const DataTable = ({
  data,
  onRowSelect,
  onDeleteRow,
  onDeleteMultiple,
  onTimeFilterChange,
  initialTimeFilter = "1", // Default to 1 month if not provided
  showFilters = true, // New prop to control filter visibility
  selected = undefined,
  setSelected = undefined,
}) => {
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter); // Use the provided initialTimeFilter
  // Extract column headers from the first data item if available
  const getColumnHeaders = () => {
    if (data.length === 0) return [];

    // Get all unique keys from the data objects
    const allKeys = new Set();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });

    // Filter out any internal fields we don't want to display
    return Array.from(allKeys).filter(
      (key) => key !== "id" && key !== "status"
    );
  };

  const columnHeaders = getColumnHeaders();
  // Use external selected state if provided, otherwise use internal state
  const [internalSelected, setInternalSelected] = useState([]);

  // Use the provided selected state and setter if available, otherwise use internal state
  const selectedState = selected !== undefined ? selected : internalSelected;
  const setSelectedState =
    setSelected !== undefined ? setSelected : setInternalSelected;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelectedState(newSelected);
      return;
    }
    setSelectedState([]);
  };

  const handleClick = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selectedState.indexOf(id);
    let newSelected = [...selectedState];

    // Toggle selection: if already selected, remove it; otherwise add it
    if (selectedIndex === -1) {
      newSelected.push(id); // Add this row to selections
    } else {
      newSelected.splice(selectedIndex, 1); // Remove this row from selections
    }

    setSelectedState(newSelected);
  };

  const isSelected = (id) => selectedState.indexOf(id) !== -1;

  const handleDeleteSelected = () => {
    if (selectedState.length > 0) {
      onDeleteMultiple(selectedState);
      setSelectedState([]);
    }
  };

  const handleTimeFilterChange = (event) => {
    const value = event.target.value;
    console.log(value);
    setTimeFilter(value);
    // Only update local state, don't trigger filter change
  };
  console.log(timeFilter);

  return (
    <>
      {/* Conditionally render the filters section */}

      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showFilters && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="time-filter-label">Time Period</InputLabel>
              <Select
                labelId="time-filter-label"
                id="time-filter-select"
                value={timeFilter}
                label="Time Period"
                onChange={handleTimeFilterChange}
                size="small"
              >
                <MenuItem value="1">Last Month</MenuItem>
                <MenuItem value="3">Last 3 Months</MenuItem>
                <MenuItem value="6">Last 6 Months</MenuItem>
                <MenuItem value="12">Last 12 Months</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onTimeFilterChange(timeFilter)}
              sx={{ height: "40px" }}
            >
              Apply
            </Button>
          </Box>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            style={{
              padding: "8px 16px",
              fontWeight: "500",
            }}
            disabled={selectedState.length === 0}
          >
            Discontinue Selected ({selectedState.length})
          </Button>
        </div>
      </div>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "400px",
          overflowY: "auto",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "16px",
        }}
      >
        <Table
          aria-label="data table"
          size="medium"
          sx={{
            minWidth: 650,
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                align="center"
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                  padding: "12px",
                  width: "56px",
                }}
              >
                <Checkbox
                  indeterminate={
                    selectedState.length > 0 &&
                    selectedState.length < data.length
                  }
                  checked={
                    data.length > 0 && selectedState.length === data.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>

              {/* Dynamically generate column headers */}
              {columnHeaders.map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #e0e0e0",
                    padding: "16px",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {header.charAt(0).toUpperCase() +
                      header
                        .slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </Typography>
                </TableCell>
              ))}
              {/* Status column header */}
              <TableCell
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                  padding: "16px",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Status
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => {
              const isItemSelected = isSelected(row.id);
              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowSelect(row)}
                  selected={isItemSelected}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    "&:nth-of-type(odd)": {
                      backgroundColor: "#fafafa",
                    },
                  }}
                >
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: "12px",
                      width: "56px",
                    }}
                  >
                    <Checkbox
                      checked={isItemSelected}
                      onChange={(event) => handleClick(event, row.id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={row.status === "Discontinued"}
                    />
                  </TableCell>

                  {/* Dynamically generate table cells for each column */}
                  {columnHeaders.map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        padding: "16px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {row[header] || ""}
                    </TableCell>
                  ))}
                  {/* Status column */}
                  <TableCell
                    sx={{
                      padding: "16px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Chip
                      label={row.status || "Active"}
                      color={
                        row.status === "Discontinued" ? "error" : "success"
                      }
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataTable;

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import DataTable from "./DataTable";
import CommentBox from "./CommentBox";

// Initial empty data array
const initialData = [];

const Dashboard = () => {
  const [data, setData] = useState(initialData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("1"); // Default to 1 month
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchSkuData(timeFilter);
  }, []); // Initial fetch with default time filter

  const fetchSkuData = async (months = "1") => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://internal-sadc-stage.carbon.lowes.com/genai-agents/api/v1/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjo0NTksInVzZXJfaWQiOiI1MTM5MDQxIiwiZXhwIjoxNzU2NjcyMDk2fQ.00qrKqs-DCZeb_mi56BZt4pnIawgPwu5cT-gPPVey0g",
          },
          body: JSON.stringify({
            app_name: "sku_rationalization_agent_1",
            user_id: "5139041",
            prompt: `Return 10 least performing SKUs from the last ${months} ${
              months === "1" ? "month" : "months"
            } as a valid JSON array. Provide only the item number and name, a short description about the product, a score between 1 and 100 (where 100 is the least performing), and a short reason for underperformance.
 
Do not include any sales, price, or margin data.  
If any value is unknown, return it as "NA".  
Do not fabricate or make up data.  
Do not include any explanation, markdown, or escape characters. Output must be raw JSON only.
 
The output must follow this format:
 
[
  {
    "sku": "86158",
    "name": "MNWX QT OIL BASE SPECIAL WALNUT",
    "description": "Minwax Quart Oil Base Special Walnut",
    "remarks": "negative sales amount",
    "score": 96
  },
  {
    "sku": "12345",
    "name": "Product A",
    "description": "product description",
    "remarks": "low sales",
    "score": 98.7
  },
  ...
]`,
          }),
        }
      );
      // ${months} ${months === "1" ? "month" : "months"}

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Parse the response and convert to table data format
      if (responseData) {
        const tableData = parseEscapedJsonString(responseData?.text);

        // Add unique IDs and default status to each row if they don't already have them
        const dataWithIds = tableData.map((item, index) => {
          if (!item.id) {
            return {
              ...item,
              id: item.sku || `row-${index}`,
              status: item.status || "Active",
            };
          }
          return { ...item, status: item.status || "Active" };
        });

        console.log("Data with IDs:", dataWithIds);
        setData(dataWithIds);
        
        // Store the data in localStorage for access by other tabs
        localStorage.setItem('dashboardData', JSON.stringify(dataWithIds));
      } else {
        setError("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching SKU data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function parseEscapedJsonString(escapedString) {
    try {
      // Log the input to debug
      console.log("Raw input:", escapedString);

      // For the specific format in the example: a JSON string with escaped quotes
      if (typeof escapedString === "string") {
        // This is specifically for the format shown in the example
        // "[{\"sku\": \"00123\", \"name\": \"Product Alpha\", \"score\": 98.7}, ...]"

        // First, try direct parsing
        try {
          const parsed = JSON.parse(escapedString);
          console.log("Direct parse successful:", parsed);
          return parsed;
        } catch (e) {
          console.log("Direct parse failed, trying alternative methods");

          // If the string is wrapped in quotes and contains escaped quotes
          // This is a common format from some APIs
          const stringPattern = /^"(.*)"$/;
          if (stringPattern.test(escapedString)) {
            // Remove the outer quotes and parse the inner content
            const innerContent = escapedString.replace(stringPattern, "$1");

            // Replace escaped backslashes and then parse
            const unescaped = innerContent.replace(/\\/g, "");
            try {
              const result = JSON.parse(unescaped);
              console.log("Unescaped parse successful:", result);
              return result;
            } catch (innerError) {
              console.error("Unescaped parse failed:", innerError);
            }
          }
        }
      } else if (Array.isArray(escapedString)) {
        return escapedString;
      } else if (typeof escapedString === "object" && escapedString !== null) {
        return escapedString;
      }

      // Last resort: try to manually parse the string by replacing patterns
      if (typeof escapedString === "string") {
        // Remove all backslashes before quotes
        const manuallyUnescaped = escapedString.replace(/\\"|\"/g, '"');
        // Remove outer quotes if they exist
        const cleaned = manuallyUnescaped.replace(/^"(.*)"$/, "$1");

        try {
          const result = JSON.parse(cleaned);
          console.log("Manual parse successful:", result);
          return result;
        } catch (manualError) {
          console.error("Manual parse failed:", manualError);
        }
      }

      console.error("All parsing attempts failed");
      return [];
    } catch (error) {
      console.error("Invalid escaped JSON:", error);
      return [];
    }
  }

  const handleRowSelect = (row) => {
    setSelectedRow(row);
  };

  const handleCommentSubmit = (comment) => {
    // Make sure the latest data is stored in localStorage before opening new tab
    localStorage.setItem('dashboardData', JSON.stringify(data));
    
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          "https://internal-sadc-stage.carbon.lowes.com/genai-agents/api/v1/ask",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0X2lkIjo0NTksInVzZXJfaWQiOiI1MTM5MDQxIiwiZXhwIjoxNzU2NjcyMDk2fQ.00qrKqs-DCZeb_mi56BZt4pnIawgPwu5cT-gPPVey0g",
            },
            body: JSON.stringify({
              app_name: "Announcement_Agent",
              user_id: "5139041",
              prompt: `Can you send mail using Announcement_Tool with submitter_name = Arvind, submitter_team = Team UC6, comments = ${comment}, from_email = saiarvind.pulime@lowes.com`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const responseData = await response.json();
        console.log("API Response:", responseData);

        // Clear selected row if there is one
        if (selectedRow) {
          setSelectedRow(null);
        }

        // Resolve the promise with the response data
        resolve(responseData);
      } catch (err) {
        console.error("Error submitting comment:", err);
        reject(err);
      }
    });
  };

  const handleDeleteRow = (id) => {
    const updatedData = data.map((item) => {
      if (item.id === id) {
        return { ...item, status: "Discontinued" };
      }
      return item;
    });
    setData(updatedData);
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
    if (selectedRow && ids.includes(selectedRow.id)) {
      setSelectedRow(null);
    }
  };

  const handleTimeFilterChange = (months) => {
    // Only update the timeFilter state without fetching data
    setTimeFilter(months);
    // Only fetch data when Apply button is clicked
    setLoading(true);
    fetchSkuData(months);
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
          Assortment Dashboard
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
      ) : error ? (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 4,
            overflow: "auto",
          }}
        >
          <Typography variant="body1" color="error">
            Error: {error}
          </Typography>
        </Paper>
      ) : (
        <>
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
              onTimeFilterChange={handleTimeFilterChange}
              initialTimeFilter={timeFilter}
            />
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
            }}
          >
            <CommentBox
              selectedRow={selectedRow}
              onSubmit={handleCommentSubmit}
            />
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Dashboard;

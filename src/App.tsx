import {
  Stack,
  Typography,
  CssBaseline,
  Box,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import DataTable from "./components/DataTable";
import ManageColumnsModal from "./components/ManageColumnsModal";
import ImportExportButtons from "./components/ImportExportButtons";
import ThemeToggle from "./components/ThemeToggle";
import { motion } from "framer-motion";

export default function App() {
  const mode = useSelector((s: RootState) => s.table.themeMode);

  // Color palette that works professionally in both modes
  const paletteColors = {
    primary: {
      main: mode === "light" ? "#4F46E5" : "#8B5CF6", // Indigo tone
    },
    secondary: {
      main: mode === "light" ? "#EC4899" : "#F472B6", // Pink accent
    },
    background: {
      default: mode === "light" ? "#F5F7FA" : "#0E1117",
      paper: mode === "light" ? "#FFFFFF" : "#1E1E2A",
    },
    text: {
      primary: mode === "light" ? "#1E293B" : "#E2E8F0",
      secondary: mode === "light" ? "#475569" : "#94A3B8",
    },
  };

  let theme = createTheme({
    palette: {
      mode,
      ...paletteColors,
    },
    typography: {
      fontFamily: "'Inter', 'Poppins', sans-serif",
      h4: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: "all 0.3s ease",
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Background gradient responsive to theme */}
      <Box
        sx={{
          minHeight: "100vh",
          background: mode === "light"
            ? "linear-gradient(135deg, #E0E7FF 0%, #FCE7F3 100%)"
            : "linear-gradient(135deg, #0F172A 0%, #1E1E2A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, sm: 4, md: 6 },
          px: 2,
          transition: "background 0.6s ease",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%", maxWidth: 1150 }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3, md: 5 },
              width: "100%",
              backdropFilter: "blur(12px)",
              backgroundColor:
                mode === "light"
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(30, 30, 40, 0.85)",
              boxShadow:
                mode === "light"
                  ? "0 8px 24px rgba(79, 70, 229, 0.15)"
                  : "0 8px 24px rgba(0,0,0,0.4)",
              transition: "all 0.3s ease",
            }}
          >
            {/* Header */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: { xs: 2, sm: 3 } }}
              spacing={1}
            >
              <Typography
                variant="h4"
                sx={{
                  background: mode === "light"
                    ? "linear-gradient(to right, #4F46E5, #EC4899)"
                    : "linear-gradient(to right, #A78BFA, #F472B6)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: { xs: "center", sm: "left" },
                  width: "100%",
                }}
              >
                Dynamic Table Manager
              </Typography>
              <Box sx={{ alignSelf: { xs: "center", sm: "auto" } }}>
                <ThemeToggle />
              </Box>
            </Stack>

            {/* Toolbar: Import / Manage columns */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="flex-start"
              sx={{
                mb: { xs: 2, sm: 3 },
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <ManageColumnsModal />
              <ImportExportButtons />
            </Stack>

            {/* Main Data Table */}
            <Box
              sx={{
                overflowX: "auto",
                borderRadius: 2,
                border: mode === "light"
                  ? "1px solid rgba(0,0,0,0.05)"
                  : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <DataTable />
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
}

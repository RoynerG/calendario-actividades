import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo } from "react";
import { useThemeMode } from "./useThemeMode";

export default function MuiThemeProvider({ children }) {
  const { mode } = useThemeMode();

  const theme = useMemo(() => {
    const isDark = mode === "dark";

    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? "#90caf9" : "#1976d2",
        },
        secondary: {
          main: isDark ? "#f48fb1" : "#dc004e",
        },
        background: {
          default: isDark ? "#0f172a" : "#f8fafc",
          paper: isDark ? "#1e293b" : "#ffffff",
        },
        text: {
          primary: isDark ? "#f1f5f9" : "rgba(0, 0, 0, 0.87)",
          secondary: isDark ? "#cbd5e1" : "rgba(0, 0, 0, 0.6)",
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              fontSize: "0.95rem",
              color: isDark ? "#f1f5f9" : "#1e293b",
              "&.Mui-focused": {
                color: isDark ? "#90caf9" : "#1976d2",
              },
            },
          },
        },
        MuiFormLabel: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              color: isDark ? "#f1f5f9" : "#1e293b",
              "&.Mui-focused": {
                color: isDark ? "#90caf9" : "#1976d2",
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              textTransform: "none",
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              color: isDark ? "#e2e8f0" : undefined,
              "&.Mui-selected": {
                color: isDark ? "#90caf9" : "#1976d2",
                fontWeight: 700,
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? "#1e293b" : undefined,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#475569" : undefined,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#94a3b8" : undefined,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#90caf9" : undefined,
                borderWidth: 2,
              },
            },
            input: {
              color: isDark ? "#f1f5f9" : undefined,
              fontWeight: 500,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              color: isDark ? "#f1f5f9" : undefined,
            },
          },
        },
        MuiFormControlLabel: {
          styleOverrides: {
            label: {
              fontWeight: 500,
              color: isDark ? "#f1f5f9" : undefined,
            },
          },
        },
        MuiCheckbox: {
          styleOverrides: {
            root: {
              color: isDark ? "#cbd5e1" : undefined,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#f1f5f9" : undefined,
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              color: isDark ? "#f1f5f9" : undefined,
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

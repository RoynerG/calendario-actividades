import "./App.css";
import AppRoutes from "./routes/index";
import { ThemeProvider } from "./contexts/ThemeContext";
import MuiThemeProvider from "./contexts/MuiThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider>
        <AppRoutes />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}
export default App;

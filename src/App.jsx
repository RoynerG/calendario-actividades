import "./App.css";
import AppRoutes from "./routes/index";
import BotonAdminGlobal from "./components/BotonAdminGlobal";
import { ThemeProvider } from "./contexts/ThemeContext";
import MuiThemeProvider from "./contexts/MuiThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider>
        <AppRoutes />
        <BotonAdminGlobal />
      </MuiThemeProvider>
    </ThemeProvider>
  );
}
export default App;

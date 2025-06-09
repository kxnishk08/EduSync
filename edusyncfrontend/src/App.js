import { BrowserRouter } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppNavbar />

        <AppRoutes />

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

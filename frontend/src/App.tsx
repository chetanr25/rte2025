import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DashboardLayout from "./components/layout/DashboardLayout";
import Reports from "./pages/Reports";
import FormTemplates from "./pages/FormTemplates";
import DashboardInfo from "./pages/DashboardInfo";
import Analytics from "./pages/Analytics";
import TemplatesPage from "./pages/Templates";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="" element={<DashboardInfo />} />
          <Route path="reports" element={<Reports />} />
          <Route path="form-templates" element={<TemplatesPage />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import "./App.css";
import "./god.css";
import SideBar from "./component/SideBar/SideBar";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Dashboard from "./component/Dashboard/Dashboard";
import History from "./component/History/History";
import Admin from "./component/Admin/Admin";
import Login from "./component/Login/Login";
import AppBackdrop from "./component/Shared/AppBackdrop";
import MagneticCursor from "./component/Login/MagneticCursor";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const routes = (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );

  return (
    <div className={isHomePage ? "App" : "App inner"}>
      {!isHomePage && (
        <>
          <AppBackdrop />
          <MagneticCursor />
          <SideBar />
        </>
      )}
      {isHomePage ? (
        routes
      ) : (
        // Opacity and translate only: a filter here would stop the glass cards from seeing the 3D backdrop
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {routes}
        </motion.div>
      )}
    </div>
  );
}

export default App;

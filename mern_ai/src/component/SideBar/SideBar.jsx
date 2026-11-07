import React, { useContext } from "react";
import styles from "./SideBar.module.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthContext";

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setLogin, userInfo, setUserinfo } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.clear();
    setLogin(false);
    setUserinfo(null);
    navigate("/");
  };

  return (
    <header className={styles.hudHeader}>
      {/* Left Brand */}
      <div className={styles.brandBlock} onClick={() => navigate("/dashboard")}>
        <span className={styles.brandDot} />
        <span className={styles.brandTitle}>SCOREMYCV</span>
        <span className={styles.versionTag}>OS // 2.0</span>
      </div>

      {/* Center Navigation Pills */}
      <nav className={styles.navLinks}>
        <Link
          to="/dashboard"
          className={`${styles.navItem} ${
            location.pathname === "/dashboard" ? styles.activeNav : ""
          }`}
        >
          <DashboardIcon sx={{ fontSize: 16 }} />
          <span>ANALYZER</span>
        </Link>

        <Link
          to="/history"
          className={`${styles.navItem} ${
            location.pathname === "/history" ? styles.activeNav : ""
          }`}
        >
          <HistoryIcon sx={{ fontSize: 16 }} />
          <span>ARCHIVE</span>
        </Link>

        {userInfo?.role === "admin" && (
          <Link
            to="/admin"
            className={`${styles.navItem} ${
              location.pathname === "/admin" ? styles.activeNav : ""
            }`}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />
            <span>ADMINISTRATION</span>
          </Link>
        )}
      </nav>

      {/* Right User Identity & Logout */}
      <div className={styles.userSection}>
        {userInfo && (
          <div className={styles.userBadge}>
            {userInfo?.photoUrl ? (
              <img
                src={userInfo.photoUrl}
                alt={userInfo.name}
                referrerPolicy="no-referrer"
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {userInfo?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className={styles.userMeta}>
              <span className={styles.userName}>{userInfo.name}</span>
              <span className={styles.userRole}>
                {userInfo.role === "admin" ? "SYS_ADMIN" : "VERIFIED"}
              </span>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogoutIcon sx={{ fontSize: 15 }} />
          <span>LOG OUT</span>
        </button>
      </div>
    </header>
  );
};

export default SideBar;
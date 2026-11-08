import React, { useContext } from "react";
import styles from "./SideBar.module.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthContext";
import { motion } from "framer-motion";

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

  const navItems = [
    {
      path: "/dashboard",
      label: "ANALYZER",
      icon: <DashboardIcon sx={{ fontSize: 16 }} />,
      show: true,
    },
    {
      path: "/history",
      label: "ARCHIVE",
      icon: <HistoryIcon sx={{ fontSize: 16 }} />,
      show: true,
    },
    {
      path: "/admin",
      label: "ADMINISTRATION",
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
      show: userInfo?.role === "admin",
    },
  ];

  return (
    <header className={styles.hudHeader}>
      <div className={styles.brandBlock} onClick={() => navigate("/dashboard")}>
        <span className={styles.brandDot} />
        <span className={styles.brandTitle}>SCOREMYCV</span>
        <span className={styles.versionTag}>HM // 2.0</span>
      </div>

      <nav className={styles.navLinks} aria-label="Primary Workspace Navigation">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${
                  isActive ? styles.activeNavText : ""
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="hudActivePill"
                    className={styles.activePillBg}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <span className={styles.navItemContent}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </Link>
            );
          })}
      </nav>

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
                {userInfo.role === "admin" ? "SYS_ADMIN" : "OPERATOR"}
              </span>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          <LogoutIcon sx={{ fontSize: 15 }} />
          <span>LOG OUT</span>
        </motion.button>
      </div>
    </header>
  );
};

export default SideBar;
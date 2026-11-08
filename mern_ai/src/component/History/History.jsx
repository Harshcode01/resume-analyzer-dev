import React, { useState, useEffect, useContext } from "react";
import styles from "./History.module.css";
import { Skeleton } from "@mui/material";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import { AuthContext } from "../../utils/AuthContext";
import { motion } from "framer-motion";
import CountUp from "../Shared/CountUp";

const History = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoader(true);
      try {
        const results = await axios.get(`/api/resume/get/${userInfo?._id}`);
        setData(results.data.resumes || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoader(false);
      }
    };
    if (userInfo?._id) fetchUserData();
  }, [userInfo]);

  const totalScans = data.length;
  const avgScore = totalScans
    ? Math.round(
        data.reduce((acc, item) => acc + (parseInt(item.score, 10) || 0), 0) /
          totalScans
      )
    : 0;
  const bestScore = totalScans
    ? Math.max(...data.map((item) => parseInt(item.score, 10) || 0))
    : 0;

  return (
    <motion.main
      className={styles.History}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <div>
            <div className={styles.eyebrow}>PERSONAL SCAN ARCHIVE</div>
            <h1 className={styles.title}>Evaluation History</h1>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>TOTAL SCANS</span>
              <span className={styles.statValue}><CountUp to={totalScans} /></span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>AVERAGE MATCH</span>
              <span className={styles.statValue}><CountUp to={avgScore} />%</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>PEAK SCORE</span>
              <span className={styles.statValueAccent}><CountUp to={bestScore} />%</span>
            </div>
          </div>
        </div>

        {loader ? (
          <div className={styles.HistoryCardBlock}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton
                key={n}
                variant="rectangular"
                sx={{
                  borderRadius: "8px",
                  bgcolor: "rgba(255,255,255,0.04)",
                }}
                height={240}
              />
            ))}
          </div>
        ) : (
          <div className={styles.HistoryCardBlock}>
            {data.map((item, idx) => {
              const numericScore = parseInt(item.score, 10) || 0;
              return (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 22,
                    delay: idx * 0.06,
                  }}
                  whileHover={{ y: -4 }}
                  className={styles.HistoryCard}
                >
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.dateTag}>
                        DATED // {item.createdAt?.slice(0, 10)}
                      </span>
                      <h3 className={styles.resumeTitle}>{item.resume_name}</h3>
                    </div>
                    <div className={styles.scoreBadge}>{item.score}%</div>
                  </div>

                  <div className={styles.meterTrack}>
                    <motion.div
                      className={styles.meterFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, numericScore)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <p className={styles.feedbackText}>{item.feedback}</p>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </motion.main>
  );
};

export default withAuthHOC(History);

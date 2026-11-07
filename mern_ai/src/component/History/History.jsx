import React, { useState, useEffect, useContext } from "react";
import styles from "./History.module.css";
import { Skeleton } from "@mui/material";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import { AuthContext } from "../../utils/AuthContext";

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
    <main className={styles.History}>
      <div className={styles.container}>
        {/* Top Banner + Telemetry Stats */}
        <div className={styles.topHeader}>
          <div>
            <div className={styles.eyebrow}>PERSONAL SCAN ARCHIVE</div>
            <h1 className={styles.title}>Evaluation History</h1>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>TOTAL SCANS</span>
              <span className={styles.statValue}>{totalScans}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>AVERAGE MATCH</span>
              <span className={styles.statValue}>{avgScore}%</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>PEAK SCORE</span>
              <span className={styles.statValueAccent}>{bestScore}%</span>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
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
            {data.map((item) => {
              const numericScore = parseInt(item.score, 10) || 0;
              return (
                <article key={item._id} className={styles.HistoryCard}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.dateTag}>
                        DATED // {item.createdAt?.slice(0, 10)}
                      </span>
                      <h3 className={styles.resumeTitle}>
                        {item.resume_name}
                      </h3>
                    </div>
                    <div className={styles.scoreBadge}>{item.score}%</div>
                  </div>

                  {/* Visual Score Progress Bar */}
                  <div className={styles.meterTrack}>
                    <div
                      className={styles.meterFill}
                      style={{ width: `${Math.min(100, numericScore)}%` }}
                    />
                  </div>

                  <p className={styles.feedbackText}>{item.feedback}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default withAuthHOC(History);
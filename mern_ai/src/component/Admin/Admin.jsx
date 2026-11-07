import React, { useState, useEffect } from "react";
import styles from "./Admin.module.css";
import { Skeleton } from "@mui/material";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";

const Admin = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoader(true);
      try {
        const results = await axios.get("api/resume/get");
        setData(results.data.resumes || []);
      } catch (err) {
        console.log(err);
        alert("Something went wrong");
      } finally {
        setLoader(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredData = data.filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = item?.user?.name?.toLowerCase() || "";
    const email = item?.user?.email?.toLowerCase() || "";
    const file = item?.resume_name?.toLowerCase() || "";
    return name.includes(q) || email.includes(q) || file.includes(q);
  });

  return (
    <main className={styles.Admin}>
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <div>
            <div className={styles.eyebrow}>SYSTEM ADMINISTRATION</div>
            <h1 className={styles.title}>Global Candidate Registry</h1>
          </div>

          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter by candidate name, email, or PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.countPill}>{filteredData.length} RECORDS</span>
          </div>
        </div>

        {loader ? (
          <div className={styles.AdminBlock}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton
                key={n}
                variant="rectangular"
                sx={{
                  borderRadius: "8px",
                  bgcolor: "rgba(255,255,255,0.04)",
                }}
                height={250}
              />
            ))}
          </div>
        ) : (
          <div className={styles.AdminBlock}>
            {filteredData.map((item, index) => (
              <article key={item._id || index} className={styles.AdminCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.candidateMeta}>
                    <div className={styles.avatarInitial}>
                      {item?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h2 className={styles.candidateName}>
                        {item?.user?.name || "Candidate"}
                      </h2>
                      <p className={styles.candidateEmail}>
                        {item?.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className={styles.scorePill}>{item.score}%</div>
                </div>

                <div className={styles.fileRow}>
                  <span>DOCUMENT: {item.resume_name}</span>
                </div>

                <p className={styles.feedbackBody}>{item.feedback}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default withAuthHOC(Admin);
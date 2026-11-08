import React, { useContext, useState, useEffect, useRef } from "react";
import styles from "./Dashboard.module.css";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import { AuthContext } from "../../utils/AuthContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ScoreBurst from "../Shared/ScoreBurst";

const LOADING_STEPS = [
  "01 // EXTRACTING RAW TEXT FROM PDF LAYERS...",
  "02 // CROSS-REFERENCING JOB DESCRIPTION REQUIREMENTS...",
  "03 // CALCULATING NEURAL ATS MATCH PROBABILITY...",
];

const Dashboard = () => {
  const [uploadFileText, setUploadFileText] = useState(
    "Drag & drop your PDF resume here, or click to browse"
  );
  const [fileSize, setFileSize] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [burst, setBurst] = useState(0);
  const ringRef = useRef(null);

  const { userInfo } = useContext(AuthContext);
  const prefersReducedMotion = useReducedMotion();

  // Confetti once the score has counted up, for matches of 80 and above
  useEffect(() => {
    const target = parseInt(result?.score, 10) || 0;
    if (target < 80 || prefersReducedMotion) return;
    const t = setTimeout(() => setBurst((n) => n + 1), 1000);
    return () => clearTimeout(t);
  }, [result, prefersReducedMotion]);

  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!result?.score) {
      setAnimatedScore(0);
      return;
    }
    const target = parseInt(result.score, 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [result]);

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setFileError(
        "Invalid file format. Only PDF (.pdf) resumes are accepted."
      );
      setResumeFile(null);
      setFileSize(null);
      setUploadFileText("Drag & drop your PDF resume here, or click to browse");
      return;
    }
    setFileError("");
    setResumeFile(file);
    setUploadFileText(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
  };

  const handleOnChangeFile = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    setResult(null);
    if (!jobDesc.trim() || !resumeFile) {
      setFileError(
        "Please attach a PDF resume and paste the target Job Description."
      );
      return;
    }
    setFileError("");

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_desc", jobDesc);
    formData.append("user", userInfo._id);

    setLoading(true);
    try {
      const response = await axios.post("/api/resume/addResume", formData);
      setResult(response.data.data);
    } catch (err) {
      console.log(err);
      setFileError("Analysis failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = jobDesc.trim() ? jobDesc.trim().split(/\s+/).length : 0;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <motion.main
      className={styles.Dashboard}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className={styles.container}>
        <ScoreBurst trigger={burst} originRef={ringRef} />
        <div className={styles.pageBanner}>
          <div>
            <div className={styles.eyebrow}>
              FORM STUDY // ATS DIAGNOSTIC WORKSPACE
            </div>
            <h1 className={styles.pageTitle}>Resume Match Analyzer</h1>
          </div>
          <div className={styles.instructionPill}>
            <span>01. Upload PDF Resume</span>
            <span className={styles.divider}>/</span>
            <span>02. Paste Complete Job Description</span>
            <span className={styles.divider}>/</span>
            <span>03. Run AI Scan</span>
          </div>
        </div>

        <div className={styles.workspaceGrid}>
          <section className={styles.inputPanel}>
            <motion.div
              className={styles.cardBlock}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : { borderColor: "rgba(255,255,255,0.45)" }
              }
            >
              <div className={styles.cardHeaderRow}>
                <span className={styles.stepTag}>
                  STEP 01 // SOURCE DOCUMENT
                </span>
                <span className={styles.formatBadge}>PDF ONLY</span>
              </div>

              <label
                htmlFor="inputField"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`${styles.dropZone} ${
                  isDragging ? styles.dropZoneActive : ""
                } ${resumeFile ? styles.dropZoneReady : ""}`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  id="inputField"
                  onChange={handleOnChangeFile}
                />
                <div className={styles.dropIconWrap}>
                  {resumeFile ? (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 12 15 15" />
                    </svg>
                  )}
                </div>
                <div className={styles.dropMeta}>
                  <span className={styles.fileNameText}>{uploadFileText}</span>
                  {fileSize ? (
                    <span className={styles.fileSizeSub}>
                      READY FOR PARSING • {fileSize}
                    </span>
                  ) : (
                    <span className={styles.fileSizeSub}>
                      Click to select or drag a .pdf file here
                    </span>
                  )}
                </div>
                <span className={styles.browseBtn}>
                  {resumeFile ? "Change PDF" : "Upload Resume"}
                </span>
              </label>

              <AnimatePresence>
                {fileError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.errorBanner}
                    role="alert"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{fileError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className={styles.cardBlock}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : { borderColor: "rgba(255,255,255,0.45)" }
              }
            >
              <div className={styles.cardHeaderRow}>
                <span className={styles.stepTag}>
                  STEP 02 // TARGET JOB SPECIFICATION
                </span>
                <span className={styles.charCounter}>
                  {wordCount} WORDS • {jobDesc.length} CHARS
                </span>
              </div>

              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className={styles.textArea}
                placeholder="Paste the complete job description, required tech stack, and responsibilities here..."
                rows={9}
              />

              <div className={styles.actionRow}>
                <motion.button
                  whileHover={
                    prefersReducedMotion || loading ? {} : { scale: 1.01, y: -2 }
                  }
                  whileTap={
                    prefersReducedMotion || loading ? {} : { scale: 0.99 }
                  }
                  type="button"
                  onClick={handleUpload}
                  disabled={loading}
                  className={styles.analyzeBtn}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>
                    {loading ? "SCANNING DOCUMENT..." : "Analyze Resume Match"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </section>

          <aside className={styles.outputPanel} aria-live="polite">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={styles.diagnosticCard}
                >
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.stepTag}>NEURAL ENGINE ACTIVE</span>
                    <span className={styles.livePulse}>PROCESSING</span>
                  </div>

                  <div className={styles.skeletonRingWrap}>
                    <div className={styles.spinnerRing} />
                  </div>

                  <div className={styles.stepList}>
                    {LOADING_STEPS.map((msg, idx) => (
                      <div
                        key={msg}
                        className={`${styles.stepRow} ${
                          idx <= stepIndex ? styles.stepRowActive : ""
                        }`}
                      >
                        <span className={styles.stepDot} />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={styles.diagnosticCard}
                >
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.stepTag}>DIAGNOSTIC REPORT</span>
                    <span className={styles.statusComplete}>COMPLETE</span>
                  </div>

                  <div className={styles.scoreRingContainer} ref={ringRef}>
                    <svg className={styles.progressSvg} width="170" height="170">
                      <circle
                        className={styles.progressTrack}
                        cx="85"
                        cy="85"
                        r={radius}
                      />
                      <circle
                        className={styles.progressValue}
                        cx="85"
                        cy="85"
                        r={radius}
                        style={{
                          strokeDasharray: circumference,
                          strokeDashoffset: strokeDashoffset,
                        }}
                      />
                    </svg>
                    <div className={styles.scoreCenterText}>
                      <span className={styles.scoreNumber}>
                        {animatedScore}%
                      </span>
                      <span className={styles.scoreSubLabel}>ATS MATCH</span>
                    </div>
                  </div>

                  <div className={styles.fileTagBar}>
                    <span>FILE: {result.resume_name || uploadFileText}</span>
                  </div>

                  <div className={styles.feedbackBox}>
                    <div className={styles.feedbackTitle}>
                      AI EXECUTIVE FEEDBACK
                    </div>
                    <p className={styles.feedbackBody}>{result.feedback}</p>
                  </div>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.diagnosticCard}
                >
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.stepTag}>TELEMETRY STANDBY</span>
                    <span className={styles.formatBadge}>READY</span>
                  </div>

                  <div className={styles.standbyBody}>
                    <div className={styles.idleCircle}>
                      <span>00%</span>
                    </div>
                    <h3>Awaiting Input</h3>
                    <p>
                      Upload your PDF resume and paste a target job description
                      on the left to generate your ATS match score and tailored
                      AI recommendations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </motion.main>
  );
};

export default withAuthHOC(Dashboard);

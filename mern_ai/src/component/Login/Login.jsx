import React, { useContext } from "react";
import styles from "./Login.module.css";
import GoogleIcon from "@mui/icons-material/Google";
import { auth, provider } from "../../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import Hero3D from "./Hero3D";

const Login = () => {
  const { islogin, setLogin, setUserinfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
      };

      await axios
        .post("/api/user", userData)
        .then((response) => {
          setUserinfo(response.data.user);
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        })
        .catch((err) => {
          console.log(err);
        });

      setLogin(true);
      localStorage.setItem("isLogin", true);
      navigate("/dashboard");
    } catch (err) {
      alert("Something Went Wrong ");
      console.log(err);
    }
  };

  return (
    <div className={styles.HomePage}>
      {/* Fixed 3D Silhouette Valley Canvas */}
      <Hero3D />

      {/* Top Navigation Bar */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          SCOREMYCV
        </div>
        <div className={styles.navActions}>
          {islogin ? (
            <button
              className={styles.navBtnPrimary}
              onClick={() => navigate("/dashboard")}
            >
              Open Dashboard
            </button>
          ) : (
            <button className={styles.navBtnPrimary} onClick={handleLogin}>
              <GoogleIcon sx={{ fontSize: 16 }} />
              <span>Sign up with Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Storytelling Sections */}
      <main className={styles.scrollContent}>
        {/* SECTION 1: HERO */}
        <section className={styles.heroSection}>
          <div className={styles.badge}>ATS NEURAL SCREENING ENGINE V2.0</div>
          <h1 className={styles.heroHeadline}>
            See your resume through the eyes of the algorithm.
          </h1>
          <p className={styles.heroSubtext}>
            Upload your PDF resume and target job description to get an instant
            ATS match score and actionable AI feedback.
          </p>

          <div className={styles.ctaGroup}>
            <button className={styles.googleCtaBtn} onClick={handleLogin}>
              <GoogleIcon sx={{ fontSize: 20, color: "#000000" }} />
              <span>Sign up with Google — Upload Resume</span>
            </button>
            <span className={styles.scrollHint}>
              SCROLL TO FLY THROUGH THE VALLEY ↓
            </span>
          </div>
        </section>

        {/* SECTION 2: 3-STEP STORY */}
        <section className={styles.storySection}>
          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <span className={styles.stepIndex}>01 / EXTRACT</span>
              <h3>PDF Parsing</h3>
              <p>
                Reads your raw PDF layout and extracts technical skills, role
                history, and project architecture.
              </p>
            </div>
            <div className={styles.storyCard}>
              <span className={styles.stepIndex}>02 / BENCHMARK</span>
              <h3>Keyword Alignment</h3>
              <p>
                Cross-checks your experience directly against the exact job
                description requirements.
              </p>
            </div>
            <div className={styles.storyCard}>
              <span className={styles.stepIndex}>03 / OPTIMIZE</span>
              <h3>AI Match Score</h3>
              <p>
                Generates a 0–100% match score with targeted revisions to pass
                automated screening filters.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: FINAL SIGN UP GATE */}
        <section className={styles.finalAuthSection}>
          <div className={styles.authBox}>
            <span className={styles.stepIndex}>READY TO INITIALIZE</span>
            <h2>Start your resume analysis</h2>
            <p>
              Authenticate with your Google account to save your scan history
              and track score improvements.
            </p>
            <button className={styles.googleCtaBtnFull} onClick={handleLogin}>
              <GoogleIcon sx={{ fontSize: 20, color: "#000000" }} />
              <span>Continue with Google</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
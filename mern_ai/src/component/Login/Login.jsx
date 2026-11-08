import React, { useContext, useState, useEffect, useRef } from "react";
import styles from "./Login.module.css";
import { auth, provider } from "../../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import Hero3D from "./Hero3D";
import MagneticCursor from "./MagneticCursor";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const SHOWCASE_PROJECTS = [
  {
    tags: "NEURAL PARSER • PDF • AST • 3D",
    title: "Oryzo ATS Engine",
    gradient: "linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #0038ff 100%)",
    badge: "99.4% ACCURACY",
    subtitle: "Deep structural extraction of multi-column PDF resumes.",
  },
  {
    tags: "LLM • COHERE COMMAND • VECTOR",
    title: "Atlas Semantic Match",
    gradient: "linear-gradient(135deg, #091e1a 0%, #12352f 55%, #10b981 100%)",
    badge: "LATENCY 84MS",
    subtitle: "Real-time keyword alignment against enterprise job descriptions.",
  },
  {
    tags: "WEB • DESIGN • TELEMETRY • 3D",
    title: "Devin Career Copilot",
    gradient: "linear-gradient(135deg, #1f1135 0%, #3b1c54 50%, #ff007f 100%)",
    badge: "TIER-1 PASS",
    subtitle: "Line-by-line executive rewrite suggestions for technical roles.",
  },
  {
    tags: "CONCEPT • BENCHMARK • ANALYTICS",
    title: "Meta: Spatial Score",
    gradient: "linear-gradient(135deg, #001d3d 0%, #003566 50%, #00b4d8 100%)",
    badge: "LIVE HUD",
    subtitle: "Historical score tracking across every software application.",
  },
];

const Login = () => {
  const { islogin, setLogin, setUserinfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const scrollProgressRef = useRef(0);
  const [soundWave, setSoundWave] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      scrollProgressRef.current = v;
    });
  }, [scrollYProgress]);

  // 00:03 - 00:06 Warping 3D Showreel Card Transforms
  const reelRotateX = useTransform(smoothScroll, [0.12, 0.22, 0.3], [28, -8, 0]);
  const reelRotateY = useTransform(smoothScroll, [0.12, 0.22, 0.3], [-18, 12, 0]);
  const reelRotateZ = useTransform(smoothScroll, [0.12, 0.22, 0.3], [-6, 3, 0]);
  const reelScale = useTransform(smoothScroll, [0.12, 0.26, 0.32], [0.72, 0.92, 1]);
  const reelRadius = useTransform(smoothScroll, [0.12, 0.3], ["40px", "20px"]);

  // 00:15 - 00:21 Tablet Bezel Expanding into Fullscreen Space Portal
  const portalWidth = useTransform(
    smoothScroll,
    [0.45, 0.54],
    ["52vw", "100vw"]
  );
  const portalHeight = useTransform(
    smoothScroll,
    [0.45, 0.54],
    ["56vh", "100vh"]
  );
  const portalRadius = useTransform(
    smoothScroll,
    [0.45, 0.54],
    ["32px", "0px"]
  );
  const portalBezel = useTransform(
    smoothScroll,
    [0.45, 0.54],
    ["14px solid #1e222d", "0px solid #000000"]
  );

  // 00:27 - 00:32 Electric Blue Chamber Background Flash
  const portalBg = useTransform(
    smoothScroll,
    [0.52, 0.72, 0.76, 0.85, 0.89],
    ["#020305", "#04060c", "#002bff", "#002bff", "#020305"]
  );

  // Chromatic Dispersion Ring Opacity (00:18 - 00:25)
  const haloOpacity = useTransform(
    smoothScroll,
    [0.53, 0.58, 0.72, 0.78],
    [0, 1, 0.85, 0]
  );

  // Floating Sticker Badges Opacity (00:33 - 00:35)
  const stickersOpacity = useTransform(
    smoothScroll,
    [0.82, 0.86, 0.91, 0.94],
    [0, 1, 1, 0]
  );

  // Footer Neon Progress Line (00:35 - 00:37)
  const footerLineScale = useTransform(smoothScroll, [0.9, 1], [0, 1]);

  const authBusyRef = useRef(false);

  const handleLogin = async () => {
    if (authBusyRef.current) return;
    authBusyRef.current = true;
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
      const closedByUser =
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request";
      if (!closedByUser) {
        alert("Something Went Wrong ");
        console.log(err);
      }
    } finally {
      authBusyRef.current = false;
    }
  };

  // One entry point for every sign in / sign up spot on the page
  const handleCta = () => (islogin ? navigate("/dashboard") : handleLogin());

  return (
    <div className={styles.LusionPage}>
      {/* Fixed 3D Multi-World Canvas (Crosses Pit + Cobalt Tube + Space Tunnel) */}
      <Hero3D scrollProgressRef={scrollProgressRef} />
      <MagneticCursor />

      {/* =====================================================================
          LUSION FLOATING HEADER (00:00 - 00:37)
      ===================================================================== */}
      <header className={styles.lusionHeader}>
        <div className={styles.logoText} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          SCOREMYCV
        </div>

        <div className={styles.headerPills}>
          <button
            type="button"
            onClick={() => setSoundWave(!soundWave)}
            className={styles.waveCircleBtn}
            aria-label="Toggle kinetic wave"
          >
            <span className={soundWave ? styles.waveLineActive : styles.waveLineFlat}>
              〰
            </span>
          </button>

          <button
            type="button"
            onClick={handleCta}
            data-magnetic
            className={styles.letsTalkBtn}
          >
            <span>{islogin ? "OPEN DASHBOARD" : "SIGN UP WITH GOOGLE"}</span>
            <span className={styles.talkDot} />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={styles.menuPillBtn}
          >
            <span>{menuOpen ? "CLOSE" : "MENU"}</span>
            <span className={styles.menuDots}>••</span>
          </button>
        </div>
      </header>

      {/* Quick Dropdown Drawer when MENU •• is clicked */}
      {menuOpen && (
        <div className={styles.menuModal}>
          <div className={styles.menuCard}>
            <span className={styles.menuEyebrow}>NAVIGATION // OS 3.0</span>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleCta();
              }}
              className={styles.menuLinkBtn}
            >
              01. {islogin ? "Open dashboard" : "Sign up with Google"} →
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" });
              }}
              className={styles.menuLinkBtn}
            >
              02. Explore AI Capabilities →
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.scrollTo({ top: window.innerHeight * 4.5, behavior: "smooth" });
              }}
              className={styles.menuLinkBtn}
            >
              03. Enter Tesseract Portal →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          ACT I (00:00 - 00:01): DARK 3D CROSSES PIT + "+" CROSSHAIR BAR
      ===================================================================== */}
      <section className={styles.actCrossesHero}>
        <div className={styles.heroOverlayCopy}>
          <span className={styles.heroMicroTag}>
            INTERACTIVE 3D ATS ENGINE • MOVE CURSOR TO REPEL
          </span>
          <h1
            className={styles.heroSubtleTitle}
            aria-label="Next-Gen Resume Intelligence"
          >
            {["Next-Gen", "Resume", "Intelligence"].map((word, i) => (
              <span key={word} className={styles.heroWordMask} aria-hidden="true">
                <motion.span
                  className={styles.heroWord}
                  initial={{ y: "110%", rotate: 4 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.25 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <button
            type="button"
            onClick={handleCta}
            data-magnetic
            className={styles.heroGooglePill}
          >
            <span>Sign up with Google — Free ATS Scan</span>
            <span>→</span>
          </button>
        </div>

        {/* Exact "+  +  SCROLL TO EXPLORE  +  +" Bar from 00:00 */}
        <div className={styles.crosshairBar}>
          <span>+</span>
          <span>+</span>
          <span className={styles.scrollExploreLabel}>SCROLL TO EXPLORE</span>
          <span>+</span>
          <span>+</span>
        </div>
      </section>

      {/* =====================================================================
          ACT II (00:01 - 00:13): EDITORIAL LIGHT SECTION & WARPING SHOWREEL
      ===================================================================== */}
      <section className={styles.actEditorialLight}>
        <div className={styles.editorialContainer}>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className={styles.giantEditorialTitle}
          >
            Bold Careers,
            <br />
            Decoded by AI
          </motion.h2>

          <div className={styles.editorialSplitRow}>
            <div className={styles.editorialSpacer} />
            <div className={styles.editorialRightBlock}>
              <p className={styles.editorialParagraph}>
                We combine neural PDF parsing, Cohere LLM benchmarking, and
                real-time keyword telemetry to create resume diagnostics that
                feel visually striking and technically seamless. Upload your CV
                and see how automated hiring algorithms score your profile.
              </p>
              <button
                type="button"
                onClick={handleCta}
                data-magnetic
                className={styles.ourApproachPill}
              >
                <span className={styles.approachDot} />
                <span>SIGN UP WITH GOOGLE</span>
              </button>
            </div>
          </div>

          {/* 00:03 - 00:06 3D Warping Showreel Card ("PLAY ▶ REEL") */}
          <div className={styles.reelPerspectiveStage}>
            <motion.div
              style={{
                rotateX: reelRotateX,
                rotateY: reelRotateY,
                rotateZ: reelRotateZ,
                scale: reelScale,
                borderRadius: reelRadius,
              }}
              onClick={handleCta}
              className={styles.warpingReelCard}
            >
              <div className={styles.reelVortexBg}>
                <div className={styles.reelSwirlCore} />
              </div>

              <div className={styles.playReelBanner}>
                <span>LAUNCH</span>
                <div className={styles.playButtonPill}>▶</div>
                <span>SCANNER</span>
              </div>

              <div className={styles.reelBottomCaption}>
                <span>CLICK TO AUTHENTICATE WITH GOOGLE & UPLOAD PDF</span>
                <span>ATS ENGINE // V3.0</span>
              </div>
            </motion.div>

            {/* Crosshair Divider under Reel (00:06) */}
            <div className={styles.inlineCrossRow}>
              <span>+</span>
              <span>+</span>
              <span>+</span>
              <span>+</span>
              <span>+</span>
            </div>
          </div>

          {/* 00:07 - 00:13 Featured Work / Capabilities 2-Column Grid */}
          <div className={styles.featuredHeaderBlock}>
            <h2 className={styles.featuredGiantHeading}>Featured Capabilities</h2>
          </div>

          <div className={styles.bentoGrid}>
            {SHOWCASE_PROJECTS.map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -8 }}
                onClick={handleCta}
                className={styles.projectCard}
              >
                <div className={styles.projectMetaTop}>
                  <span className={styles.projectTags}>{item.tags}</span>
                  <div className={styles.projectTitleRow}>
                    <span className={styles.hoverArrow}>→</span>
                    <h3 className={styles.projectName}>{item.title}</h3>
                  </div>
                </div>

                <div
                  className={styles.projectVisualBox}
                  style={{ background: item.gradient }}
                >
                  <div className={styles.visualBadge}>{item.badge}</div>
                  <div className={styles.visualMockWindow}>
                    <div className={styles.mockDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <p>{item.subtitle}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className={styles.seeAllCenterWrap}>
            <button
              type="button"
              onClick={handleCta}
              data-magnetic
                className={styles.ourApproachPill}
            >
              <span className={styles.approachDot} />
              <span>START YOUR FREE RESUME SCAN</span>
            </button>
          </div>

          {/* 00:14 Lead-in to Tablet Zoom */}
          <div className={styles.immersiveLeadIn}>
            <h2 className={styles.immersiveTitle}>
              Where Raw Resumes
              <br />
              Become Shortlisted
              <br />
              Offers
            </h2>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ACT III & IV (00:15 - 00:34): TABLET ZOOM -> TESSERACT TUNNEL PORTAL
      ===================================================================== */}
      <section className={styles.actPortalScrollTrack}>
        <div className={styles.stickyPortalViewport}>
          <motion.div
            style={{
              width: portalWidth,
              height: portalHeight,
              borderRadius: portalRadius,
              border: portalBezel,
              backgroundColor: portalBg,
            }}
            className={styles.expandingTabletFrame}
          >
            {/* Chromatic Aberration Rainbow Lens Ring (00:18 - 00:24) */}
            <motion.div
              style={{ opacity: haloOpacity }}
              className={styles.chromaticHaloRing}
            />

            {/* Giant Space Typography (00:19 - 00:21) */}
            <div className={styles.portalCenterTypography}>
              <span className={styles.portalEyebrow}>
                NEURAL TELEMETRY TUNNEL
              </span>
              <h2 className={styles.portalGiantHeading}>
                STEP INTO A NEW WORLD
                <br />
                AND LET YOUR CAREER
                <br />
                RUN WILD
              </h2>
            </div>

            {/* Floating Neon Stickers & Badges (00:34) */}
            <motion.div
              style={{ opacity: stickersOpacity }}
              className={styles.stickerLayer}
            >
              <div className={`${styles.neonSticker} ${styles.sticker1}`}>
                98% ATS MATCH ★
              </div>
              <div className={`${styles.neonSticker} ${styles.sticker2}`}>
                COHERE AI ⚡
              </div>
              <div className={`${styles.neonSticker} ${styles.sticker3}`}>
                PDF PARSER ✓
              </div>
              <div className={`${styles.neonSticker} ${styles.sticker4}`}>
                ZERO FLUFF ✦
              </div>
            </motion.div>

            {/* Bottom Center "↓ CONTINUE TO SCROLL ↓" / Auth Pill (00:33 - 00:34) */}
            <div className={styles.portalBottomPillWrap}>
              <button
                type="button"
                onClick={handleCta}
                className={styles.continueScrollPill}
              >
                <span>↓</span>
                <span>SIGN UP WITH GOOGLE TO SCAN</span>
                <span>↓</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          ACT V (00:35 - 00:37): LUSION SPLIT WHITE / BLACK FOOTER CURTAIN
      ===================================================================== */}
      <footer className={styles.lusionFooter}>
        {/* Upper White Editorial Deck */}
        <div className={styles.footerWhiteDeck}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <p>
                Maharashtra, India
                <br />
                ScoreMyCV Neural Labs
              </p>
              <div className={styles.footerLinks}>
                <a href="#top">GitHub</a>
                <a href="#top">LinkedIn</a>
                <a href="#top">Documentation</a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <div className={styles.footerBlock}>
                <span className={styles.footerLabel}>Candidate Support</span>
                <p>support@scoremycv.ai</p>
              </div>
              <div className={styles.footerBlock}>
                <span className={styles.footerLabel}>Enterprise API</span>
                <p>engine@scoremycv.ai</p>
              </div>
            </div>

            <div className={styles.footerColWide}>
              <h3 className={styles.newsletterHeading}>
                Ready to benchmark
                <br />
                your resume?
              </h3>
              <div
                onClick={handleCta}
                className={styles.footerInputBox}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCta();
                  }
                }}
              >
                <span>Click to authenticate with your Google account</span>
                <span className={styles.footerInputArrow}>→</span>
              </div>
            </div>
          </div>

          <div className={styles.footerBottomMeta}>
            <span>©2026 SCOREMYCV AI</span>
            <span>R&D: NEURAL ATS LABS</span>
            <span>BUILT WITH THREE.JS & FRAMER MOTION</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={styles.scrollTopCircle}
              aria-label="Scroll to top"
            >
              ↑
            </button>
          </div>
        </div>

        {/* Lower Pitch-Black "ABOUT US / NEXT PAGE" Curtain (00:36) */}
        <div className={styles.footerBlackCurtain} onClick={handleCta}>
          <div className={styles.curtainTopRow}>
            <span className={styles.keepScrollingText}>
              CLICK OR{" "}
              <button
                type="button"
                className={styles.signInLink}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCta();
                }}
              >
                SIGN IN
              </button>
              <br />
              TO LAUNCH WORKSPACE
            </span>
          </div>

          <div className={styles.curtainMainRow}>
            <h2 className={styles.curtainAboutTitle}>SIGN UP WITH GOOGLE</h2>

            <div className={styles.nextPageProgressWrap}>
              <span className={styles.nextPageLabel}>LAUNCH APP</span>
              <div className={styles.nextPageTrack}>
                <motion.div
                  style={{ scaleX: footerLineScale }}
                  className={styles.nextPageFill}
                />
              </div>
              <span>→</span>
            </div>
          </div>

          <div className={styles.curtainCrossRow}>
            <span>+</span>
            <span>+</span>
            <span>+</span>
            <span>+</span>
            <span>+</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;

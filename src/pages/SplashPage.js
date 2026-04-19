import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

function SplashPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setFading] = useState(false);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1.5));
    }, 45);

    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const redirectTimer = setTimeout(() => navigate('/home'), 3500);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        fontFamily: t.fontSans,
        background: t.bg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity: isFadingOut ? 0 : 1,
        transition: "opacity 0.6s ease",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Background lines */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "1px",
              height: "40%",
              background: `linear-gradient(to bottom, transparent, rgba(190,24,93,${0.04 + i * 0.015}), transparent)`,
              left: `${15 + i * 18}%`,
              top: "30%",
              transform: `rotate(${-10 + i * 5}deg)`,
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp 0.9s ease both" }}>

        // ... (rest of the SplashPage component is the same)

{/* Logo */}
<img
  src="/logo.png"
  alt="TheFolio"
  onError={(e) => {
    e.target.src = "https://placehold.co/80x80?text=Logo";
  }}
  style={{
    width: "80px",
    height: "auto", // 1. Allow the height to scale naturally
    // borderRadius: "50%", // REMOVED: Removes the circular shape
    marginBottom: "20px",
    animation: "float 3s ease-in-out infinite",
    // 2. Adjust the shadow to be more subtler or glow around the logo's shape
    boxShadow: "0 8px 32px rgba(190,24,93,0.3)", 
    objectFit: "contain", // 3. Ensure the whole logo is visible without cropping
    // backgroundColor: "#fff", // REMOVED: Removes the white background
    // border: "2px solid rgba(190,24,93,0.3)" // REMOVED: Removes the circular border
  }}
/>

// ... (rest of the SplashPage component is the same)

        <h1
          style={{
            fontFamily: t.fontSerif,
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "400",
            fontStyle: "italic",
            color: t.text,
            marginBottom: "30px",
          }}
        >
          The Folio
        </h1>

        {/* Progress Bar ONLY (spinner removed) */}
        <div style={{ width: "250px", margin: "0 auto 20px" }}>
          <div
            style={{
              height: "4px",
              background: t.border,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: t.pink,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* Loading text */}
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.textMuted,
            fontWeight: "500",
          }}
        >
          Loading
          <span style={{ width: "20px", display: "inline-block" }}>{dots}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }

        @keyframes float {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default SplashPage;

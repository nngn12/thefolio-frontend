import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

function SplashPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = getTheme(isDark);

  // States from the 1st design
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setFading] = useState(false);

  useEffect(() => {
    // Logic for the jumping dots (...)
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    // Logic for the linear progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1.5));
    }, 45);

    // Timers for transition and redirect
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
    <div style={{
      fontFamily: t.fontSans,
      background: t.bg,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      opacity: isFadingOut ? 0 : 1,
      transition: "opacity 0.6s ease",
      overflow: "hidden"
    }}>
      {/* Cinematic background lines from 2nd design */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: "1px",
            height: "40%",
            background: `linear-gradient(to bottom, transparent, rgba(190,24,93,${0.04 + i * 0.015}), transparent)`,
            left: `${15 + i * 18}%`,
            top: "30%",
            transform: `rotate(${-10 + i * 5}deg)`,
          }} />
        ))}
      </div>

      <div style={{ textAlign: "center", zIndex: 1, animation: "fadeUp 0.9s ease both" }}>
        {/* Logo with Floating Animation */}
        <img src="/logo.png" alt="TheFolio" 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            marginBottom: "20px",
            animation: "float 3s ease-in-out infinite",
            boxShadow: "0 8px 32px rgba(190,24,93,0.2)",
            objectFit: "cover"
          }} 
        />
        
        <h1 style={{
          fontFamily: t.fontSerif,
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: "400",
          fontStyle: "italic",
          color: t.text,
          letterSpacing: "-0.01em",
          marginBottom: "30px",
        }}>
          The Folio
        </h1>

        {/* Loader Row (Progress bar + Circular loader) */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "15px", 
          marginBottom: "20px",
          width: "250px",
          margin: "0 auto 20px"
        }}>
          <div style={{
            width: "24px", height: "24px",
            borderRadius: "50%",
            border: `2px solid ${t.border}`,
            borderTop: `2px solid ${t.pink}`,
            animation: "spin 1s linear infinite",
            flexShrink: 0
          }} />
          
          <div style={{
            flexGrow: 1,
            height: "4px",
            background: t.border,
            borderRadius: "10px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: t.pink,
              transition: "width 0.1s linear"
            }} />
          </div>
        </div>

        {/* Loading Text with Dynamic Dots */}
        <div style={{
          fontSize: "13px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: t.textMuted,
          fontWeight: "500",
        }}>
          Loading<span style={{ display: "inline-block", width: "20px", textAlign: "left" }}>{dots}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default SplashPage;

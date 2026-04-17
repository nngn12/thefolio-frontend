import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    if (location.pathname === "/") return null;

    const go = (path) => navigate(path);
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => setShowLogoutModal(true);
    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate("/login");
    };
    const cancelLogout = () => setShowLogoutModal(false);

    const navBg = isDark ? "rgba(15,5,15,0.90)" : "rgba(255,255,255,0.80)";
    const borderCol = isDark ? "rgba(236,72,153,0.25)" : "rgba(236,72,153,0.18)";
    const textCol = isDark ? "#f3f4f6" : "#1f2937";
    const mutedCol = isDark ? "#9ca3af" : "#6b7280";

    const linkStyle = (path) => ({
        padding: "6px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        background: isActive(path)
            ? (isDark ? "rgba(236,72,153,0.18)" : "linear-gradient(135deg,#fce7f3,#e0f2fe)")
            : "transparent",
        color: isActive(path) ? "#ec4899" : mutedCol,
        border: "none",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    });

    const authBtn = (variant) => ({
        padding: "6px 16px",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        border: variant === "outline" ? "2px solid #ec4899" : "none",
        background: variant === "fill" ? "linear-gradient(135deg,#ec4899,#f472b6)" : "transparent",
        color: variant === "fill" ? "white" : "#ec4899",
        transition: "transform 0.2s ease",
    });

    const profileSrc = user?.profile_pic?.startsWith("http") ? user.profile_pic : null;

    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 100,
            background: navBg, backdropFilter: "blur(14px)",
            borderBottom: `1px solid ${borderCol}`,
            boxShadow: "0 2px 14px rgba(236,72,153,0.09)",
            fontFamily: "'Segoe UI', sans-serif",
        }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 18px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                {/* LOGO */}
                <div onClick={() => go("/home")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <img src="/logo.png" alt="logo" style={{ width: "32px", height: "32px" }} />
                    <span style={{ fontWeight: "800", background: "linear-gradient(135deg,#ec4899,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Captured Memories
                    </span>
                </div>

                {/* NAV LINKS */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={linkStyle("/home")} onClick={() => go("/home")}>Home</span>
                    <span style={linkStyle("/about")} onClick={() => go("/about")}>About</span>
                    <span style={linkStyle("/contact")} onClick={() => go("/contact")}>Contact</span>

                    {/* DYNAMIC DASHBOARD LINK */}
                    {user && (
                        <span
                            style={linkStyle(user.role === "admin" ? "/admin" : "/dashboard")}
                            onClick={() => go(user.role === "admin" ? "/admin" : "/dashboard")}
                        >
                            {user.role === "admin" ? "🛠 Admin Panel" : "📊 Dashboard"}
                        </span>
                    )}

                    {user && (
                        <span style={linkStyle("/create")} onClick={() => go("/create")}>
                            + New Post
                        </span>
                    )}
                </div>

                {/* RIGHT SIDE (Theme, Profile, Auth) */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: "46px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", position: "relative",
                            background: isDark ? "linear-gradient(135deg,#ec4899,#f472b6)" : "rgba(0,0,0,0.1)",
                        }}
                    >
                        <div style={{
                            position: "absolute", top: "2px", left: isDark ? "22px" : "2px",
                            width: "20px", height: "20px", borderRadius: "50%", background: "white",
                            transition: "left 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px"
                        }}>
                            {isDark ? "🌙" : "☀️"}
                        </div>
                    </button>

                    {user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                onClick={() => go("/profile")}
                                style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: "linear-gradient(135deg,#ec4899,#f472b6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontWeight: "bold", fontSize: "13px", cursor: "pointer", overflow: "hidden"
                                }}
                            >
                                {profileSrc ? <img src={profileSrc} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: "13px", color: textCol, fontWeight: "500" }}>{user.name?.split(" ")[0]}</span>
                            <button style={authBtn("outline")} onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button style={authBtn("outline")} onClick={() => go("/login")}>Login</button>
                            <button style={authBtn("fill")} onClick={() => go("/register")}>Register</button>
                        </div>
                    )}
                </div>
            </div>

            {/* LOGOUT MODAL */}
            {showLogoutModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div style={{ background: isDark ? "#1f1f1f" : "#fff", padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: `1px solid ${borderCol}`, width: "300px" }}>
                        <h3 style={{ marginBottom: "12px", color: textCol }}>Sign Out?</h3>
                        <p style={{ color: mutedCol, fontSize: "14px", marginBottom: "24px" }}>Are you sure you want to log out of your session?</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={cancelLogout} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${borderCol}`, background: "none", color: textCol, cursor: "pointer" }}>Cancel</button>
                            <button onClick={confirmLogout} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#ef4444", color: "white", fontWeight: "600", cursor: "pointer" }}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
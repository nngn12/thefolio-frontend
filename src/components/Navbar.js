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
    const border = isDark ? "rgba(236,72,153,0.25)" : "rgba(236,72,153,0.18)";
    const textCol = isDark ? "#f3f4f6" : "#1f2937";
    const mutedCol = isDark ? "#9ca3af" : "#6b7280";

    const link = (path) => ({
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
    });

    const authBtn = (variant) => ({
        padding: "6px 16px",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "700",
        border: variant === "outline" ? "2px solid #ec4899" : "none",
        background: variant === "fill" ? "linear-gradient(135deg,#ec4899,#f472b6)" : "transparent",
        color: variant === "fill" ? "white" : "#ec4899",
    });

    const profileSrc = user?.profile_pic?.startsWith("http") ? user.profile_pic : null;

    return (
        <nav style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: navBg,
            backdropFilter: "blur(14px)",
            borderBottom: `1px solid ${border}`,
            boxShadow: "0 2px 14px rgba(236,72,153,0.09)",
            fontFamily: "'Segoe UI', sans-serif",
        }}>
            <div style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "0 18px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>

                {/* LEFT SIDE */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                    {/* LOGO */}
                    <div
                        onClick={() => go("/home")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                    >
                        <img src="/logo.png" alt="logo" style={{ width: "32px", height: "32px" }} />
                        <span style={{
                            background: "linear-gradient(135deg,#ec4899,#60a5fa)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: "bold"
                        }}>
                            Captured Memories
                        </span>
                    </div>

                    {/* DASHBOARD FIRST */}
                    {user && (
                        <span
                            style={link(user.role === "admin" ? "/admin" : "/dashboard")}
                            onClick={() => go(user.role === "admin" ? "/admin" : "/dashboard")}
                        >
                            {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                        </span>
                    )}

                    <span style={link("/home")} onClick={() => go("/home")}>Home</span>
                    <span style={link("/about")} onClick={() => go("/about")}>About</span>
                    <span style={link("/contact")} onClick={() => go("/contact")}>Contact</span>
                </div>

                {/* RIGHT SIDE */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                    {/* THEME TOGGLE */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: "50px",
                            height: "26px",
                            borderRadius: "13px",
                            border: "none",
                            cursor: "pointer",
                            position: "relative",
                            background: isDark
                                ? "linear-gradient(135deg,#ec4899,#f472b6)"
                                : "rgba(0,0,0,0.13)",
                        }}
                    >
                        <div style={{
                            position: "absolute",
                            top: "2px",
                            left: isDark ? "24px" : "2px",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "white",
                            transition: "left 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                        }}>
                            {isDark ? "🌙" : "☀️"}
                        </div>
                    </button>

                    {/* USER SECTION */}
                    {user ? (
                        <>
                            <div
                                onClick={() => go("/profile")}
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    background: "linear-gradient(135deg,#ec4899,#f472b6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                            >
                                {profileSrc
                                    ? <img src={profileSrc} alt="av" style={{ width: "100%", height: "100%" }} />
                                    : user.name?.[0]?.toUpperCase()
                                }
                            </div>

                            <span style={{ fontSize: "13px", color: textCol }}>
                                {user.name?.split(" ")[0]}
                            </span>

                            <button style={authBtn("outline")} onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button style={authBtn("outline")} onClick={() => go("/login")}>
                                Login
                            </button>
                            <button style={authBtn("fill")} onClick={() => go("/register")}>
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* LOGOUT MODAL */}
            {showLogoutModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <div style={{
                        background: isDark ? "#111" : "#fff",
                        padding: "24px",
                        borderRadius: "12px",
                        textAlign: "center",
                        color: textCol
                    }}>
                        <p>Are you sure you want to log out?</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                            <button onClick={cancelLogout}>Cancel</button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    background: "#ec4899",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "6px 12px",
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
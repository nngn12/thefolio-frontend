import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const UserDashboard = () => {
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [pRes, mRes] = await Promise.all([
                    API.get("/posts/user/me"),
                    API.get("/messages/inbox")
                ]);

                setPosts(pRes.data);
                setMessages(mRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const cardStyle = {
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: isDark ? "none" : "0 6px 18px rgba(0,0,0,0.06)",
        transition: "0.3s ease",
    };

    const hoverCard = {
        cursor: "pointer",
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.bg,
                color: t.text
            }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div style={{ background: t.bg, minHeight: "100vh", padding: "40px 20px" }}>

            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                {/* HEADER */}
                <div style={{ marginBottom: "30px" }}>
                    <h1 style={{
                        fontFamily: t.fontSerif,
                        fontStyle: "italic",
                        color: t.text,
                        fontSize: "34px",
                        marginBottom: "6px"
                    }}>
                        Member Dashboard
                    </h1>

                    <p style={{ color: t.textMuted, margin: 0 }}>
                        Overview of your activity and messages
                    </p>
                </div>

                {/* STATS CARDS */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "24px"
                }}>
                    <div style={cardStyle}>
                        <h3 style={{ color: t.pink, margin: 0 }}>Posts</h3>
                        <p style={{ fontSize: "28px", margin: "10px 0", color: t.text }}>
                            {posts.length}
                        </p>
                        <span style={{ color: t.textMuted, fontSize: "12px" }}>
                            Total created
                        </span>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={{ color: t.pink, margin: 0 }}>Messages</h3>
                        <p style={{ fontSize: "28px", margin: "10px 0", color: t.text }}>
                            {messages.length}
                        </p>
                        <span style={{ color: t.textMuted, fontSize: "12px" }}>
                            Inbox items
                        </span>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={{ color: t.pink, margin: 0 }}>Status</h3>
                        <p style={{ fontSize: "18px", margin: "12px 0", color: "green" }}>
                            Active
                        </p>
                        <span style={{ color: t.textMuted, fontSize: "12px" }}>
                            Account state
                        </span>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "20px"
                }}>

                    {/* POSTS */}
                    <div style={cardStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "16px" }}>
                            Your Posts
                        </h3>

                        {posts.length === 0 ? (
                            <p style={{ color: t.textMuted }}>No posts yet.</p>
                        ) : (
                            posts.map((p) => (
                                <div
                                    key={p.id}
                                    style={{
                                        padding: "12px",
                                        borderBottom: `1px solid ${t.border}`,
                                        transition: "0.2s",
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = t.bg}
                                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <h4 style={{ margin: 0, color: t.text }}>
                                        {p.title}
                                    </h4>

                                    <span style={{
                                        fontSize: "12px",
                                        color: t.textMuted
                                    }}>
                                        {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* MESSAGES */}
                    <div style={cardStyle}>
                        <h3 style={{ color: t.pink, marginBottom: "16px" }}>
                            Messages
                        </h3>

                        {messages.length === 0 ? (
                            <p style={{ color: t.textMuted }}>No messages.</p>
                        ) : (
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "10px",
                                        marginBottom: "12px",
                                        background: isDark ? "#1a1a1a" : "#fafafa",
                                        border: `1px solid ${t.border}`
                                    }}
                                >
                                    <p style={{
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        color: t.text,
                                        marginBottom: "6px"
                                    }}>
                                        Admin Reply
                                    </p>

                                    <p style={{
                                        fontSize: "14px",
                                        color: t.textMuted,
                                        margin: 0
                                    }}>
                                        {m.admin_reply}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
